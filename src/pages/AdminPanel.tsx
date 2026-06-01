import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  UserPlus,
  UserCheck, 
  UserX,
  Shield,
  Activity,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import UserManagement from '@/components/UserManagement';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  status: string;
  approved_by: string;
  approved_at: string;
  rejection_reason: string;
  last_login: string;
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  created_at: string;
  user_profile?: {
    full_name: string;
    email: string;
  };
}

interface AdminStats {
  pending_users: number;
  approved_users: number;
  rejected_users: number;
  suspended_users: number;
  admin_count: number;
  assistant_count: number;
  today_activities: number;
  pending_invitations: number;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('approvals');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const [rejectionReason, setRejectionReason] = useState('');

  const defaultPermissions = {
    can_manage_clients: true,
    can_manage_animals: true,
    can_create_consultations: true,
    can_view_reports: false,
    can_manage_stock: false,
    can_manage_accounting: false,
    can_manage_farms: false
  };

  const [userPermissions, setUserPermissions] = useState(defaultPermissions);

  useEffect(() => {
    // Check if user is admin
    if (user?.profile?.role !== 'admin') {
      toast({
        title: 'Accès refusé',
        description: 'Vous n\'avez pas les permissions pour accéder au panneau d\'administration.',
        variant: 'destructive',
      });
      return;
    }

    fetchAdminStats();
    fetchUsers();
    fetchActivityLogs();
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_dashboard_stats')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select(`
          *,
          user_profile:user_profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('approve_user', {
        user_id_param: userId,
        approved_by_param: user?.id
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Utilisateur approuvé avec succès.',
      });

      fetchUsers();
      fetchAdminStats();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'approuver l\'utilisateur.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase.rpc('reject_user', {
        user_id_param: userId,
        rejected_by_param: user?.id,
        reason_param: reason
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Utilisateur rejeté avec succès.',
      });

      setRejectionReason('');
      fetchUsers();
      fetchAdminStats();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter l\'utilisateur.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePermissions = async (userId: string, permissions: Record<string, boolean>) => {
    try {
      const { error } = await supabase.rpc('update_user_permissions', {
        user_id_param: userId,
        permissions_param: permissions,
        updated_by_param: user?.id
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Permissions mises à jour avec succès.',
      });

      setShowPermissionsModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les permissions.',
        variant: 'destructive',
      });
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Utilisateur suspendu avec succès.',
      });

      fetchUsers();
      fetchAdminStats();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de suspendre l\'utilisateur.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente', icon: Clock },
      'approved': { color: 'bg-green-100 text-green-800', label: 'Approuvé', icon: CheckCircle },
      'rejected': { color: 'bg-red-100 text-red-800', label: 'Rejeté', icon: XCircle },
      'suspended': { color: 'bg-gray-100 text-gray-800', label: 'Suspendu', icon: AlertTriangle }
    };
    
    const badge = badges[status as keyof typeof badges] || { 
      color: 'bg-gray-100 text-gray-800', 
      label: status, 
      icon: Clock 
    };
    
    const IconComponent = badge.icon;
    
    return (
      <Badge className={badge.color} variant="secondary">
        <IconComponent className="h-3 w-3 mr-1" />
        {badge.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      'admin': { color: 'bg-purple-100 text-purple-800', label: 'Administrateur' },
      'assistant': { color: 'bg-blue-100 text-blue-800', label: 'Assistant' }
    };
    
    const badge = badges[role as keyof typeof badges] || { 
      color: 'bg-gray-100 text-gray-800', 
      label: role 
    };
    
    return <Badge className={badge.color} variant="secondary">{badge.label}</Badge>;
  };

  const filteredUsers = users.filter(user => {
    // Only show assistants (not admins)
    if (user.role !== 'assistant') return false;
    
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  if (user?.profile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez pas les permissions pour accéder au panneau d'administration.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panneau d'Administration</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">Approbations en attente</TabsTrigger>
          <TabsTrigger value="users">Assistants</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
                  <SelectItem value="suspended">Suspendus</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4">Utilisateur</th>
                      <th className="p-4">Rôle</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4">Inscrit le</th>
                      <th className="p-4">Dernière connexion</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((userProfile) => (
                      <tr key={userProfile.id} className="border-b">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{userProfile.full_name || userProfile.username}</p>
                            <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          {getRoleBadge(userProfile.role)}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(userProfile.status)}
                        </td>
                        <td className="p-4">
                          {new Date(userProfile.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {userProfile.last_login 
                            ? new Date(userProfile.last_login).toLocaleDateString()
                            : 'Jamais'
                          }
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {userProfile.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleApproveUser(userProfile.id)}
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Approuver
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    const reason = prompt('Raison du rejet:');
                                    if (reason) handleRejectUser(userProfile.id, reason);
                                  }}
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Rejeter
                                </Button>
                              </>
                            )}
                            
                            {userProfile.status === 'approved' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUser(userProfile);
                                    setUserPermissions({ ...defaultPermissions, ...userProfile.permissions });
                                    setShowPermissionsModal(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Permissions
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleSuspendUser(userProfile.id)}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Suspendre
                                </Button>
                              </>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(userProfile);
                                setShowUserModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <h2 className="text-lg font-semibold">Journal d'activité</h2>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4">Date</th>
                      <th className="p-4">Utilisateur</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Ressource</th>
                      <th className="p-4">Détails</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.map((log) => (
                      <tr key={log.id} className="border-b">
                        <td className="p-4">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{log.user_profile?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{log.user_profile?.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{log.action}</Badge>
                        </td>
                        <td className="p-4">{log.resource_type}</td>
                        <td className="p-4">
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {JSON.stringify(log.details)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Gérer les permissions - {selectedUser.full_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(userPermissions).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="text-sm font-medium">
                      {key.replace('can_', '').replace('_', ' ').toUpperCase()}
                    </Label>
                    <input
                      type="checkbox"
                      id={key}
                      checked={value}
                      onChange={(e) => 
                        setUserPermissions({ ...userPermissions, [key]: e.target.checked })
                      }
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={() => handleUpdatePermissions(selectedUser.id, userPermissions)}
                >
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Détails de l'utilisateur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom complet</Label>
                  <p className="font-medium">{selectedUser.full_name || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Nom d'utilisateur</Label>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <Label>Rôle</Label>
                  <div>{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <Label>Statut</Label>
                  <div>{getStatusBadge(selectedUser.status)}</div>
                </div>
                <div>
                  <Label>Date d'inscription</Label>
                  <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              {selectedUser.rejection_reason && (
                <div>
                  <Label>Raison du rejet</Label>
                  <p className="text-red-600">{selectedUser.rejection_reason}</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;