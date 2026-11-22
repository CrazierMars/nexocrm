export type SessionUser = { id: string; role: string };

// Un AGENT solo ve sus propios contactos; MANAGER y ADMIN ven todos.
export function contactScope(user: SessionUser) {
  return user.role === "AGENT" ? { ownerId: user.id } : {};
}
