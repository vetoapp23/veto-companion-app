// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Key, 
  Bell, 
  Globe, 
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

export default function AuthSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // État pour les paramètres de sécurité
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30, // minutes
    passwordExpiry: 90, // jours
    loginNotifications: true,
    deviceTracking: true,
    autoLogout: true
  });

  // État pour les paramètres de session
  const [sessionSettings, setSessionSettings] = useState({
    rememberMe: true,
    autoLogin: false,
    sessionDuration: 8, // heures
    maxConcurrentSessions: 3
  });

  // État pour les paramètres de notification
  const [notificationSettings, setNotificationSettings] = useState({
    loginAlerts: true,
    securityAlerts: true,
    deviceAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });

  // État pour les paramètres de confidentialité
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: false,
    analytics: true,
    crashReports: true,
    marketingEmails: false,
    profileVisibility: 'private'
  });

  // État pour les paramètres d'affichage
  const [displaySettings, setDisplaySettings] = useState({
    language: 'fr',
    timezone: 'Africa/Casablanca',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    theme: 'system'
  });

  // État pour les sessions actives
  const [activeSessions] = useState([
    {
      id: 1,
      device: 'MacBook Pro',
      browser: 'Chrome',
      location: 'Rabat, Maroc',
      lastActive: 'Maintenant',
      current: true,
      ip: '192.168.1.100'
    },
    {
      id: 2,
      device: 'iPhone 14',
      browser: 'Safari',
      location: 'Rabat, Maroc',
      lastActive: 'Il y a 2 heures',
      current: false,
      ip: '192.168.1.101'
    }
  ]);

  const handleSaveSecurity = () => {
    toast({
      title: "Paramètres de sécurité sauvegardés",
      description: "Vos paramètres de sécurité ont été mis à jour.",
    });
  };

  const handleSaveSession = () => {
    toast({
      title: "Paramètres de session sauvegardés",
      description: "Vos paramètres de session ont été mis à jour.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Paramètres de notification sauvegardés",
      description: "Vos paramètres de notification ont été mis à jour.",
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: "Paramètres de confidentialité sauvegardés",
      description: "Vos paramètres de confidentialité ont été mis à jour.",
    });
  };

  const handleSaveDisplay = () => {
    toast({
      title: "Paramètres d'affichage sauvegardés",
      description: "Vos paramètres d'affichage ont été mis à jour.",
    });
  };

  const handleTerminateSession = (sessionId: number) => {
    toast({
      title: "Session terminée",
      description: "La session a été fermée avec succès.",
    });
  };

  const handleTerminateAllSessions = () => {
    toast({
      title: "Toutes les sessions terminées",
      description: "Toutes les autres sessions ont été fermées.",
    });
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (device.includes('iPad') || device.includes('Tablet')) {
      return <Tablet className="h-4 w-4" />;
    } else {
      return <Monitor className="h-4 w-4" />;
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Paramètres de Connexion</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gérez vos paramètres de sécurité et de session
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Paramètres de Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Authentification à deux facteurs</Label>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez une couche de sécurité supplémentaire
                  </p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Délai d'expiration de session (minutes)</Label>
                <Select
                  value={securitySettings.sessionTimeout.toString()}
                  onValueChange={(value) => 
                    setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 heure</SelectItem>
                    <SelectItem value="120">2 heures</SelectItem>
                    <SelectItem value="480">8 heures</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Expiration du mot de passe (jours)</Label>
                <Select
                  value={securitySettings.passwordExpiry.toString()}
                  onValueChange={(value) => 
                    setSecuritySettings(prev => ({ ...prev, passwordExpiry: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 jours</SelectItem>
                    <SelectItem value="60">60 jours</SelectItem>
                    <SelectItem value="90">90 jours</SelectItem>
                    <SelectItem value="180">6 mois</SelectItem>
                    <SelectItem value="365">1 an</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notifications de connexion</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des alertes pour les nouvelles connexions
                  </p>
                </div>
                <Switch
                  checked={securitySettings.loginNotifications}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, loginNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Suivi des appareils</Label>
                  <p className="text-sm text-muted-foreground">
                    Surveillez les appareils connectés
                  </p>
                </div>
                <Switch
                  checked={securitySettings.deviceTracking}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, deviceTracking: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Déconnexion automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Déconnexion après inactivité
                  </p>
                </div>
                <Switch
                  checked={securitySettings.autoLogout}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, autoLogout: checked }))
                  }
                />
              </div>
            </div>

            <Button onClick={handleSaveSecurity} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder les paramètres de sécurité
            </Button>
          </CardContent>
        </Card>

        {/* Sessions Actives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Sessions Actives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(session.device)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.device}</span>
                        {session.current && (
                          <Badge variant="secondary" className="text-xs">
                            Actuel
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.browser} • {session.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dernière activité: {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      Terminer
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            <Button
              variant="destructive"
              onClick={handleTerminateAllSessions}
              className="w-full"
            >
              Terminer toutes les autres sessions
            </Button>
          </CardContent>
        </Card>

        {/* Paramètres de Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Gestion des Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Se souvenir de moi</Label>
                  <p className="text-sm text-muted-foreground">
                    Restez connecté entre les sessions
                  </p>
                </div>
                <Switch
                  checked={sessionSettings.rememberMe}
                  onCheckedChange={(checked) => 
                    setSessionSettings(prev => ({ ...prev, rememberMe: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Connexion automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Connexion automatique au démarrage
                  </p>
                </div>
                <Switch
                  checked={sessionSettings.autoLogin}
                  onCheckedChange={(checked) => 
                    setSessionSettings(prev => ({ ...prev, autoLogin: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Durée de session (heures)</Label>
                <Select
                  value={sessionSettings.sessionDuration.toString()}
                  onValueChange={(value) => 
                    setSessionSettings(prev => ({ ...prev, sessionDuration: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 heure</SelectItem>
                    <SelectItem value="4">4 heures</SelectItem>
                    <SelectItem value="8">8 heures</SelectItem>
                    <SelectItem value="12">12 heures</SelectItem>
                    <SelectItem value="24">24 heures</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sessions simultanées maximum</Label>
                <Select
                  value={sessionSettings.maxConcurrentSessions.toString()}
                  onValueChange={(value) => 
                    setSessionSettings(prev => ({ ...prev, maxConcurrentSessions: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 session</SelectItem>
                    <SelectItem value="2">2 sessions</SelectItem>
                    <SelectItem value="3">3 sessions</SelectItem>
                    <SelectItem value="5">5 sessions</SelectItem>
                    <SelectItem value="10">10 sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSaveSession} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder les paramètres de session
            </Button>
          </CardContent>
        </Card>

        {/* Paramètres de Notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications de Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alertes de connexion</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications pour les nouvelles connexions
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.loginAlerts}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, loginAlerts: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alertes de sécurité</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications pour les événements de sécurité
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.securityAlerts}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, securityAlerts: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alertes d'appareil</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications pour les nouveaux appareils
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.deviceAlerts}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, deviceAlerts: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez les alertes par email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notifications SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez les alertes par SMS
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notifications push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez les alertes push
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>
            </div>

            <Button onClick={handleSaveNotifications} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder les paramètres de notification
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}