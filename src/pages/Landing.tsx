import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Calendar, Shield, BarChart3, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/vet-hero.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VetoCrm.com</span>
          </div>
          <div className="flex gap-2 md:gap-4 items-center">
            <Button variant="ghost" asChild>
              <Link to="/pricing">Tarifs</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Commencer</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Heart className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Solution CRM Vétérinaire Complète
                  </span>
                </div>
                
                <h1 className="text-5xl font-bold leading-tight">
                  Gérez votre pratique
                  <span className="gradient-primary bg-clip-text text-transparent block">
                    vétérinaire efficacement
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl">
                  VetoCrm.com vous aide à gérer vos clients, leurs animaux, les rendez-vous, 
                  consultations et l'historique médical. Optimisez votre pratique avec 
                  notre solution tout-en-un.
                </p>
              </div>
              
              <div className="flex gap-4">
                <Button size="lg" className="gap-2 medical-glow" asChild>
                  <Link to="/register">
                    Commencer gratuitement
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" className="gap-2" asChild>
                  <Link to="/login">
                    Voir la démo
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <img 
                src={heroImage}
                alt="Vétérinaire professionnel"
                className="w-96 h-64 object-cover rounded-xl shadow-medical"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Tout ce dont vous avez besoin pour votre clinique
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une solution complète pour moderniser et optimiser votre pratique vétérinaire
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gestion des Clients</h3>
              <p className="text-muted-foreground">
                Gérez facilement vos clients et leurs animaux avec un système intuitif et complet.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Rendez-vous</h3>
              <p className="text-muted-foreground">
                Planifiez et gérez vos rendez-vous avec un calendrier intelligent et flexible.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <FileText className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Consultations</h3>
              <p className="text-muted-foreground">
                Documentez vos consultations et maintenez un historique médical détaillé.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Statistiques</h3>
              <p className="text-muted-foreground">
                Analysez votre activité avec des rapports détaillés et des tableaux de bord.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sécurisé</h3>
              <p className="text-muted-foreground">
                Vos données sont protégées avec les plus hauts standards de sécurité.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <Heart className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Farm Management</h3>
              <p className="text-muted-foreground">
                Gérez les exploitations agricoles et suivez la santé des troupeaux.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">
              Prêt à moderniser votre pratique ?
            </h2>
            <p className="text-lg text-muted-foreground">
              Rejoignez des centaines de vétérinaires qui font confiance à VetoCrm.com 
              pour gérer leur clinique efficacement.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="gap-2 medical-glow" asChild>
                <Link to="/register">
                  Commencer maintenant
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} VetoCrm.com. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}