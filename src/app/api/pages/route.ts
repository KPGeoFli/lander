import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientId, title, prompt } = body;

  if (!clientId || !title?.trim() || !prompt?.trim()) {
    return NextResponse.json(
      { error: "clientId, title, and prompt are required" },
      { status: 400 }
    );
  }

  const client = await db.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let attempt = 0;
  while (
    await db.landingPage.findUnique({ where: { clientId_slug: { clientId, slug } } })
  ) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const page = await db.landingPage.create({
    data: {
      clientId,
      title: title.trim(),
      slug,
      prompt: prompt.trim(),
    },
  });

  return NextResponse.json(page, { status: 201 });
}
