import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateLandingPage } from "@/lib/claude";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const body = await req.json();
  const { prompt, isRefinement } = body;

  const page = await db.landingPage.findUnique({
    where: { id: pageId },
    include: { client: true, versions: { where: { isActive: true }, take: 1 } },
  });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const existingHtml = page.versions[0]?.htmlContent ?? null;

  // Determine next version number
  const maxVersion = await db.pageVersion.aggregate({
    where: { pageId },
    _max: { versionNum: true },
  });
  const nextVersionNum = (maxVersion._max.versionNum ?? 0) + 1;

  // Stream the generation and collect full HTML
  const stream = await generateLandingPage({
    clientName: page.client.name,
    clientDomain: page.client.domain,
    clientBrandColors: page.client.brandColors,
    clientIndustry: page.client.industry,
    prompt,
    existingHtml,
    isRefinement: isRefinement ?? !!existingHtml,
  });

  // We'll collect the full HTML on the server, then save to DB, while streaming to client
  const decoder = new TextDecoder();
  let fullHtml = "";

  const [clientStream, saveStream] = stream.tee();

  // Collect full HTML for saving
  (async () => {
    const reader = saveStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullHtml += decoder.decode(value, { stream: true });
    }

    // Save the new version to DB
    try {
      await db.pageVersion.updateMany({
        where: { pageId },
        data: { isActive: false },
      });

      await db.pageVersion.create({
        data: {
          pageId,
          versionNum: nextVersionNum,
          htmlContent: fullHtml,
          prompt,
          isActive: true,
        },
      });

      // Update page prompt if not a refinement
      if (!isRefinement) {
        await db.landingPage.update({
          where: { id: pageId },
          data: { prompt },
        });
      }
    } catch (err) {
      console.error("Failed to save generated version:", err);
    }
  })();

  return new Response(clientStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Version-Num": String(nextVersionNum),
      "Cache-Control": "no-cache",
    },
  });
}
