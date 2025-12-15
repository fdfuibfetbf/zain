'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api';

export default function LogsPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const [a, w] = await Promise.all([
          apiFetch<{ logs: any[] }>('/admin/audit-logs?limit=50'),
          apiFetch<{ deliveries: any[] }>('/admin/webhook-deliveries?limit=50'),
        ]);
        setAuditLogs(a.logs);
        setWebhooks(w.deliveries);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      }
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold">Logs</h1>
      <p className="mt-1 text-sm text-gray-600">Audit logs and WHMCS webhook deliveries.</p>

      {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border">
          <div className="border-b p-4 text-sm font-semibold">Audit logs</div>
          <div className="divide-y">
            {auditLogs.map((l) => (
              <div key={l.id} className="p-4 text-xs">
                <div className="font-medium">
                  {l.action} · {l.actorType}:{l.actorWhmcsId ?? '-'}
                </div>
                <div className="text-gray-600">
                  {l.targetType}:{l.targetId ?? '-'} · {new Date(l.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {auditLogs.length === 0 ? <div className="p-4 text-sm text-gray-600">No logs yet.</div> : null}
          </div>
        </section>

        <section className="rounded-lg border">
          <div className="border-b p-4 text-sm font-semibold">Webhook deliveries</div>
          <div className="divide-y">
            {webhooks.map((w) => (
              <div key={w.id} className="p-4 text-xs">
                <div className="font-medium">{w.event}</div>
                <div className="text-gray-600">
                  verified={String(w.verified)} · {new Date(w.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {webhooks.length === 0 ? <div className="p-4 text-sm text-gray-600">No webhooks yet.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}


