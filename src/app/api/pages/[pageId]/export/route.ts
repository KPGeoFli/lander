import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildExportZip } from "@/lib/html-export";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;

  const page = await db.landingPage.findUnique({
    where: { id: pageId },
    include: {
      client: true,
      versions: { where: { isActive: true }, take: 1 },
    },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const activeVersion = page.versions[0];
  if (!activeVersion) {
    return NextResponse.json(
      { error: "No generated content to export. Generate the page first." },
      { status: 400 }
    );
  }

  const zipBuffer = await buildExportZip({
    clientName: page.client.name,
    clientDomain: page.client.domain,
    clientSubdomain: page.client.subdomain,
    pageTitle: page.title,
    pageSlug: page.slug,
    htmlContent: activeVersion.htmlContent,
  });

  // Record the deployment
  await db.deployment.create({
    data: {
      pageId,
      versionId: activeVersion.id,
      targetDomain: page.client.domain
        ? `${page.client.subdomain || "promo"}.${page.client.domain}`
        : null,
    },
  });

  const filename = `${page.slug}-${new Date().toISOString().slice(0, 10)}.zip`;

  return new Response(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
