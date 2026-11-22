// prisma/seed.ts — datos de prueba para NexoCRM (fase 1)
// Ejecutar con: npx prisma db seed
// ADVERTENCIA: borra todos los datos del núcleo antes de insertar.

import "dotenv/config";
import { fakerES_MX as faker } from "@faker-js/faker";
import { db as prisma } from "../src/server/db";
import { auth } from "../src/server/auth";

// Crea el usuario con Better Auth (guarda la contraseña hasheada en Account)
// y luego le asigna el rol, que no se puede enviar en el registro.
async function createUser(email: string, name: string, role: "ADMIN" | "MANAGER" | "AGENT") {
  const { user } = await auth.api.signUpEmail({
    body: { email, name, password: "Nexo1234!" },
  });
  return prisma.user.update({ where: { id: user.id }, data: { role, emailVerified: true } });
}

// Quita tildes y espacios para armar correos válidos
const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

async function main() {
  faker.seed(42); // mismos datos en cada ejecución

  // 1. Limpiar (orden inverso a las dependencias)
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contactTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.pipelineStage.deleteMany();
  await prisma.pipeline.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany(); // borra en cascada Session y Account

  // 2. Usuarios: uno por rol. Contraseña de todos: Nexo1234!
  const admin = await createUser("admin@nexocrm.dev", "Ana Administradora", "ADMIN");
  const manager = await createUser("manager@nexocrm.dev", "Mario Gerente", "MANAGER");
  const agent = await createUser("agente@nexocrm.dev", "Andrea Agente", "AGENT");
  const owners = [manager, agent];

  // 3. Pipeline por defecto con 6 etapas
  const pipeline = await prisma.pipeline.create({
    data: {
      name: "Ventas",
      isDefault: true,
      stages: {
        create: [
          { name: "Nuevo", order: 1, probability: 10 },
          { name: "Calificado", order: 2, probability: 25 },
          { name: "Propuesta", order: 3, probability: 50 },
          { name: "Negociación", order: 4, probability: 75 },
          { name: "Ganado", order: 5, probability: 100, isWon: true },
          { name: "Perdido", order: 6, probability: 0, isLost: true },
        ],
      },
    },
  });
  const stages = await prisma.pipelineStage.findMany({
    where: { pipelineId: pipeline.id },
    orderBy: { order: "asc" },
  });

  // 4. Etiquetas
  const tagNames = [
    ["VIP", "purple"],
    ["Referido", "green"],
    ["Evento", "blue"],
    ["Seguimiento", "orange"],
  ] as const;
  const tags = [];
  for (const [name, color] of tagNames) {
    tags.push(await prisma.tag.create({ data: { name, color } }));
  }

  // 5. Empresas
  const industries = ["Salud", "Tecnología", "Retail", "Educación", "Finanzas", "Turismo"];
  const companies = [];
  for (let i = 0; i < 8; i++) {
    const name = faker.company.name();
    companies.push(
      await prisma.company.create({
        data: {
          name,
          industry: faker.helpers.arrayElement(industries),
          website: `https://${slug(name).slice(0, 20)}.com`,
          size: faker.number.int({ min: 5, max: 500 }),
          ownerId: faker.helpers.arrayElement(owners).id,
        },
      }),
    );
  }

  // 6. Contactos con su historial
  const sources = ["Web", "Referido", "Evento", "Llamada entrante", "Redes sociales"];
  const ticketSubjects = [
    "No puedo acceder a mi cuenta",
    "Cobro duplicado en la factura",
    "Consulta sobre renovación",
    "Solicitud de cambio de plan",
    "Demora en la respuesta del soporte",
    "Error al descargar el comprobante",
  ];
  const ticketCategories = ["Acceso", "Facturación", "Renovación", "Plan", "Servicio", "Documentos"];

  let dealCount = 0;
  let ticketCount = 0;
  let activityCount = 0;

  for (let i = 0; i < 30; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const owner = faker.helpers.arrayElement(owners);
    const company = faker.datatype.boolean({ probability: 0.8 })
      ? faker.helpers.arrayElement(companies)
      : null;
    const contactTags = faker.helpers.arrayElements(tags, { min: 0, max: 2 });

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email: `${slug(firstName)}.${slug(lastName)}${i}@ejemplo.com`,
        phone: `+506 ${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
        lifecycleStage: faker.helpers.weightedArrayElement([
          { weight: 4, value: "LEAD" as const },
          { weight: 3, value: "PROSPECT" as const },
          { weight: 2, value: "CUSTOMER" as const },
          { weight: 1, value: "CHURNED" as const },
        ]),
        source: faker.helpers.arrayElement(sources),
        companyId: company?.id,
        ownerId: owner.id,
        tags: { create: contactTags.map((t) => ({ tag: { connect: { id: t.id } } })) },
      },
    });

    // Actividades (1 a 4)
    const activityTotal = faker.number.int({ min: 1, max: 4 });
    for (let a = 0; a < activityTotal; a++) {
      await prisma.activity.create({
        data: {
          type: faker.helpers.arrayElement(["CALL", "MEETING", "NOTE", "EMAIL"] as const),
          subject: faker.helpers.arrayElement([
            "Primer contacto",
            "Seguimiento de propuesta",
            "Consulta de precios",
            "Reunión de presentación",
            "Llamada de cierre",
          ]),
          body: faker.lorem.sentences(2),
          occurredAt: faker.date.recent({ days: 60 }),
          contactId: contact.id,
          userId: owner.id,
        },
      });
      activityCount++;
    }

    // Oportunidad (50 %)
    if (faker.datatype.boolean()) {
      const stage = faker.helpers.arrayElement(stages);
      await prisma.deal.create({
        data: {
          title: `${company?.name ?? `${firstName} ${lastName}`} — ${faker.helpers.arrayElement(["Plan anual", "Licencias", "Servicio premium", "Renovación"])}`,
          amount: faker.number.int({ min: 500, max: 25000 }),
          pipelineId: pipeline.id,
          stageId: stage.id,
          contactId: contact.id,
          companyId: company?.id,
          ownerId: owner.id,
          status: stage.isWon ? "WON" : stage.isLost ? "LOST" : "OPEN",
          lostReason: stage.isLost ? "Precio fuera de presupuesto" : null,
          expectedCloseAt: faker.date.soon({ days: 90 }),
        },
      });
      dealCount++;
    }

    // Ticket (30 %)
    if (faker.datatype.boolean({ probability: 0.3 })) {
      const idx = faker.number.int({ min: 0, max: ticketSubjects.length - 1 });
      await prisma.ticket.create({
        data: {
          subject: ticketSubjects[idx],
          description: faker.lorem.paragraph(),
          status: faker.helpers.arrayElement(["OPEN", "PENDING", "RESOLVED"] as const),
          priority: faker.helpers.arrayElement(["LOW", "MEDIUM", "HIGH", "URGENT"] as const),
          category: ticketCategories[idx],
          contactId: contact.id,
          assigneeId: agent.id,
        },
      });
      ticketCount++;
    }

    // Tarea pendiente (todas)
    await prisma.task.create({
      data: {
        title: `Dar seguimiento a ${firstName} ${lastName}`,
        dueAt: faker.date.soon({ days: 14 }),
        priority: faker.helpers.arrayElement(["LOW", "MEDIUM", "HIGH"] as const),
        assigneeId: owner.id,
        contactId: contact.id,
      },
    });
  }

  console.log("Seed completo:");
  console.log(`  Usuarios: 3 (admin, manager, agente) — contraseña Nexo1234!`);
  console.log(`  Pipeline: 1 con ${stages.length} etapas`);
  console.log(`  Empresas: ${companies.length} · Contactos: 30 · Etiquetas: ${tags.length}`);
  console.log(`  Oportunidades: ${dealCount} · Tickets: ${ticketCount} · Actividades: ${activityCount} · Tareas: 30`);
  console.log(`  Admin: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
