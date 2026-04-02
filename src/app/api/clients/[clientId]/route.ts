import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const client = await db.client.findUnique({
    where: { id: clientId },
    include: {
      pages: {
        orderBy: { createdAt: "desc" },
        include: {
          versions: {
            where: { isActive: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json(client);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const body = await req.json();
  const { name, domain, subdomain, logoUrl, brandColors, industry, notes } =
    body;

  const client = await db.client.update({
    where: { id: clientId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(domain !== undefined && { domain: domain?.trim() || null }),
      ...(subdomain !== undefined && {
        subdomain: subdomain?.trim() || "promo",
      }),
      ...(logoUrl !== undefined && { logoUrl: logoUrl?.trim() || null }),
      ...(brandColors !== undefined && { brandColors }),
      ...(industry !== undefined && { industry: industry?.trim() || null }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
    },
  });

  return NextResponse.json(client);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  await db.client.delete({ where: { id: clientId } });
  return NextResponse.json({ success: true });
}
