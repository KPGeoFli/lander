"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";

interface GeneratePanelProps {
  pageId: string;
  hasContent: boolean;
  initialPrompt?: string;
  onStreamStart: () => void;
  onStreamEnd: () => void;
  onChunk: (html: string) => void;
}

export function GeneratePanel({
  pageId,
  hasContent,
  initialPrompt = "",
  onStreamStart,
  onStreamEnd,
  onChunk,
}: GeneratePanelProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError("");
    onStreamStart();

    try {
      const res = await fetch(`/api/pages/${pageId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          isRefinement: hasContent,
        }),
      });

      if (!res.ok || !res.body) {
        const msg = await res.text();
        throw new Error(msg || "Generation failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        onChunk(accumulated);
      }

      onStreamEnd();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={
          hasContent
            ? "Describe a change: e.g. 'Make the CTA button larger and red', 'Add a testimonials section', 'Change the headline to focus on free exams'…"
            : "Describe the landing page you want to generate…"
        }
        rows={4}
        disabled={generating}
        className="text-sm"
        label={hasContent ? "Refinement instruction" : "Page description"}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            generate();
          }
        }}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button
        onClick={generate}
        loading={generating}
        disabled={!prompt.trim()}
        className="self-start"
      >
        {hasContent ? (
          <>
            <RefreshCw className="h-3.5 w-3.5" />
            {generating ? "Refining…" : "Refine Page"}
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            {generating ? "Generating…" : "Generate Page"}
          </>
        )}
      </Button>

      {generating && (
        <p className="text-xs text-slate-500 animate-pulse">
          Claude is writing your landing page… this takes 10–20 seconds.
        </p>
      )}

      <p className="text-xs text-slate-400">
        Tip: Press ⌘+Enter to generate
      </p>
    </div>
  );
}
