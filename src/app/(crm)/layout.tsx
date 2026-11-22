import Link from "next/link";
import { requireSession } from "@/server/session";
import { SignOutButton } from "@/components/crm/sign-out-button";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contacts", label: "Contactos" },
  { href: "/companies", label: "Empresas" },
  { href: "/deals", label: "Oportunidades" },
  { href: "/tasks", label: "Tareas" },
  { href: "/tickets", label: "Tickets" },
];

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col gap-1 border-r bg-muted/40 p-4">
        <p className="mb-4 text-lg font-semibold">NexoCRM</p>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
            {l.label}
          </Link>
        ))}
        <div className="mt-auto flex flex-col gap-2 border-t pt-4">
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
