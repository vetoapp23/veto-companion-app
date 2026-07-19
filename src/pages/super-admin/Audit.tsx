import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { fetchAuditLogs } from "@/lib/superAdmin";
import { Badge } from "@/components/ui/badge";

export default function SuperAdminAudit() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["super-admin", "audit"],
    queryFn: () => fetchAuditLogs(200),
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Journal des actions Super Admin (immutable côté UI). Les écritures sensibles passent par des RPC auditées.
      </p>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Acteur</th>
                <th className="p-3">Action</th>
                <th className="p-3">Ressource</th>
                <th className="p-3">Org</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Chargement…</td></tr>
              )}
              {!isLoading && logs.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Aucun événement</td></tr>
              )}
              {(logs as any[]).map((l) => (
                <tr key={l.id} className="border-b hover:bg-muted/20 align-top">
                  <td className="p-3 text-xs whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString("fr-FR")}
                  </td>
                  <td className="p-3 text-xs">{l.actor_email || "—"}</td>
                  <td className="p-3">
                    <Badge variant="secondary" className="font-mono text-[11px]">{l.action}</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    {l.resource_type}
                    {l.resource_id ? (
                      <div className="text-muted-foreground font-mono truncate max-w-[180px]">{l.resource_id}</div>
                    ) : null}
                  </td>
                  <td className="p-3 text-xs font-mono">{l.organization_id?.slice?.(0, 8) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
