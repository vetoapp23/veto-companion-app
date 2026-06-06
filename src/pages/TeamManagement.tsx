// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrganizationInviteCode } from '@/components/OrganizationInviteCode';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, UserCircle, Crown, Shield } from 'lucide-react';

export default function TeamManagement() {
  const { user } = useAuth();
  const { data: teamMembers, isLoading, error } = useTeamMembers();

  // Debug logging
  console.log('👥 TeamManagement - Current user:', { 
    id: user?.id, 
    email: user?.email, 
    role: user?.profile?.role,
    organization_id: user?.organization_id,
    profile_organization_id: user?.profile?.organization_id
  });
  console.log('👥 TeamManagement - Team members:', teamMembers);
  console.log('👥 TeamManagement - Team members count:', teamMembers?.length);
  console.log('👥 TeamManagement - Loading:', isLoading);
  console.log('👥 TeamManagement - Error:', error);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
            <CardDescription>
              Impossible de charger les membres de l'équipe
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const admins = teamMembers?.filter(member => member.role === 'admin') || [];
  const assistants = teamMembers?.filter(member => member.role === 'assistant') || [];

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion de l'Équipe</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les membres de votre clinique vétérinaire
          </p>
        </div>
      </div>

      {/* Organization Invite Code */}
      <OrganizationInviteCode />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Membres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Vétérinaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Assistants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistants.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Veterinarians Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="mr-2 h-5 w-5 text-yellow-500" />
            Vétérinaires (Administrateurs)
          </CardTitle>
          <CardDescription>
            Membres avec accès complet à toutes les fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium flex items-center">
                      {admin.full_name || 'Sans nom'}
                      {admin.id === user?.id && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Vous
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                    <Crown className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                  <Badge variant={admin.status === 'approved' ? 'default' : 'secondary'}>
                    {admin.status === 'approved' ? 'Actif' : admin.status}
                  </Badge>
                </div>
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                Aucun vétérinaire dans l'équipe
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assistants Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-500" />
            Assistants Vétérinaires
          </CardTitle>
          <CardDescription>
            Membres avec accès aux fonctionnalités cliniques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assistants.map((assistant) => (
              <div
                key={assistant.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{assistant.full_name || 'Sans nom'}</p>
                    <p className="text-sm text-muted-foreground">{assistant.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                    <Shield className="mr-1 h-3 w-3" />
                    Assistant
                  </Badge>
                  <Badge variant={assistant.status === 'approved' ? 'default' : 'secondary'}>
                    {assistant.status === 'approved' ? 'Actif' : assistant.status}
                  </Badge>
                </div>
              </div>
            ))}
            {assistants.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <p className="text-muted-foreground">
                  Aucun assistant dans votre équipe
                </p>
                <p className="text-sm text-muted-foreground">
                  Partagez votre code d'invitation ci-dessus pour inviter des assistants
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}