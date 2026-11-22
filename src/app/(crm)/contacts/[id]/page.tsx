import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/server/session";
import { getContact } from "@/server/services/contacts";
import { StageBadge } from "@/components/crm/stage-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  activityLabels,
  dealStatusLabels,
  formatDate,
  formatMoney,
  priorityLabels,
  ticketStatusLabels,
} from "@/lib/labels";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requireSession();
  const { id } = await params;
  const contact = await getContact(user, id);
  if (!contact) notFound(); // no existe o no tiene permiso para verlo

  return (
    <div className="flex flex-col gap-6">
      <Link href="/contacts" className="text-sm text-muted-foreground hover:underline">
        ← Contactos
      </Link>

      {/* Encabezado */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">
            {contact.firstName} {contact.lastName}
          </h1>
          <StageBadge stage={contact.lifecycleStage} />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>{contact.email ?? "Sin correo"}</span>
          <span>{contact.phone ?? "Sin teléfono"}</span>
          <span>{contact.company?.name ?? "Sin empresa"}</span>
          <span>Dueño: {contact.owner?.name ?? "—"}</span>
          <span>Origen: {contact.source ?? "—"}</span>
        </div>
        {contact.tags.length > 0 && (
          <div className="flex gap-1">
            {contact.tags.map((t) => (
              <Badge key={t.tagId} variant="outline">
                {t.tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Línea de tiempo */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad ({contact.activities.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {contact.activities.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin actividades registradas.</p>
            )}
            {contact.activities.map((a) => (
              <div key={a.id} className="border-l-2 pl-4">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">{activityLabels[a.type]}</Badge>
                  <span className="font-medium">{a.subject}</span>
                </div>
                {a.body && <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(a.occurredAt)} · {a.user.name}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades ({contact.deals.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {contact.deals.length === 0 && <p className="text-sm text-muted-foreground">Ninguna.</p>}
              {contact.deals.map((d) => (
                <div key={d.id} className="text-sm">
                  <p className="font-medium">{d.title}</p>
                  <p className="text-muted-foreground">
                    {formatMoney(d.amount, d.currency)} · {d.stage.name} · {dealStatusLabels[d.status]}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tickets ({contact.tickets.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {contact.tickets.length === 0 && <p className="text-sm text-muted-foreground">Ninguno.</p>}
              {contact.tickets.map((t) => (
                <div key={t.id} className="text-sm">
                  <p className="font-medium">{t.subject}</p>
                  <p className="text-muted-foreground">
                    {ticketStatusLabels[t.status]} · Prioridad {priorityLabels[t.priority].toLowerCase()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tareas pendientes ({contact.tasks.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {contact.tasks.length === 0 && <p className="text-sm text-muted-foreground">Ninguna.</p>}
              {contact.tasks.map((t) => (
                <div key={t.id} className="text-sm">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-muted-foreground">Vence: {formatDate(t.dueAt)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
