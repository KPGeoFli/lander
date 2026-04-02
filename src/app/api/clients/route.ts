import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET() {
  const clients = await db.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { pages: true } } },
  });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, domain, subdomain, logoUrl, brandColors, industry, notes } =
    body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let attempt = 0;
  while (await db.client.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const client = await db.client.create({
    data: {
      name: name.trim(),
      slug,
      domain: domain?.trim() || null,
      subdomain: subdomain?.trim() || "promo",
      logoUrl: logoUrl?.trim() || null,
      brandColors: brandColors || null,
      industry: industry?.trim() || null,
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
