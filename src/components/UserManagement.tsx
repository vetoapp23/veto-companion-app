// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Mail, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';

interface PendingUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  rejection_reason?: string;
  days_waiting: number;
}

const UserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending users (only assistants, not admins)
  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('status', 'pending')
        .eq('role', 'assistant')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate days waiting
      const usersWithDays = data.map(user => ({
        ...user,
        days_waiting: Math.floor(
          (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
        )
      }));

      setPendingUsers(usersWithDays);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs en attente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Approve user
  const approveUser = async (userId: string) => {
    setActionLoading(userId);
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

      // Refresh the list
      fetchPendingUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'approuver l\'utilisateur.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Reject user
  const rejectUser = async () => {
    if (!selectedUser || !rejectionReason.trim()) return;

    setActionLoading(selectedUser.id);
    try {
      const { error } = await supabase.rpc('reject_user', {
        user_id_param: selectedUser.id,
        rejected_by_param: user?.id,
        reason_param: rejectionReason
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Utilisateur rejeté.',
      });

      setShowRejectModal(false);
      setSelectedUser(null);
      setRejectionReason('');
      
      // Refresh the list
      fetchPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter l\'utilisateur.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (user: PendingUser) => {
    setSelectedUser(user);
    setShowRejectModal(true);
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Utilisateurs en attente d'approbation ({pendingUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>Aucun utilisateur en attente d'approbation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((pendingUser) => (
                <Card key={pendingUser.id} className="border-l-4 border-l-yellow-400">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">
                            {pendingUser.full_name || pendingUser.username}
                          </h4>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {pendingUser.role}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {pendingUser.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Inscrit le {new Date(pendingUser.created_at).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {pendingUser.days_waiting} jour{pendingUser.days_waiting > 1 ? 's' : ''} d'attente
                          </div>
                        </div>
                        
                        {pendingUser.days_waiting > 2 && (
                          <div className="flex items-center gap-1 text-orange-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            Attente prolongée - action recommandée
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => approveUser(pendingUser.id)}
                          disabled={actionLoading === pendingUser.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        
                        <Button
                          onClick={() => handleRejectClick(pendingUser)}
                          disabled={actionLoading === pendingUser.id}
                          variant="destructive"
                          size="sm"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Rejeter la demande d'inscription
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p><strong>Utilisateur:</strong> {selectedUser.full_name || selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Rôle demandé:</strong> {selectedUser.role}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Raison du rejet <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Expliquez pourquoi cette demande est rejetée..."
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRejectModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={rejectUser}
              disabled={!rejectionReason.trim() || actionLoading === selectedUser?.id}
            >
              <UserX className="h-4 w-4 mr-1" />
              Rejeter définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;