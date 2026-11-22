export const stageLabels: Record<string, string> = {
  LEAD: "Lead",
  PROSPECT: "Prospecto",
  CUSTOMER: "Cliente",
  CHURNED: "Perdido",
};

export const activityLabels: Record<string, string> = {
  CALL: "Llamada",
  MEETING: "Reunión",
  NOTE: "Nota",
  EMAIL: "Correo",
};

export const ticketStatusLabels: Record<string, string> = {
  OPEN: "Abierto",
  PENDING: "Pendiente",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
};

export const priorityLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const dealStatusLabels: Record<string, string> = {
  OPEN: "Abierta",
  WON: "Ganada",
  LOST: "Perdida",
};

export function formatDate(d: Date | null | undefined) {
  return d ? new Intl.DateTimeFormat("es-CR", { dateStyle: "medium" }).format(d) : "—";
}

export function formatMoney(amount: unknown, currency = "USD") {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}
