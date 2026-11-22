import { db } from "@/server/db";
import { requireSession } from "@/server/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const { user } = await requireSession();

  const [contacts, openDeals, openTickets, myTasks] = await Promise.all([
    db.contact.count(),
    db.deal.count({ where: { status: "OPEN" } }),
    db.ticket.count({ where: { status: { in: ["OPEN", "PENDING"] } } }),
    db.task.count({ where: { assigneeId: user.id, status: "TODO" } }),
  ]);

  const stats = [
    { label: "Contactos", value: contacts },
    { label: "Oportunidades abiertas", value: openDeals },
    { label: "Tickets abiertos", value: openTickets },
    { label: "Mis tareas pendientes", value: myTasks },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Hola, {user.name}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{s.value}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
