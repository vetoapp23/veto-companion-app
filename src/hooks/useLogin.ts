import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { useTranslation } from 'react-i18next';

interface LoginCredentials {
  email: string;
  password: string;
}

export const useLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('auth');

  return useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: t('login.successTitle'),
        description: t('login.successBody'),
      });
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      let message = t('login.errorGeneric');

      if (error.message.includes('Invalid login credentials')) {
        message = t('login.invalidCredentials');
      } else if (error.message.includes('Email not confirmed')) {
        message = t('login.emailNotConfirmed');
      }

      toast({
        title: t('login.errorTitle'),
        description: message,
        variant: 'destructive',
      });
    },
  });
};
