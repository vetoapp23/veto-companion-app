import { Link } from "react-router-dom";
import { ArrowRight, Users, Calendar, FileText, BarChart3, Shield, PawPrint } from "lucide-react";
import heroImage from "@/assets/vet-hero.jpg";
import { SeoHead, siteUrl } from "@/components/SeoHead";

const faq = [
  {
    q: "Qu’est-ce que VetoCrm ?",
    a: "VetoCrm est un CRM / logiciel de gestion pour cliniques et cabinets vétérinaires : clients, animaux, rendez-vous, consultations, vaccins, antiparasites, stock et fermes.",
  },
  {
    q: "VetoCrm convient-il à un cabinet solo ?",
    a: "Oui. Une formule découverte gratuite permet de démarrer seul, puis d’évoluer vers des packs multi-utilisateurs quand l’équipe grandit.",
  },
  {
    q: "Les données de chaque clinique sont-elles isolées ?",
    a: "Oui. L’architecture multi-organisation isole les données par clinique, avec rôles admin et assistant.",
  },
  {
    q: "Puis-je gérer vaccins et antiparasites ?",
    a: "Oui. Protocoles, échéances, certificats et historique sont intégrés au dossier animal.",
  },
];

export default function Landing() {
  return (
    <div className="marketing-shell">
      <SeoHead
        title="VetoCrm — CRM vétérinaire pour cliniques et cabinets"
        description="Logiciel CRM vétérinaire : clients, animaux, RDV, consultations, vaccins, stock et fermes. Essai gratuit pour cabinets et cliniques."
        path="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl("/") },
            ],
          },
        ]}
      />

      <section className="mk-hero">
        <div className="mk-hero-media">
          <img
            src={heroImage}
            alt="Clinique vétérinaire moderne — logiciel VetoCrm pour la gestion du cabinet"
            width={1920}
            height={1080}
            fetchPriority="high"
          />
          <div className="mk-hero-veil" aria-hidden />
          <div className="mk-hero-mesh" aria-hidden />
        </div>

        <header className="mk-nav">
          <Link to="/" className="mk-brand" aria-label="VetoCrm — Accueil">
            Veto<span>Crm</span>
          </Link>
          <nav className="mk-nav-links" aria-label="Navigation principale">
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
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/login" className="mk-btn mk-btn-ghost">
              Accéder à mon espace
            </Link>
          </div>
        </div>

        <div className="mk-scroll-hint" aria-hidden />
      </section>

      <section className="mk-section" aria-labelledby="parcours-title">
        <p className="mk-section-label">Parcours</p>
        <h2 id="parcours-title" className="mk-section-title">
          En trois gestes, votre clinique est prête
        </h2>
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

      <section className="mk-section" style={{ paddingTop: 0 }} aria-labelledby="capacites-title">
        <p className="mk-section-label">Capacités</p>
        <h2 id="capacites-title" className="mk-section-title">
          Logiciel vétérinaire complet, une seule interface
        </h2>
        <p className="mk-section-copy">
          Conçu pour la réalité du terrain : compagnons, élevages, et le rythme d’une vraie clinique.
        </p>

        <div className="mk-capabilities">
          <article className="mk-cap">
            <h3>
              <Users className="h-5 w-5" aria-hidden /> Clients & animaux
            </h3>
            <p>Fiches complètes, historique médical, photos et suivi familial.</p>
          </article>
          <article className="mk-cap">
            <h3>
              <Calendar className="h-5 w-5" aria-hidden /> Agenda intelligent
            </h3>
            <p>Rendez-vous, rappels et vue claire de la journée de la clinique.</p>
          </article>
          <article className="mk-cap">
            <h3>
              <FileText className="h-5 w-5" aria-hidden /> Consultations & ordonnances
            </h3>
            <p>Comptes-rendus structurés, prescriptions et documents imprimables.</p>
          </article>
          <article className="mk-cap">
            <h3>
              <PawPrint className="h-5 w-5" aria-hidden /> Vaccins & antiparasites
            </h3>
            <p>Protocoles, échéances et certificats sans perdre le fil.</p>
          </article>
          <article className="mk-cap">
            <h3>
              <BarChart3 className="h-5 w-5" aria-hidden /> Stock & comptabilité
            </h3>
            <p>Inventaire, alertes et suivi financier selon votre pack.</p>
          </article>
          <article className="mk-cap">
            <h3>
              <Shield className="h-5 w-5" aria-hidden /> Sécurité multi-clinique
            </h3>
            <p>Données isolées par organisation, rôles et accès maîtrisés.</p>
          </article>
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 0 }} aria-labelledby="faq-title">
        <p className="mk-section-label">FAQ</p>
        <h2 id="faq-title" className="mk-section-title">
          Questions fréquentes sur le CRM vétérinaire
        </h2>
        <div className="mk-faq" style={{ maxWidth: "42rem", margin: "1.5rem auto 0", textAlign: "left" }}>
          {faq.map((item) => (
            <details
              key={item.q}
              style={{
                borderBottom: "1px solid var(--mk-line)",
                padding: "1rem 0",
              }}
            >
              <summary
                className="mk-display"
                style={{ cursor: "pointer", fontWeight: 600, fontSize: "1.05rem" }}
              >
                {item.q}
              </summary>
              <p style={{ marginTop: "0.65rem", color: "var(--mk-muted)", lineHeight: 1.55 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mk-cta-band">
        <h2>Prêt à moderniser votre pratique vétérinaire ?</h2>
        <p>
          Démarrez gratuitement, évoluez quand vous voulez. Annulation simple, sans engagement opaque.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
          <Link to="/register" className="mk-btn mk-btn-primary">
            Créer mon compte
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link to="/pricing" className="mk-btn mk-btn-ghost">
            Voir les tarifs CRM
          </Link>
        </div>
      </div>

      <footer className="mk-footer">
        <nav aria-label="Pied de page" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginBottom: "0.75rem" }}>
          <Link to="/pricing" className="mk-link">Tarifs</Link>
          <Link to="/register" className="mk-link">Inscription</Link>
          <Link to="/login" className="mk-link">Connexion</Link>
        </nav>
        <p>© {new Date().getFullYear()} VetoCrm — CRM et logiciel de gestion pour cliniques vétérinaires</p>
      </footer>
    </div>
  );
}
