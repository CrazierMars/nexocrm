"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/server/session";
import { contactSchema } from "@/lib/validations/contact";
import { createContact } from "@/server/services/contacts";

const FIELDS = ["firstName", "lastName", "email", "phone", "companyId", "lifecycleStage", "source"] as const;

export type ContactFormState = {
  errors?: Partial<Record<string, string[]>>;
  values?: Record<string, string>;
};

export async function createContactAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const { user } = await requireSession();

  const values = Object.fromEntries(
    FIELDS.map((k) => [k, String(formData.get(k) ?? "").trim()]),
  ) as Record<string, string>;

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  let id: string;
  try {
    const contact = await createContact(user, parsed.data);
    id = contact.id;
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return { errors: { email: ["Ya existe un contacto con ese correo"] }, values };
    }
    throw e;
  }

  revalidatePath("/contacts");
  redirect(`/contacts/${id}`);
}
