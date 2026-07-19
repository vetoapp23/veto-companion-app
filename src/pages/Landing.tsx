import { Link } from "react-router-dom";
import { ArrowRight, Users, Calendar, FileText, BarChart3, Shield, PawPrint } from "lucide-react";
import heroImage from "@/assets/vet-hero.jpg";

export default function Landing() {
  return (
    <div className="marketing-shell">
      <section className="mk-hero">
        <div className="mk-hero-media" aria-hidden>
          <img src={heroImage} alt="" />
          <div className="mk-hero-veil" />
          <div className="mk-hero-mesh" />
        </div>

        <header className="mk-nav">
          <Link to="/" className="mk-brand">
            Veto<span>Crm</span>
          </Link>
          <nav className="mk-nav-links">
            <Link to="/pricing" className="mk-link hidden sm:inline-flex">
              Tarifs
            </Link>
            <Link to="/login" className="mk-link">
              Se connecter
            </Link>
            <Link to="/register" className="mk-btn mk-btn-primary">
              Commencer
            </Link>
          </nav>
        </header>

        <div className="mk-hero-body">
          <h1 className="mk-hero-title">
            Veto<span style={{ color: "var(--mk-mint)" }}>Crm</span>
          </h1>
          <p
            className="mk-display"
            style={{
              fontSize: "clamp(1.35rem, 3.5vw, 2rem)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              margin: "0.5rem 0 0",
              color: "rgba(244, 251, 249, 0.95)",
              animation: "mk-fade-up 0.8s ease 0.08s both",
            }}
          >
            La clinique, fluide.
          </p>
          <p className="mk-hero-sub">
            Clients, animaux, rendez-vous et dossiers médicaux — un CRM pensé pour les vétérinaires,
            du cabinet solo à la clinique multi-praticiens.
          </p>
          <div className="mk-hero-ctas">
            <Link to="/register" className="mk-btn mk-btn-primary">
              Essayer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="mk-btn mk-btn-ghost">
              Accéder à mon espace
            </Link>
          </div>
        </div>

        <div className="mk-scroll-hint" aria-hidden />
      </section>

      <section className="mk-section">
        <p className="mk-section-label">Parcours</p>
        <h2 className="mk-section-title">En trois gestes, votre clinique est prête</h2>
        <p className="mk-section-copy">
          Un flux simple : créer l’espace, inviter l’équipe, soigner. Sans friction, sans tableurs.
        </p>

        <div className="mk-flow">
          <div className="mk-flow-step">
            <div>
              <h3>Créez votre clinique</h3>
              <p>
                Choisissez un pack, inscrivez-vous en quelques minutes. Votre organisation et vos quotas
                sont prêts immédiatement.
              </p>
            </div>
          </div>
          <div className="mk-flow-step">
            <div>
              <h3>Invitez votre équipe</h3>
              <p>
                Admins et assistants rejoignent avec un code. Permissions claires, données isolées par
                clinique.
              </p>
            </div>
          </div>
          <div className="mk-flow-step">
            <div>
              <h3>Pilotez au quotidien</h3>
              <p>
                RDV, consultations, vaccins, antiparasites, stock et fermes — tout synchronisé, partout.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 0 }}>
        <p className="mk-section-label">Capacités</p>
        <h2 className="mk-section-title">Tout le métier, une seule interface</h2>
        <p className="mk-section-copy">
          Conçu pour la réalité du terrain : compagnons, élevages, et le rythme d’une vraie clinique.
        </p>

        <div className="mk-capabilities">
          <div className="mk-cap">
            <h3>
              <Users className="h-5 w-5" /> Clients & animaux
            </h3>
            <p>Fiches complètes, historique médical, photos et suivi familial.</p>
          </div>
          <div className="mk-cap">
            <h3>
              <Calendar className="h-5 w-5" /> Agenda intelligent
            </h3>
            <p>Rendez-vous, rappels et vue claire de la journée de la clinique.</p>
          </div>
          <div className="mk-cap">
            <h3>
              <FileText className="h-5 w-5" /> Consultations & ordonnances
            </h3>
            <p>Comptes-rendus structurés, prescriptions et documents imprimables.</p>
          </div>
          <div className="mk-cap">
            <h3>
              <PawPrint className="h-5 w-5" /> Vaccins & antiparasites
            </h3>
            <p>Protocoles, échéances et certificats sans perdre le fil.</p>
          </div>
          <div className="mk-cap">
            <h3>
              <BarChart3 className="h-5 w-5" /> Stock & comptabilité
            </h3>
            <p>Inventaire, alertes et suivi financier selon votre pack.</p>
          </div>
          <div className="mk-cap">
            <h3>
              <Shield className="h-5 w-5" /> Sécurité multi-clinique
            </h3>
            <p>Données isolées par organisation, rôles et accès maîtrisés.</p>
          </div>
        </div>
      </section>

      <div className="mk-cta-band">
        <h2>Prêt à moderniser votre pratique ?</h2>
        <p>
          Démarrez gratuitement, évoluez quand vous voulez. Annulation simple, sans engagement opaque.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
          <Link to="/register" className="mk-btn mk-btn-primary">
            Créer mon compte
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/pricing" className="mk-btn mk-btn-ghost">
            Voir les tarifs
          </Link>
        </div>
      </div>

      <footer className="mk-footer">
        © {new Date().getFullYear()} VetoCrm — CRM vétérinaire
      </footer>
    </div>
  );
}
