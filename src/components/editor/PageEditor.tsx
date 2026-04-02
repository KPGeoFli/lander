"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GeneratePanel } from "./GeneratePanel";
import { PreviewPane } from "./PreviewPane";
import { CodeEditor } from "./CodeEditor";
import { VersionHistory } from "./VersionHistory";
import { PublishPanel } from "./PublishPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Eye,
  Code2,
  History,
  Send,
  Trash2,
  Wand2,
} from "lucide-react";
import type { LandingPage, PageVersion } from "@/types";

type SidebarTab = "generate" | "history" | "publish";
type MainTab = "preview" | "code";

interface PageEditorProps {
  page: LandingPage & {
    client: NonNullable<LandingPage["client"]>;
    activeVersion: PageVersion | null;
  };
  autoGenerate?: boolean;
  autoGeneratePrompt?: string;
}

export function PageEditor({
  page,
  autoGenerate = false,
  autoGeneratePrompt = "",
}: PageEditorProps) {
  const router = useRouter();
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("generate");
  const [mainTab, setMainTab] = useState<MainTab>("preview");
  const [streamingHtml, setStreamingHtml] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeHtml, setActiveHtml] = useState(
    page.activeVersion?.htmlContent ?? ""
  );
  const [hasContent, setHasContent] = useState(!!page.activeVersion);

  // Auto-trigger generation when redirected from new page form
  useEffect(() => {
    if (autoGenerate && autoGeneratePrompt) {
      // Small delay to let the component mount fully
      const t = setTimeout(() => {
        triggerAutoGenerate(autoGeneratePrompt);
      }, 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function triggerAutoGenerate(prompt: string) {
    setIsStreaming(true);
    setSidebarTab("generate");

    try {
      const res = await fetch(`/api/pages/${page.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, isRefinement: false }),
      });

      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamingHtml(accumulated);
      }

      setActiveHtml(accumulated);
      setHasContent(true);
      setStreamingHtml(null);
      setRefreshKey((k) => k + 1);
    } finally {
      setIsStreaming(false);
    }
  }

  const handleStreamStart = useCallback(() => {
    setIsStreaming(true);
    setStreamingHtml(null);
  }, []);

  const handleChunk = useCallback((html: string) => {
    setStreamingHtml(html);
    setMainTab("preview");
  }, []);

  const handleStreamEnd = useCallback(() => {
    setIsStreaming(false);
    setHasContent(true);
    setRefreshKey((k) => k + 1);
    // Reload to get fresh activeVersion html
    router.refresh();
  }, [router]);

  const handleVersionSwitch = useCallback(() => {
    setRefreshKey((k) => k + 1);
    router.refresh();
  }, [router]);

  const handleCodeSaved = useCallback(() => {
    setRefreshKey((k) => k + 1);
    router.refresh();
  }, [router]);

  async function handleDelete() {
    if (
      !confirm(
        `Delete "${page.title}"? This cannot be undone.`
      )
    )
      return;
    await fetch(`/api/pages/${page.id}`, { method: "DELETE" });
    router.push(`/clients/${page.clientId}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/clients/${page.clientId}`}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{page.client.name}</span>
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="font-semibold text-slate-900 truncate text-sm">
            {page.title}
          </h1>
          <Badge
            variant={
              page.status === "PUBLISHED"
                ? "success"
                : page.status === "ARCHIVED"
                  ? "default"
                  : "outline"
            }
          >
            {page.status.toLowerCase()}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            title="Delete page"
            className="text-slate-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
          {/* Sidebar tabs */}
          <div className="flex border-b border-slate-200">
            {(
              [
                { id: "generate" as SidebarTab, icon: <Wand2 className="h-3.5 w-3.5" />, label: "Generate" },
                { id: "history" as SidebarTab, icon: <History className="h-3.5 w-3.5" />, label: "History" },
                { id: "publish" as SidebarTab, icon: <Send className="h-3.5 w-3.5" />, label: "Publish" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSidebarTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors",
                  sidebarTab === tab.id
                    ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto">
            {sidebarTab === "generate" && (
              <GeneratePanel
                pageId={page.id}
                hasContent={hasContent}
                initialPrompt={!hasContent ? page.prompt : ""}
                onStreamStart={handleStreamStart}
                onStreamEnd={handleStreamEnd}
                onChunk={handleChunk}
              />
            )}
            {sidebarTab === "history" && (
              <VersionHistory
                pageId={page.id}
                refreshKey={refreshKey}
                onVersionSwitch={handleVersionSwitch}
              />
            )}
            {sidebarTab === "publish" && (
              <PublishPanel
                page={page}
                client={page.client}
                hasContent={hasContent}
                onPublished={() => router.refresh()}
              />
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Main tabs */}
          <div className="flex border-b border-slate-200 bg-white flex-shrink-0">
            <button
              onClick={() => setMainTab("preview")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                mainTab === "preview"
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              onClick={() => setMainTab("code")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                mainTab === "code"
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              <Code2 className="h-4 w-4" />
              HTML Source
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {mainTab === "preview" && (
              <PreviewPane
                pageId={page.id}
                streamingHtml={streamingHtml}
                isStreaming={isStreaming}
                refreshKey={refreshKey}
              />
            )}
            {mainTab === "code" && (
              <CodeEditor
                pageId={page.id}
                html={activeHtml}
                onSaved={handleCodeSaved}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
