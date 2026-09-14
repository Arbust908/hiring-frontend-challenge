"use client";

import type { Connection } from "@/lib/websocket/live-auction";
import { connectionReason } from "@/lib/auction/labels";
import type { AuctionState } from "@/lib/auction/types";

export function AuctionConnectionBanner({
  state,
  connection,
  connectionFailure,
  stale,
  retrySeconds,
  onVerify,
}: {
  state: AuctionState;
  connection: Connection;
  connectionFailure: string | null;
  stale: boolean;
  retrySeconds: number | null;
  onVerify: () => void;
}) {
  const verifying = connection.status === "connecting" || connection.status === "subscribing" || connection.status === "syncing";
  const isOpen = state === "LIVE";
  const interrupted = isOpen && connectionFailure !== null;

  return (
    <aside
      className={`auction-connection items-center border-y py-2 ${
        interrupted ? "border-warning text-warning" : "border-rule"
      }`}
      aria-label="Estado de actualización"
    >
      <div className="col-span-2 flex min-w-0 items-center justify-between gap-3">
        <h2 role="status" className={`text-sm font-bold ${interrupted ? "text-warning" : stale ? "text-ink" : "text-success"}`}>
          {!isOpen ? "Datos registrados" : connectionFailure ? "Conexión interrumpida" : stale ? "Verificando actualizaciones" : "● En vivo"}
        </h2>
        <button
          type="button"
          onClick={onVerify}
          disabled={verifying || !stale}
          className={`min-h-11 shrink-0 rounded-md border border-current px-3 py-2 text-sm font-bold transition-colors duration-200 ease-out enabled:hover:bg-ink enabled:hover:text-paper disabled:cursor-wait disabled:opacity-60 ${stale ? "" : "invisible"}`}
        >
          Verificar
        </button>
      </div>
      <p className="sr-only">
        {stale
          ? "Último precio e historial conocidos. Las actualizaciones en vivo aún no están confirmadas."
          : "Precio e historial sincronizados. Las nuevas ofertas aparecen automáticamente."}
      </p>
      <p className="col-span-2 text-xs leading-5 text-muted" aria-live="off">
        {!isOpen ? "Último precio e historial registrados." : connection.status === "offline"
          ? "Sin internet. Reconectaremos cuando vuelva la conexión."
          : retrySeconds !== null
            ? `Próximo intento en ${retrySeconds} s.`
            : connectionFailure && verifying
              ? "Reconectando; el precio sigue sin confirmar."
              : connectionFailure
                ? connectionReason(connectionFailure)
                : stale
                  ? "Verificando la conexión con el servidor…"
                  : "Conexión activa"}
      </p>
    </aside>
  );
}
