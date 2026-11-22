import { db } from "@/server/db";
import type { Prisma } from "@/generated/prisma/client";
import { contactScope, type SessionUser } from "@/server/permissions";
import type { ContactInput } from "@/lib/validations/contact";

export const PAGE_SIZE = 15;

const STAGES = ["LEAD", "PROSPECT", "CUSTOMER", "CHURNED"] as const;
type Stage = (typeof STAGES)[number];
const isStage = (v?: string): v is Stage => !!v && (STAGES as readonly string[]).includes(v);

export type ContactFilters = { q?: string; stage?: string; page?: number };

export async function listContacts(user: SessionUser, filters: ContactFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const q = filters.q?.trim();

  const where: Prisma.ContactWhereInput = {
    ...contactScope(user),
    ...(isStage(filters.stage) ? { lifecycleStage: filters.stage } : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { company: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.contact.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        owner: { select: { name: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.contact.count({ where }),
  ]);

  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getContact(user: SessionUser, id: string) {
  return db.contact.findFirst({
    where: { id, ...contactScope(user) },
    include: {
      company: true,
      owner: { select: { name: true } },
      tags: { include: { tag: true } },
      deals: { include: { stage: true }, orderBy: { createdAt: "desc" } },
      tickets: { orderBy: { createdAt: "desc" } },
      activities: {
        include: { user: { select: { name: true } } },
        orderBy: { occurredAt: "desc" },
      },
      tasks: { where: { status: "TODO" }, orderBy: { dueAt: "asc" } },
    },
  });
}

export async function createContact(user: SessionUser, data: ContactInput) {
  return db.contact.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      companyId: data.companyId || null,
      lifecycleStage: data.lifecycleStage,
      source: data.source || null,
      ownerId: user.id,
    },
  });
}

export async function listCompanyOptions() {
  return db.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}
