// @ts-nocheck
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation("settings");
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
      lastActiveKey: 'now' as const,
      current: true,
      ip: '192.168.1.100'
    },
    {
      id: 2,
      device: 'iPhone 14',
      browser: 'Safari',
      lastActiveKey: 'hoursAgo' as const,
      lastActiveHours: 2,
      current: false,
      ip: '192.168.1.101'
    }
  ]);

  const handleSaveSecurity = () => {
    toast({
      title: t("authSettings.security.savedTitle"),
      description: t("authSettings.security.savedBody"),
    });
  };

  const handleSaveSession = () => {
    toast({
      title: t("authSettings.session.savedTitle"),
      description: t("authSettings.session.savedBody"),
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: t("authSettings.notifications.savedTitle"),
      description: t("authSettings.notifications.savedBody"),
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: t("authSettings.privacy.savedTitle"),
      description: t("authSettings.privacy.savedBody"),
    });
  };

  const handleSaveDisplay = () => {
    toast({
      title: t("authSettings.display.savedTitle"),
      description: t("authSettings.display.savedBody"),
    });
  };

  const handleTerminateSession = (sessionId: number) => {
    toast({
      title: t("authSettings.activeSessions.terminatedTitle"),
      description: t("authSettings.activeSessions.terminatedBody"),
    });
  };

  const handleTerminateAllSessions = () => {
    toast({
      title: t("authSettings.activeSessions.allTerminatedTitle"),
      description: t("authSettings.activeSessions.allTerminatedBody"),
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

  const formatLastActive = (session: (typeof activeSessions)[number]) => {
    if (session.lastActiveKey === 'now') {
      return t("authSettings.activeSessions.now");
    }
    return t("authSettings.activeSessions.hoursAgo", { count: session.lastActiveHours ?? 2 });
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t("authSettings.title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t("authSettings.description")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Paramètres de Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("authSettings.security.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>{t("authSettings.security.twoFactor")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("authSettings.security.twoFactorDesc")}
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
                <Label>{t("authSettings.security.sessionTimeout")}</Label>
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
                    <SelectItem value="15">{t("authSettings.options.minutes15")}</SelectItem>
                    <SelectItem value="30">{t("authSettings.options.minutes30")}</SelectItem>
                    <SelectItem value="60">{t("authSettings.options.hours1")}</SelectItem>
                    <SelectItem value="120">{t("authSettings.options.hours2")}</SelectItem>
                    <SelectItem value="480">{t("authSettings.options.hours8")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("authSettings.security.passwordExpiry")}</Label>
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
                    <SelectItem value="30">{t("authSettings.options.days30")}</SelectItem>
                    <SelectItem value="60">{t("authSettings.options.days60")}</SelectItem>
                    <SelectItem value="90">{t("authSettings.options.days90")}</SelectItem>
                    <SelectItem value="180">{t("authSettings.options.months6")}</SelectItem>
                    <SelectItem value="365">{t("authSettings.options.year1")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>{t("authSettings.security.loginNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("authSettings.security.loginNotificationsDesc")}
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
                  <Label>{t("authSettings.security.deviceTracking")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("authSettings.security.deviceTrackingDesc")}
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
                  <Label>{t("authSettings.security.autoLogout")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("authSettings.security.autoLogoutDesc")}
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
              {t("authSettings.security.save")}
            </Button>
          </CardContent>
        </Card>

        {/* Sessions Actives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              {t("authSettings.activeSessions.title")}
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
                            {t("authSettings.activeSessions.current")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.browser} • {t("authSettings.activeSessions.locationRabat")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("authSettings.activeSessions.lastActive", { time: formatLastActive(session) })}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      {t("authSettings.activeSessions.terminate")}
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
              {t("authSettings.activeSessions.terminateAll")}
            </Button>
          </CardContent>
        </Card>

        {/* Paramètres de Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("authSettings.session.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>{t("authSettings.session.rememberMe")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("authSettings.session.rememberMeDesc")}
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
                  <Label>{t("authSettings.session.autoLogin")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("authSettings.session.autoLoginDesc")}
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
                <Label>{t("authSettings.session.sessionDuration")}</Label>
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
                    <SelectItem value="1">{t("authSettings.options.hours1")}</SelectItem>
                    <SelectItem value="4">{t("authSettings.options.hours4")}</SelectItem>
                    <SelectItem value="8">{t("authSettings.options.hours8")}</SelectItem>
                    <SelectItem value="12">{t("authSettings.options.hours12")}</SelectItem>
                    <SelectItem value="24">{t("authSettings.options.hours24")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("authSettings.session.maxConcurrent")}</Label>
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
                    <SelectItem value="1">{t("authSettings.options.session1")}</SelectItem>
                    <SelectItem value="2">{t("authSettings.options.sessions2")}</SelectItem>
                    <SelectItem value="3">{t("authSettings.options.sessions3")}</SelectItem>
                    <SelectItem value="5">{t("authSettings.options.sessions5")}</SelectItem>
                    <SelectItem value="10">{t("authSettings.options.sessions10")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSaveSession} className="w-full gap-2">
              <Save className="h-4 w-4" />
              {t("authSettings.session.save")}
            </Button>
          </CardContent>
        </Card>

        {/* Paramètres de Notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("authSettings.notifications.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>{t("authSettings.notifications.loginAlerts")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("authSettings.notifications.loginAlertsDesc")}
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
                  <Label>{t("authSettings.notifications.securityAlerts")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("authSettings.notifications.securityAlertsDesc")}
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
                  <Label>{t("authSettings.notifications.deviceAlerts")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("authSettings.notifications.deviceAlertsDesc")}
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
                  <Label>{t("authSettings.notifications.email")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("authSettings.notifications.emailDesc")}
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
                  <Label>{t("authSettings.notifications.sms")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("authSettings.notifications.smsDesc")}
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
                  <Label>{t("authSettings.notifications.push")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("authSettings.notifications.pushDesc")}
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
              {t("authSettings.notifications.save")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
