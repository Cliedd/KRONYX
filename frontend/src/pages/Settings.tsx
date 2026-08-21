import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Plus, X, Loader2, Moon, Sun, Mail, MessageSquare, Globe, Palette } from 'lucide-react';
import type { User } from '@/types';

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Chicago', label: 'America/Chicago' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
];

const TONES = [
  { value: 'direct', label: 'Direct — Synthétique et factuel' },
  { value: 'formal', label: 'Formel — Professionnel et structuré' },
  { value: 'detailed', label: 'Détaillé — Complet avec contexte' },
];

export function Settings() {
  const qc = useQueryClient();
  const { setUser } = useAuthStore();

  const { data, isLoading } = useQuery<{ data: User }>({
    queryKey: ['me'],
    queryFn: () => usersApi.getMe(),
  });

  const user = data?.data;

  // Email notifications state
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  // Tone
  const [tone, setTone] = useState('direct');

  // Timezone
  const [timezone, setTimezone] = useState('UTC');

  // Theme
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    if (user) {
      setEmails(user.notification_emails ?? []);
      setTone(user.synthesis_tone ?? 'direct');
      setTimezone(user.timezone ?? 'UTC');
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof usersApi.updateMe>[0]) => usersApi.updateMe(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['me'] });
      setUser(res.data);
      toast({ title: 'Paramètres sauvegardés' });
    },
    onError: () => toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder' }),
  });

  const handleAddEmail = () => {
    if (!newEmail || emails.includes(newEmail)) return;
    setEmails([...emails, newEmail]);
    setNewEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleSaveEmails = () => {
    mutation.mutate({ notification_emails: emails });
  };

  const handleSaveTone = () => {
    mutation.mutate({ synthesis_tone: tone });
  };

  const handleSaveTimezone = () => {
    mutation.mutate({ timezone });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Notification emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Emails de notification
          </CardTitle>
          <CardDescription>
            Ces adresses recevront les rapports quotidiens et les alertes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@entreprise.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
            />
            <Button variant="outline" onClick={handleAddEmail} disabled={!newEmail}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {emails.map((email) => (
                <div
                  key={email}
                  className="flex items-center gap-1.5 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
                >
                  {email}
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button onClick={handleSaveEmails} disabled={mutation.isPending} size="sm">
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Sauvegarder
          </Button>
        </CardContent>
      </Card>

      {/* Synthesis tone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Ton des synthèses IA
          </CardTitle>
          <CardDescription>
            Style d'écriture utilisé pour les résumés et recommandations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSaveTone} disabled={mutation.isPending} size="sm">
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Sauvegarder
          </Button>
        </CardContent>
      </Card>

      {/* Timezone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Fuseau horaire
          </CardTitle>
          <CardDescription>
            Utilisé pour l'envoi des rapports et l'affichage des horaires.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSaveTimezone} disabled={mutation.isPending} size="sm">
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Sauvegarder
          </Button>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Apparence
          </CardTitle>
          <CardDescription>Choisissez entre le mode sombre et le mode clair.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Moon className={`h-6 w-6 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-xs font-medium">Sombre</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                theme === 'light'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Sun className={`h-6 w-6 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-xs font-medium">Clair</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
