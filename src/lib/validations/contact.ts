import { z } from "zod";

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  lastName: z.string().trim().min(1, "El apellido es obligatorio").max(80),
  email: z.union([z.literal(""), z.email("Correo inválido")]),
  phone: z.string().trim().max(30),
  companyId: z.string(),
  lifecycleStage: z.enum(["LEAD", "PROSPECT", "CUSTOMER", "CHURNED"]),
  source: z.string().trim().max(60),
});

export type ContactInput = z.infer<typeof contactSchema>;
