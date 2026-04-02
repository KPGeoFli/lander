import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;

  const versions = await db.pageVersion.findMany({
    where: { pageId },
    orderBy: { versionNum: "desc" },
    select: {
      id: true,
      pageId: true,
      versionNum: true,
      prompt: true,
      isActive: true,
      createdAt: true,
      // Omit htmlContent for list performance
    },
  });

  return NextResponse.json(versions);
}
