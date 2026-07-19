import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAllUsers } from "@/hooks/useSuperAdminData";
import { adminUpdateUser } from "@/lib/superAdmin";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { statusBadge } from "./Overview";

const USER_STATUSES = ["pending", "approved", "rejected", "suspended"];
const USER_ROLES = ["assistant", "admin", "super_admin"];
const PAGE_SIZE = 30;

export default function SuperAdminUsers() {
  const { data: users = [], isLoading, refetch } = useAllUsers();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return users.filter(
      (u: any) =>
        (!s ||
          u.email?.toLowerCase().includes(s) ||
          u.full_name?.toLowerCase().includes(s) ||
          u.organization?.name?.toLowerCase().includes(s)) &&
        (statusFilter === "all" || u.status === statusFilter) &&
        (roleFilter === "all" || u.role === roleFilter)
    );
  }, [users, search, statusFilter, roleFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const update = async (id: string, patch: any, label: string) => {
    try {
      if (patch.role === "super_admin" && !confirm("Promouvoir cet utilisateur en super_admin ?")) {
        return;
      }
      await adminUpdateUser(id, patch);
      toast({ title: label });
      qc.invalidateQueries({ queryKey: ["super-admin"] });
      refetch();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Email / nom / clinique"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            {USER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous rôles</SelectItem>
            {USER_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-3">Utilisateur</th>
                <th className="p-3">Clinique</th>
                <th className="p-3">Rôle</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Chargement…</td></tr>
              )}
              {!isLoading && slice.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Aucun utilisateur</td></tr>
              )}
              {slice.map((u: any) => (
                <tr key={u.id} className="border-b hover:bg-muted/20">
                  <td className="p-3">
                    <div className="font-medium">{u.full_name || u.username}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="p-3 text-xs">{u.organization?.name ?? "—"}</td>
                  <td className="p-3">
                    <Select value={u.role} onValueChange={(v) => update(u.id, { role: v }, "Rôle mis à jour")}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">{statusBadge(u.status)}</td>
                  <td className="p-3 space-x-1">
                    {u.status !== "approved" && (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => update(u.id, { status: "approved" }, "Approuvé")}>
                        Approuver
                      </Button>
                    )}
                    {u.status !== "suspended" && (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => update(u.id, { status: "suspended" }, "Suspendu")}>
                        Suspendre
                      </Button>
                    )}
                    {u.status !== "rejected" && (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => update(u.id, { status: "rejected", rejection_reason: "Rejeté par super admin" }, "Rejeté")}>
                        Rejeter
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{filtered.length} users · page {page + 1}/{pageCount}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
          <Button variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
        </div>
      </div>
    </div>
  );
}
