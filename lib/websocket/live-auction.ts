import type { Auction, AuctionSnapshot } from "../auction/types";
import { applyBid } from "../auction/reducer";
import { normalizeMessage, type AuctionEvent } from "./protocol";

export type Connection = {
  status: "connecting" | "subscribing" | "syncing" | "live" | "reconnecting" | "offline" | "idle";
  retryAt: number | null;
  message: string | null;
};
export type Clock = { serverTimeMs: number; monotonicTimeMs: number; source: "server" | "local" };
export type LiveState = { auction: Auction; connection: Connection; clock: Clock | null; connectionFailure: string | null; hasSynced: boolean };
export type LiveAction =
  | { type: "reset"; auction: Auction }
  | { type: "connection"; connection: Connection }
  | { type: "snapshot"; auction: Auction; clock: Clock }
  | { type: "clock"; clock: Clock }
  | { type: "event"; event: AuctionEvent };

export function initialLiveState(auction: Auction): LiveState {
  return { auction, clock: null, connectionFailure: null, hasSynced: false, connection: {
    status: auction.state === "LIVE" ? "connecting" : "idle", retryAt: null, message: null,
  } };
}

export function replay(auction: Auction, events: AuctionEvent[]): Auction {
  const seen = new Set(auction.bids.map((bid) => bid.id));
  for (const event of events) {
    // Terminal socket events are hints, never authoritative page state.
    if (event.type === "bid_placed" && !seen.has(event.bid.id)) {
      seen.add(event.bid.id);
      auction = applyBid(auction, event.bid);
    }
  }
  return auction;
}

export function liveReducer(state: LiveState, action: LiveAction): LiveState {
  switch (action.type) {
    case "reset": return initialLiveState(action.auction);
    case "connection": return {
      ...state,
      connection: action.connection,
      // A retry is not a recovery: retain the warning until reconciliation succeeds.
      connectionFailure: action.connection.status === "live" || action.connection.status === "idle"
        ? null
        : action.connection.message && (action.connection.status === "offline" || action.connection.status === "reconnecting")
          ? action.connection.message : state.connectionFailure,
    };
    case "snapshot": return { ...state, auction: action.auction, clock: action.clock, hasSynced: true };
    case "clock": return { ...state, clock: action.clock };
    case "event": return { ...state, auction: replay(state.auction, [action.event]) };
  }
}

const TIMEOUT = 10_000;
const MAX_CLOSE_CHECKS = 4;

export type LiveAuctionSession = {
  reconcile(): void;
  dispose(): void;
};

/**
 * One effect owns one session and its reconciliation work. Every reconnect
 * invalidates previous asynchronous work; an open socket is not synchronized data.
 * Disposal releases the connection, requests, timers, and browser listeners.
 */
export function startLiveAuction(
  initialAuction: Auction,
  dispatch: (action: LiveAction) => void,
  getAuction: (slug: string, signal?: AbortSignal) => Promise<AuctionSnapshot>,
): LiveAuctionSession {
  let auction = initialAuction;
  let socket: WebSocket | null = null;
  let abort: AbortController | null = null;
  let generation = 0;
  let disposed = false;
  let attempts = 0;
  let closeChecks = 0;
  let finalizing = false;
  let endedHint: { deadlineMs: number | null } | null = null;
  let settled = auction.state !== "LIVE";
  let paused = false;
  let subscribed = false;
  let buffering = true;
  let buffer: AuctionEvent[] = [];
  let removeSocketListeners = () => {};
  const timers = new Set<ReturnType<typeof setTimeout>>();

  function later(callback: () => void, delay: number) {
    const timer = setTimeout(() => { timers.delete(timer); callback(); }, delay);
    timers.add(timer);
    return timer;
  }
  function cancel(timer: ReturnType<typeof setTimeout>) {
    clearTimeout(timer);
    timers.delete(timer);
  }
  function connection(status: Connection["status"], message: string | null = null, retryAt: number | null = null) {
    if (!disposed) dispatch({ type: "connection", connection: { status, message, retryAt } });
  }
  function clearTransport() {
    generation++;
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
    abort?.abort();
    abort = null;
    removeSocketListeners();
    removeSocketListeners = () => {};
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        try { socket.send(JSON.stringify({ type: "unsubscribe", auction_id: auction.id })); } catch { /* closed concurrently */ }
      }
      try { socket.close(); } catch { /* browser may already have closed it */ }
    }
    socket = null;
    subscribed = false;
    buffering = true;
    buffer = [];
  }
  function fail(message: string) {
    clearTransport();
    if (disposed) return;
    if (!navigator.onLine) { connection("offline", "Sin conexión. Los datos pueden estar desactualizados."); return; }
    const delay = Math.min(30_000, 1_000 * 2 ** Math.min(attempts++, 5)) * (0.75 + Math.random() * 0.25);
    connection("reconnecting", message, Date.now() + delay);
    later(connect, delay);
  }
  function send(value: object) {
    try { socket!.send(JSON.stringify(value)); return true; }
    catch { fail("Se perdió la conexión. Reintentando…"); return false; }
  }

  async function sync() {
    if (disposed || abort) return;
    buffering = true;
    connection("syncing", "Actualizando datos de la subasta…");
    const current = generation;
    const controller = new AbortController();
    abort = controller;
    const start = performance.now();
    const timeout = later(() => fail("La actualización tardó demasiado. Los datos pueden estar desactualizados."), TIMEOUT);
    try {
      const snapshot = await getAuction(auction.slug, controller.signal);
      if (disposed || current !== generation) return;
      cancel(timeout);
      abort = null;
      if (!snapshot.auction || snapshot.auction.id !== auction.id) throw new Error("La subasta no está disponible.");
      const now = performance.now();
      const server = snapshot.serverTimeMs !== null && Number.isFinite(snapshot.serverTimeMs);
      const clock: Clock = { serverTimeMs: server ? snapshot.serverTimeMs! + (now - start) / 2 : Date.now(),
        monotonicTimeMs: now, source: server ? "server" : "local" };
      const authoritative = snapshot.auction;
      auction = replay(authoritative, buffer);
      buffer = [];
      dispatch({ type: "snapshot", auction, clock });
      // An end event is only a hint until the API also confirms a terminal state.
      if (authoritative.state !== "LIVE") {
        settled = true;
        clearTransport();
        connection("idle");
        return;
      }
      const overdue = authoritative.endsAt !== null && Date.parse(authoritative.endsAt) <= clock.serverTimeMs;
      const deadlineMs = authoritative.endsAt === null ? null : Date.parse(authoritative.endsAt);
      if (endedHint && deadlineMs !== null && deadlineMs > clock.serverTimeMs
        && (endedHint.deadlineMs === null || deadlineMs > endedHint.deadlineMs)) {
        // Same-deadline LIVE responses may lag the end event, even before expiry.
        // Only a newly established, future deadline supersedes that hint.
        endedHint = null;
      }
      if (endedHint || overdue) {
        finalizing = true;
        clearTransport();
        if (++closeChecks >= MAX_CLOSE_CHECKS) {
          paused = true;
          connection("reconnecting", "El cierre todavía no fue confirmado. Los datos pueden estar desactualizados; volvé a verificar.");
        } else {
          connection("syncing", "Esperando confirmación del cierre…", Date.now() + 3_000);
          later(sync, 3_000);
        }
        return;
      }
      if (finalizing) {
        // A later deadline is an extension: resubscribe before trusting updates.
        finalizing = false;
        closeChecks = 0;
        connect();
        return;
      }
      buffering = false;
      attempts = 0; // Open/ack alone do not establish a healthy connection.
      connection("live", server ? null : "Hora estimada con el reloj del dispositivo.");
    } catch (error) {
      if (disposed || current !== generation) return;
      cancel(timeout);
      abort = null;
      fail(error instanceof Error ? error.message : "No se pudo actualizar. Los datos pueden estar desactualizados.");
    }
  }

  function connect() {
    if (disposed || settled || paused) return;
    clearTransport();
    if (!navigator.onLine) { connection("offline", "Sin conexión. Los datos pueden estar desactualizados."); return; }
    if (finalizing) { void sync(); return; }
    const url = process.env.NEXT_PUBLIC_SOCKETS_URL;
    if (!url) { connection("reconnecting", "Falta configurar la conexión en vivo. Los datos pueden estar desactualizados."); return; }
    connection(attempts ? "reconnecting" : "connecting");
    const current = generation;
    let ws: WebSocket;
    try { ws = new WebSocket(url); socket = ws; }
    catch { fail("No se pudo abrir la conexión en vivo."); return; }
    const active = () => !disposed && generation === current;
    let deadline = later(() => fail("La conexión tardó demasiado."), TIMEOUT);
    let pongDeadline: ReturnType<typeof setTimeout> | null = null;
    function heartbeat() {
      if (!active()) return;
      if (!send({ type: "ping" })) return;
      pongDeadline = later(() => fail("La conexión dejó de responder. Actualizando…"), TIMEOUT);
      later(heartbeat, 20_000);
    }
    const onOpen = () => {
      if (!active()) return;
      cancel(deadline);
      connection("subscribing");
      // Buffer from the moment subscribe is sent, including events before the ack.
      if (!send({ type: "subscribe", auction_id: auction.id })) return;
      deadline = later(() => fail("No llegó la confirmación de suscripción."), TIMEOUT);
      later(heartbeat, 20_000);
    };
    const onMessage = (event: MessageEvent) => {
      if (!active()) return;
      const message = normalizeMessage(event.data, auction.id);
      if (!message) return;
      if (message.type === "pong") {
        if (pongDeadline) cancel(pongDeadline);
        pongDeadline = null;
      } else if (message.type === "failed_subscribe") fail(message.message);
      else if (message.type === "subscribed") {
        if (subscribed) return;
        subscribed = true;
        cancel(deadline);
        void sync();
      } else {
        if (message.type === "auction_ended") {
          finalizing = true;
          endedHint = { deadlineMs: auction.endsAt === null ? null : Date.parse(auction.endsAt) };
          // Also covers end-before-ack: no subscription is needed for final truth.
          // Invalidate any request started before this event without changing state.
          clearTransport();
          void sync();
          return;
        }
        if (buffering) {
          if (buffer.length >= 2_000) { fail("Demasiados eventos pendientes. Actualizando…"); return; }
          buffer.push(message);
        } else {
          auction = replay(auction, [message]);
          dispatch({ type: "event", event: message });
        }
      }
    };
    const onClose = () => { if (active()) fail("Se perdió la conexión. Los datos pueden estar desactualizados."); };
    ws.addEventListener("open", onOpen);
    ws.addEventListener("message", onMessage);
    ws.addEventListener("close", onClose);
    ws.addEventListener("error", onClose);
    removeSocketListeners = () => {
      ws.removeEventListener("open", onOpen);
      ws.removeEventListener("message", onMessage);
      ws.removeEventListener("close", onClose);
      ws.removeEventListener("error", onClose);
    };
  }

  function reconcile() {
    if (disposed || settled) return;
    // Countdown renders may request repeatedly; do not interrupt in-flight work.
    if (abort || (socket && !subscribed) || (finalizing && !paused && timers.size > 0)) return;
    paused = false;
    closeChecks = 0;
    connect();
  }
  const onOffline = () => {
    if (settled) return;
    clearTransport();
    connection("offline", "Sin conexión. Los datos pueden estar desactualizados.");
  };
  const onReturn = () => {
    if (settled || document.visibilityState === "hidden") return;
    paused = false;
    closeChecks = 0;
    connect();
  };
  window.addEventListener("offline", onOffline);
  window.addEventListener("online", onReturn);
  document.addEventListener("visibilitychange", onReturn);
  // Session startup runs postmount in useEffect. No SSR timestamp/offset is reused.
  dispatch({ type: "clock", clock: {
    serverTimeMs: Date.now(), monotonicTimeMs: performance.now(), source: "local",
  } });
  connect();
  return {
    reconcile,
    dispose() {
      disposed = true;
      clearTransport();
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onReturn);
      document.removeEventListener("visibilitychange", onReturn);
    },
  };
}
