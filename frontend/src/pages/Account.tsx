import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Loader2, User, CreditCard, Lock, Star, Zap, Building2 } from 'lucide-react';
import type { User as UserType } from '@/types';

const PLAN_CONFIG: Record<string, { label: string; color: string; features: string[] }> = {
  starter: {
    label: 'Starter',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    features: ['3 concurrents', '10 pages', 'Rapports hebdomadaires', 'Support email'],
  },
  pro: {
    label: 'Pro',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    features: [
      '20 concurrents',
      'Pages illimitées',
      'Rapports quotidiens',
      'Alertes en temps réel',
      'Support prioritaire',
    ],
  },
  enterprise: {
    label: 'Enterprise',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    features: [
      'Concurrents illimités',
      'Pages illimitées',
      'Rapports temps réel',
      'API dédiée',
      'CSM dédié',
      'SLA garanti',
    ],
  },
};

export function Account() {
  const qc = useQueryClient();
  const { setUser } = useAuthStore();

  const { data, isLoading } = useQuery<{ data: UserType }>({
    queryKey: ['me'],
    queryFn: () => usersApi.getMe(),
  });

  const user = data?.data;
  const [companyName, setCompanyName] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setCompanyName(user.company_name ?? '');
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof usersApi.updateMe>[0]) => usersApi.updateMe(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['me'] });
      setUser(res.data);
      toast({ title: 'Informations mises à jour' });
    },
    onError: () => toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour' }),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      usersApi.changePassword(data),
    onSuccess: () => {
      toast({ title: 'Mot de passe modifié' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: () =>
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Mot de passe actuel incorrect ou erreur serveur',
      }),
  });

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ company_name: companyName });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
      });
      return;
    }
    passwordMutation.mutate({ current_password: currentPassword, new_password: newPassword });
  };

  const plan = user?.plan ?? 'starter';
  const planConfig = PLAN_CONFIG[plan] ?? PLAN_CONFIG.starter;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Informations du compte
          </CardTitle>
          <CardDescription>Gérez vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email ?? ''}
                disabled
                className="opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                L'email ne peut pas être modifié
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Nom de l'entreprise</Label>
              <Input
                id="company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <Button type="submit" size="sm" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Sauvegarder
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Abonnement
          </CardTitle>
          <CardDescription>Votre plan actuel et ses fonctionnalités</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${planConfig.color}`}>
              {plan === 'pro' && <Star className="h-3.5 w-3.5" />}
              {plan === 'enterprise' && <Zap className="h-3.5 w-3.5" />}
              {plan === 'starter' && <Building2 className="h-3.5 w-3.5" />}
              {planConfig.label}
            </span>
          </div>
          <ul className="space-y-1.5">
            {planConfig.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          {plan !== 'enterprise' && (
            <Button variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Passer à {plan === 'starter' ? 'Pro' : 'Enterprise'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" />
            Changer le mot de passe
          </CardTitle>
          <CardDescription>Mettez à jour votre mot de passe de connexion</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-pw">Mot de passe actuel</Label>
              <Input
                id="current-pw"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">Nouveau mot de passe</Label>
              <Input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Au moins 8 caractères"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirmer le mot de passe</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" size="sm" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Modifier le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
