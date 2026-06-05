import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Loader2, Eye, EyeOff, ArrowLeft, Building2, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleLogin, useResetPassword, useLogin } from '@/hooks/useAuth';
import { DemoLoginPanel } from '@/components/DemoLoginPanel';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'assistant'>('admin');
  const { user } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();
  const resetPasswordMutation = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      console.log('🚀 LoginForm: Starting login...');
      await loginMutation.mutateAsync({ email, password });
      console.log('✅ LoginForm: Login mutation completed successfully');
      
      // Navigate immediately - don't wait
      console.log('🔄 LoginForm: Navigating to dashboard...');
      navigate('/dashboard', { replace: true });
      //reload page
      window.location.reload();
    } catch (error) {
      console.error('❌ LoginForm: Login error:', error);
      // Display the specific error message from the backend
      setError(error instanceof Error ? error.message : 'Une erreur inattendue est survenue');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await googleLoginMutation.mutateAsync();
      console.log('✅ Google login successful, redirecting...');
      // Navigate immediately
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setError('Erreur lors de la connexion avec Google');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Veuillez saisir votre email');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync(email);
      setResetEmailSent(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetEmailSent(false);
    setError('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">VetPro CRM3</CardTitle>
          <CardDescription>
            {isForgotPassword 
              ? resetEmailSent 
                ? "Vérifiez votre email"
                : "Réinitialiser votre mot de passe"
              : "Connexion - Admin ou Assistant"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetEmailSent ? (
            // Email sent confirmation
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
                </p>
                <p className="text-xs text-muted-foreground mb-6">
                  Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.
                  Si vous ne voyez pas l'email, vérifiez votre dossier spam.
                </p>
              </div>

              <Button
                onClick={handleBackToLogin}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Button>
            </div>
          ) : isForgotPassword ? (
            // Forgot password form
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="votre.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={resetPasswordMutation.isPending}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Entrez l'adresse email associée à votre compte
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer le lien de réinitialisation'
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleBackToLogin}
                  className="text-sm"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Retour à la connexion
                </Button>
              </div>
            </form>
          ) : (
            // Regular login form with tabs
            <Tabs defaultValue="admin" className="w-full" onValueChange={(value) => setLoginType(value as 'admin' | 'assistant')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="admin" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="assistant" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Assistant
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="space-y-4 mt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@vetpro.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loginMutation.isPending}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loginMutation.isPending}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loginMutation.isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        className="text-xs p-0 h-auto"
                        onClick={() => setIsForgotPassword(true)}
                      >
                        Mot de passe oublié ?
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      <>
                        <Building2 className="mr-2 h-4 w-4" />
                        Connexion Admin
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou continuer avec
                    </span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={loginMutation.isPending || googleLoginMutation.isPending}
                >
                  {googleLoginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion avec Google...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continuer avec Google
                    </>
                  )}
                </Button>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Pas encore de compte ?{" "}
                    <Link to="/register?mode=admin" className="text-primary hover:underline">
                      Créer une clinique
                    </Link>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="assistant" className="space-y-4 mt-0">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <UserPlus className="h-4 w-4 inline mr-1" />
                    Connexion pour les assistants vétérinaires
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="assistant-email">Email</Label>
                    <Input
                      id="assistant-email"
                      type="email"
                      placeholder="assistant@vetpro.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loginMutation.isPending}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="assistant-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="assistant-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loginMutation.isPending}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loginMutation.isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        className="text-xs p-0 h-auto"
                        onClick={() => setIsForgotPassword(true)}
                      >
                        Mot de passe oublié ?
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Connexion Assistant
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 text-center bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Pas encore de compte ?
                  </p>
                  <Link to="/register?mode=assistant" className="text-primary hover:underline font-medium">
                    Rejoignez votre clinique avec un code
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      <DemoLoginPanel />
    </div>
  );
}
