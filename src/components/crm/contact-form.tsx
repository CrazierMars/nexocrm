"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createContactAction, type ContactFormState } from "@/server/actions/contacts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { stageLabels } from "@/lib/labels";

const initialState: ContactFormState = {};
const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ContactForm({ companies }: { companies: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createContactAction, initialState);
  const v = state.values ?? {};
  const err = (field: string) => state.errors?.[field]?.[0];

  return (
    <form action={formAction} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="Nombre" name="firstName" error={err("firstName")}>
        <Input id="firstName" name="firstName" defaultValue={v.firstName} required />
      </Field>
      <Field label="Apellido" name="lastName" error={err("lastName")}>
        <Input id="lastName" name="lastName" defaultValue={v.lastName} required />
      </Field>
      <Field label="Correo" name="email" error={err("email")}>
        <Input id="email" name="email" type="email" defaultValue={v.email} />
      </Field>
      <Field label="Teléfono" name="phone" error={err("phone")}>
        <Input id="phone" name="phone" defaultValue={v.phone} placeholder="+506 8888-8888" />
      </Field>
      <Field label="Empresa" name="companyId" error={err("companyId")}>
        <select id="companyId" name="companyId" defaultValue={v.companyId ?? ""} className={selectClass}>
          <option value="">Sin empresa</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Etapa" name="lifecycleStage" error={err("lifecycleStage")}>
        <select id="lifecycleStage" name="lifecycleStage" defaultValue={v.lifecycleStage ?? "LEAD"} className={selectClass}>
          {Object.entries(stageLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Origen" name="source" error={err("source")}>
        <Input id="source" name="source" defaultValue={v.source} placeholder="Web, Referido, Evento…" />
      </Field>

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Guardar contacto"}
        </Button>
        <Link href="/contacts" className={buttonVariants({ variant: "outline" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
