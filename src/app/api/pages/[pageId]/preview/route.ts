import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;

  const activeVersion = await db.pageVersion.findFirst({
    where: { pageId, isActive: true },
  });

  if (!activeVersion) {
    return new Response(
      `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
      body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc;color:#64748b;}
      .empty{text-align:center;padding:2rem;}
      .empty svg{width:48px;height:48px;margin-bottom:1rem;opacity:0.4;}
      h2{font-size:1.25rem;font-weight:600;color:#1e293b;margin:0 0 0.5rem;}
      p{margin:0;font-size:0.9rem;}
      </style></head><body>
      <div class="empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <h2>No content yet</h2>
        <p>Use the Generate panel to create this landing page.</p>
      </div>
      </body></html>`,
      {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Frame-Options": "SAMEORIGIN",
        },
      }
    );
  }

  return new Response(activeVersion.htmlContent, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
