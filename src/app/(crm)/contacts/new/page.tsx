import { requireSession } from "@/server/session";
import { listCompanyOptions } from "@/server/services/contacts";
import { ContactForm } from "@/components/crm/contact-form";

export default async function NewContactPage() {
  await requireSession();
  const companies = await listCompanyOptions();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Nuevo contacto</h1>
      <ContactForm companies={companies} />
    </div>
  );
}
