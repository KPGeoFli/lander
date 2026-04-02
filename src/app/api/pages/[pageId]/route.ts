import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;

  const page = await db.landingPage.findUnique({
    where: { id: pageId },
    include: {
      client: true,
      versions: {
        orderBy: { versionNum: "desc" },
      },
    },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const activeVersion = page.versions.find((v) => v.isActive) ?? null;

  return NextResponse.json({ ...page, activeVersion });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const body = await req.json();
  const { title, prompt, status, htmlContent, activeVersionId } = body;

  // Switch active version
  if (activeVersionId) {
    await db.pageVersion.updateMany({
      where: { pageId },
      data: { isActive: false },
    });
    await db.pageVersion.update({
      where: { id: activeVersionId },
      data: { isActive: true },
    });
  }

  // Save manual HTML edit as new version
  if (htmlContent !== undefined) {
    const maxVersion = await db.pageVersion.aggregate({
      where: { pageId },
      _max: { versionNum: true },
    });
    const nextVersionNum = (maxVersion._max.versionNum ?? 0) + 1;

    await db.pageVersion.updateMany({
      where: { pageId },
      data: { isActive: false },
    });

    await db.pageVersion.create({
      data: {
        pageId,
        versionNum: nextVersionNum,
        htmlContent,
        prompt: "Manual edit",
        isActive: true,
      },
    });
  }

  const page = await db.landingPage.update({
    where: { id: pageId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(prompt !== undefined && { prompt: prompt.trim() }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json(page);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  await db.landingPage.delete({ where: { id: pageId } });
  return NextResponse.json({ success: true });
}
