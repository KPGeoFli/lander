"use client";

import { useState } from "react";
import { Monitor, Tablet, Smartphone, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewPaneProps {
  pageId: string;
  streamingHtml: string | null;
  isStreaming: boolean;
  refreshKey: number;
}

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORTS: { id: Viewport; label: string; icon: React.ReactNode; width: string }[] = [
  { id: "desktop", label: "Desktop", icon: <Monitor className="h-3.5 w-3.5" />, width: "100%" },
  { id: "tablet", label: "Tablet", icon: <Tablet className="h-3.5 w-3.5" />, width: "768px" },
  { id: "mobile", label: "Mobile", icon: <Smartphone className="h-3.5 w-3.5" />, width: "390px" },
];

export function PreviewPane({
  pageId,
  streamingHtml,
  isStreaming,
  refreshKey,
}: PreviewPaneProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const currentViewport = VIEWPORTS.find((v) => v.id === viewport)!;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-1">
          {VIEWPORTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setViewport(v.id)}
              title={v.label}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                viewport === v.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              )}
            >
              {v.icon}
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
        {isStreaming && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating…
          </div>
        )}
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-slate-200 flex items-start justify-center p-4">
        <div
          className="flex-shrink-0 bg-white shadow-lg transition-all duration-300 overflow-hidden"
          style={{
            width: currentViewport.width,
            minHeight: "600px",
          }}
        >
          {isStreaming && streamingHtml ? (
            // Show streaming HTML in a srcdoc iframe
            <iframe
              key={`stream-${streamingHtml.length}`}
              className="w-full border-0"
              style={{ height: "800px" }}
              sandbox="allow-scripts"
              srcDoc={streamingHtml}
              title="Preview (streaming)"
            />
          ) : (
            <iframe
              key={`saved-${refreshKey}`}
              src={`/api/pages/${pageId}/preview`}
              className="w-full border-0"
              style={{ height: "800px" }}
              sandbox="allow-scripts"
              title="Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}
