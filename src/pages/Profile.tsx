// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Shield, 
  Phone, 
  MapPin, 
  Calendar,
  Save,
  Edit,
  Camera,
  Key,
  Bell,
  Globe,
  Loader2
} from "lucide-react";
import { AppPageHeader } from "@/components/AppPageHeader";
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile, useUpdateUserProfile } from '@/hooks/useDatabase';
import { SUPPORTED_LANGS, type AppLanguage } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { isDemoWriteBlocked, assertDemoCanWrite, DemoReadOnlyError } from '@/lib/demoWriteGuard';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { user, logout, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { t: td } = useTranslation("demo");
  const { t: tSettings } = useTranslation("settings");
  const { data: userProfile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const demoLocked = isDemoWriteBlocked(user?.email);
  
  // État local pour les modifications - utilise les données de la base de données
  const [profileData, setProfileData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    specialty: '',
    experience: '',
    bio: '',
    languages: ['Français', 'Arabe', 'Anglais'], // This can stay local for now
  });

  // Mettre à jour les données locales quand le profil change
  useEffect(() => {
    if (userProfile && user) {
      setProfileData(prev => ({
        ...prev,
        full_name: userProfile.full_name || '',
        username: userProfile.username || '',
        email: user.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        specialty: userProfile.specialty || '',
        experience: userProfile.experience || '',
        bio: userProfile.bio || '',
      }));
    }
  }, [userProfile, user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    privacy: {
      showEmail: false,
      showPhone: true,
      showAddress: false
    },
    language: (i18n.language?.split("-")[0] || "fr") as AppLanguage,
    timezone: 'Africa/Casablanca'
  });

  // Keep preferences.language in sync with app i18n
  useEffect(() => {
    const lng = (i18n.language?.split("-")[0] || "fr") as AppLanguage;
    if (SUPPORTED_LANGS.includes(lng)) {
      setPreferences((prev) =>
        prev.language === lng ? prev : { ...prev, language: lng }
      );
    }
  }, [i18n.language]);

  const handleSaveProfile = async () => {
    try {
      assertDemoCanWrite(user?.email);
      await updateProfileMutation.mutateAsync({
        full_name: profileData.full_name,
        username: profileData.username,
        phone: profileData.phone,
        address: profileData.address,
        specialty: profileData.specialty,
        experience: profileData.experience,
        bio: profileData.bio,
      });
      
      // Actualiser le profil et l'auth après la mise à jour
      await Promise.all([
        refetchProfile(),
        refreshProfile()
      ]);
      
      toast({
        title: t("profile.updated"),
        description: t("profile.updatedBody"),
      });
      setIsEditing(false);
    } catch (error) {
      if (error instanceof DemoReadOnlyError) {
        toast({ title: td("readOnlyToastTitle"), description: td("readOnlyToastBody"), variant: "destructive" });
        return;
      }
      toast({
        title: tc("error"),
        description: error instanceof Error ? error.message : t("profile.saveError"),
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: tc("error"),
        description: t("profile.passwordMismatch"),
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: t("profile.passwordChanged"),
      description: t("profile.passwordChangedBody"),
    });
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSavePreferences = () => {
    toast({
      title: t("profile.prefsSaved"),
      description: t("profile.prefsSavedBody"),
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'assistant':
        return 'Assistant';
      default:
        return 'Utilisateur';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'assistant':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  // Loading state for profile data
  if (profileLoading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-6">
      <AppPageHeader
        icon={User}
        title={t("profile.title")}
        description={t("profile.description")}
        actions={
          isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-full">
                {tc("cancel")}
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="gap-2 rounded-full"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {updateProfileMutation.isPending ? t("profile.saving") : t("profile.save")}
              </Button>
            </>
          ) : demoLocked ? null : (
            <Button onClick={() => setIsEditing(true)} className="gap-2 rounded-full">
              <Edit className="h-4 w-4" />
              {tc("edit")}
            </Button>
          )
        }
      />

      {/* Informations Personnelles */}
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
        <User className="h-5 w-5" />
        {t("profile.personalInfo")}
      </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar et Informations de base */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg sm:text-xl">
            {getInitials(user.profile.full_name)}
          </AvatarFallback>
          </Avatar>
          {isEditing && (
          <Button
            size="sm"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
            variant="secondary"
          >
            <Camera className="h-4 w-4" />
          </Button>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-semibold">{user.profile.full_name || user.profile.username}</h3>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <Badge className={getRoleColor(user.profile.role)}>
            {getRoleLabel(user.profile.role)}
          </Badge>
          </div>
        </div>
        </div>

        <Separator />

        {/* Formulaire d'édition */}
        <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nom complet</Label>
          <Input
          id="full_name"
          value={profileData.full_name}
          onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
          disabled={!isEditing}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <Input
          id="username"
          value={profileData.username}
          onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
          disabled={!isEditing}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
          id="email"
          type="email"
          value={profileData.email}
          disabled={true}
          className="bg-muted"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
          id="phone"
          value={profileData.phone}
          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
          disabled={!isEditing}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
          id="address"
          value={profileData.address}
          onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
          disabled={!isEditing}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="specialty">Spécialité</Label>
          <Input
          id="specialty"
          value={profileData.specialty}
          onChange={(e) => setProfileData(prev => ({ ...prev, specialty: e.target.value }))}
          disabled={!isEditing}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="experience">Expérience</Label>
          <Input
          id="experience"
          value={profileData.experience}
          onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
          disabled={!isEditing}
          />
        </div>
        </div>
        
        <div className="space-y-2">
        <Label htmlFor="bio">Biographie</Label>
        <textarea
          id="bio"
          className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={profileData.bio}
          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
          disabled={!isEditing}
        />
        </div>
      </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {tSettings("language.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">{tSettings("language.description")}</p>
          <LanguageSwitcher />
        </CardContent>
      </Card>
    </div>
  );
}