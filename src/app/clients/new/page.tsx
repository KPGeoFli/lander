import { AppShell } from "@/components/layout/AppShell";
import { ClientForm } from "@/components/clients/ClientForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewClientPage() {
  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to clients
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          New Client
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Add a new client to start building landing pages for them.
        </p>
        <ClientForm />
      </div>
    </AppShell>
  );
}
