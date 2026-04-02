import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { ClientForm } from "@/components/clients/ClientForm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await db.client.findUnique({ where: { id: clientId } });

  if (!client) notFound();

  // Serialize for client component
  const serialized = {
    ...client,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  };

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <Link
          href={`/clients/${clientId}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {client.name}
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Edit Client
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Update details for {client.name}.
        </p>
        <ClientForm client={serialized} />
      </div>
    </AppShell>
  );
}
