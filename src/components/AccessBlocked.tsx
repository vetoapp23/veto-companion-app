import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Clock, Wrench } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { accessMessage, type AccessStatus } from "@/hooks/useAccessStatus";

export function AccessBlocked({ status }: { status: AccessStatus }) {
  const { logout } = useAuth();
  const isMaint = status.access === "maintenance";
  const isPending = status.access === "pending";
  const Icon = isMaint ? Wrench : isPending ? Clock : ShieldAlert;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4 rounded-2xl border bg-card p-8 shadow-[var(--shadow-card)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-bold">
          {isMaint ? "Maintenance" : isPending ? "Compte en attente" : "Accès bloqué"}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{accessMessage(status)}</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Button variant="outline" asChild>
            <Link to="/">Accueil</Link>
          </Button>
          <Button
            variant="default"
            onClick={() => {
              void logout();
            }}
          >
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}
