import Link from "next/link";
import { requireSession } from "@/server/session";
import { listContacts } from "@/server/services/contacts";
import { StageBadge } from "@/components/crm/stage-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, stageLabels } from "@/lib/labels";

type SearchParams = Promise<{ q?: string; stage?: string; page?: string }>;

export default async function ContactsPage({ searchParams }: { searchParams: SearchParams }) {
  const { user } = await requireSession();
  const sp = await searchParams;
  const { items, total, page, pageCount } = await listContacts(user, {
    q: sp.q,
    stage: sp.stage,
    page: Number(sp.page) || 1,
  });

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.stage) params.set("stage", sp.stage);
    params.set("page", String(p));
    return `/contacts?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contactos</h1>
          <p className="text-sm text-muted-foreground">{total} en total</p>
        </div>
        <Link href="/contacts/new" className={buttonVariants()}>
          Nuevo contacto
        </Link>
      </div>

      {/* Filtros: un formulario GET pone q y stage en la URL */}
      <form className="flex flex-wrap gap-2">
        <Input name="q" defaultValue={sp.q} placeholder="Buscar por nombre, correo o empresa" className="max-w-xs" />
        <select
          name="stage"
          defaultValue={sp.stage ?? ""}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
        >
          <option value="">Todas las etapas</option>
          {Object.entries(stageLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
        {(sp.q || sp.stage) && (
          <Link href="/contacts" className={buttonVariants({ variant: "ghost" })}>
            Limpiar
          </Link>
        )}
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Etiquetas</TableHead>
              <TableHead>Dueño</TableHead>
              <TableHead>Actualizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No hay contactos con esos filtros.
                </TableCell>
              </TableRow>
            )}
            {items.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link href={`/contacts/${c.id}`} className="font-medium hover:underline">
                    {c.firstName} {c.lastName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{c.email ?? "Sin correo"}</p>
                </TableCell>
                <TableCell>{c.company?.name ?? "—"}</TableCell>
                <TableCell>
                  <StageBadge stage={c.lifecycleStage} />
                </TableCell>
                <TableCell className="space-x-1">
                  {c.tags.map((t) => (
                    <Badge key={t.tagId} variant="outline">
                      {t.tag.name}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>{c.owner?.name ?? "—"}</TableCell>
                <TableCell>{formatDate(c.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Página {page} de {pageCount}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Anterior
            </Link>
          )}
          {page < pageCount && (
            <Link href={pageHref(page + 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Siguiente
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
