"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { Client } from "@/types";

const PROMPT_TEMPLATES = [
  {
    label: "Paid Ad Lead Capture",
    prompt:
      "Create a focused lead capture landing page for our paid search campaign. Include a strong headline matching the ad promise, 3 key benefits, a simple form (name, phone, email), trust signals (years in business, reviews), and a prominent call-to-action button.",
  },
  {
    label: "Service Promotion",
    prompt:
      "Build a promotional landing page for a special offer or seasonal campaign. Feature a hero with the offer prominently displayed, urgency elements (limited time), service benefits, before/after or results, testimonials, and a clear CTA.",
  },
  {
    label: "Free Consultation",
    prompt:
      "Design a landing page to drive free consultation bookings. Lead with the free consultation offer, explain what they get from it, show social proof and credentials, address common objections, and make booking easy with a simple form.",
  },
];

interface NewPageFormProps {
  client: Client;
}

export function NewPageForm({ client }: NewPageFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) {
      setError("Both title and description are required.");
      return;
    }

    setLoading(true);
    setError("");

    // Create the page record
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, title, prompt }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create page.");
      setLoading(false);
      return;
    }

    const page = await res.json();
    // Navigate to editor and trigger generation
    router.push(
      `/clients/${client.id}/pages/${page.id}?generate=true&prompt=${encodeURIComponent(prompt)}`
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Page Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Spring Eye Exam Promo"
        hint="Used as the page filename when exported"
        required
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-700">
            Page Description *
          </p>
          <span className="text-xs text-slate-400">Use a template below ↓</span>
        </div>

        {/* Templates */}
        <div className="flex flex-wrap gap-2 mb-2">
          {PROMPT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.label}
              type="button"
              onClick={() => setPrompt(tpl.prompt)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-transparent hover:border-indigo-200"
            >
              {tpl.label}
            </button>
          ))}
        </div>

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe the landing page you need for ${client.name}. Be specific about:
- The campaign goal (lead capture, appointment booking, product sale)
- Key benefits or offers to highlight
- Target audience
- Sections you want included (hero, testimonials, FAQ, form, etc.)
- Any specific copy or messaging`}
          rows={8}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          <Sparkles className="h-4 w-4" />
          Generate Page
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>

      <p className="text-xs text-slate-400">
        Claude will generate a complete, self-contained HTML landing page based
        on your description. You can refine it as many times as you need.
      </p>
    </form>
  );
}
