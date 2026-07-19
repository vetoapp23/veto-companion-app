import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SeoHead } from "@/components/SeoHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SeoHead
        title="Page introuvable — VetoCrm"
        description="Cette page n'existe pas sur VetoCrm."
        path={location.pathname}
        noIndex
      />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Page introuvable</p>
        <Link to="/" className="text-primary hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
