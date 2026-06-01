import { HeroSection } from "@/components/HeroSection";
import { DashboardStats } from "@/components/DashboardStats";
import { ClientsOverview } from "@/components/ClientsOverview";
import { PetsOverview } from "@/components/PetsOverview";

const Index = () => {
  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <HeroSection />
      
      <section>
        <h2 className="text-2xl font-bold mb-6">Vue d'ensemble</h2>
        <DashboardStats />
      </section>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <ClientsOverview />
        <PetsOverview />
      </div>
    </div>
  );
};

export default Index;
