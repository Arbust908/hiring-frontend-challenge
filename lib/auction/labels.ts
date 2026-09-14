import type { AuctionState } from "./types";

export const stateLabels: Record<AuctionState, string> = {
  LIVE: "Subasta abierta",
  FINISHED_SALE: "Finalizada con venta",
  FINISHED_NO_SALE: "Finalizada sin venta",
  CANCELLED: "Subasta cancelada",
  PENDING: "Próximamente",
  DRAFT: "Borrador · todavía no publicada",
};

export function connectionReason(message: string) {
  const reasons: Record<string, string> = {
    "El cierre todavía no fue confirmado. Los datos pueden estar desactualizados; volvé a verificar.": "Cierre pendiente de confirmación. Volvé a verificar.",
    "Falta configurar la conexión en vivo. Los datos pueden estar desactualizados.": "La conexión en vivo no está configurada.",
    "Sin conexión. Los datos pueden estar desactualizados.": "Sin internet. Revisá tu conexión.",
    "Actualizando datos de la subasta…": "Estamos consultando las últimas ofertas al servidor.",
    "Esperando confirmación del cierre…": "Estamos esperando que el servidor confirme el cierre de la subasta.",
    "La subasta no está disponible.": "No pudimos encontrar la subasta al actualizar sus datos.",
    "La actualización tardó demasiado. Los datos pueden estar desactualizados.": "El servidor tardó demasiado en actualizar los datos.",
    "La conexión tardó demasiado.": "La conexión con el servicio en vivo tardó demasiado.",
    "La conexión dejó de responder. Actualizando…": "El servicio en vivo dejó de responder.",
    "No llegó la confirmación de suscripción.": "El servicio no confirmó la conexión a esta subasta.",
    "No se pudo abrir la conexión en vivo.": "No pudimos conectar con el servicio en vivo.",
    "Se perdió la conexión. Reintentando…": "Se interrumpió la conexión con el servicio en vivo.",
    "Se perdió la conexión. Los datos pueden estar desactualizados.": "Se interrumpió la conexión con el servicio en vivo.",
    "Demasiados eventos pendientes. Actualizando…": "Hay actualizaciones pendientes. Volvé a verificar.",
  };
  return reasons[message] ?? "No pudimos confirmar los datos. Volvé a verificar.";
}
