"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Client } from "@/types";

interface ClientFormProps {
  client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const isEdit = !!client;

  // Parse existing brand colors
  let existingColors = { primary: "#4f46e5", secondary: "#7c3aed", accent: "" };
  if (client?.brandColors) {
    try {
      existingColors = { ...existingColors, ...JSON.parse(client.brandColors) };
    } catch {}
  }

  const [form, setForm] = useState({
    name: client?.name ?? "",
    domain: client?.domain ?? "",
    subdomain: client?.subdomain ?? "promo",
    industry: client?.industry ?? "",
    notes: client?.notes ?? "",
    primaryColor: existingColors.primary,
    secondaryColor: existingColors.secondary,
    accentColor: existingColors.accent ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Client name is required.");
      return;
    }

    setLoading(true);
    setError("");

    const brandColors = JSON.stringify({
      primary: form.primaryColor,
      secondary: form.secondaryColor,
      ...(form.accentColor && { accent: form.accentColor }),
    });

    const payload = {
      name: form.name,
      domain: form.domain || null,
      subdomain: form.subdomain || "promo",
      industry: form.industry || null,
      notes: form.notes || null,
      brandColors,
    };

    const url = isEdit ? `/api/clients/${client.id}` : "/api/clients";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const saved = await res.json();
    router.push(`/clients/${saved.id}`);
    router.refresh();
  }

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <Input
        label="Client Name *"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Dr. Smith Eyeglass Center"
        required
      />

      <Input
        label="Industry"
        value={form.industry}
        onChange={(e) => set("industry", e.target.value)}
        placeholder="Optometry, Dental, Legal, HVAC…"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Client Domain"
          value={form.domain}
          onChange={(e) => set("domain", e.target.value)}
          placeholder="example.com"
          hint="Without https://"
        />
        <Input
          label="Subdomain Prefix"
          value={form.subdomain}
          onChange={(e) => set("subdomain", e.target.value)}
          placeholder="promo"
          hint="e.g. promo → promo.example.com"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Brand Colors</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Primary</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-slate-200"
              />
              <Input
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                placeholder="#4f46e5"
                className="font-mono text-xs"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Secondary</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.secondaryColor}
                onChange={(e) => set("secondaryColor", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-slate-200"
              />
              <Input
                value={form.secondaryColor}
                onChange={(e) => set("secondaryColor", e.target.value)}
                placeholder="#7c3aed"
                className="font-mono text-xs"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Accent</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.accentColor || "#f59e0b"}
                onChange={(e) => set("accentColor", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-slate-200"
              />
              <Input
                value={form.accentColor}
                onChange={(e) => set("accentColor", e.target.value)}
                placeholder="optional"
                className="font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <Textarea
        label="Notes"
        value={form.notes}
        onChange={(e) => set("notes", e.target.value)}
        placeholder="Internal notes about this client, their preferences, etc."
        rows={3}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={loading}>
          {isEdit ? "Save Changes" : "Create Client"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
