import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { competitorsApi, pagesApi, changesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ImpactBadge } from '@/components/ImpactBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { toast } from '@/components/ui/use-toast';
import {
  Plus,
  ExternalLink,
  Trash2,
  ArrowLeft,
  Globe,
  Loader2,
  Clock,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Competitor, Page, Change } from '@/types';

const PAGE_TYPES = ['pricing', 'blog', 'changelog', 'custom'];

function AddPageDialog({ competitorId, open, onClose }: { competitorId: string; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [url, setUrl] = useState('');
  const [type, setType] = useState('pricing');

  const mutation = useMutation({
    mutationFn: () => competitorsApi.addPage(competitorId, { url, type }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitor-pages', competitorId] });
      toast({ title: 'Page ajoutée' });
      setUrl('');
      setType('pricing');
      onClose();
    },
    onError: () => toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'ajouter la page' }),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une page</DialogTitle>
          <DialogDescription>Entrez l'URL et le type de page à surveiller</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.exemple.com/pricing"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Type de page</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CompetitorDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [addPageOpen, setAddPageOpen] = useState(false);
  const [deletePageId, setDeletePageId] = useState<string | null>(null);

  const { data: compData, isLoading: compLoading } = useQuery<{ data: Competitor }>({
    queryKey: ['competitor', id],
    queryFn: () => competitorsApi.get(id!),
    enabled: !!id,
  });

  const { data: pagesData, isLoading: pagesLoading } = useQuery<{ data: Page[] }>({
    queryKey: ['competitor-pages', id],
    queryFn: () => competitorsApi.getPages(id!),
    enabled: !!id,
  });

  const { data: changesData, isLoading: changesLoading } = useQuery<{ data: Change[] }>({
    queryKey: ['changes', { competitor_id: id }],
    queryFn: () => changesApi.list({ competitor_id: id, limit: 20 }),
    enabled: !!id,
  });

  const togglePageMutation = useMutation({
    mutationFn: ({ pageId, isActive }: { pageId: string; isActive: boolean }) =>
      pagesApi.update(pageId, { is_active: isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['competitor-pages', id] }),
  });

  const deletePageMutation = useMutation({
    mutationFn: (pageId: string) => pagesApi.delete(pageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitor-pages', id] });
      toast({ title: 'Page supprimée' });
      setDeletePageId(null);
    },
    onError: () => toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer' }),
  });

  const competitor = compData?.data;
  const pages: Page[] = pagesData?.data ?? [];
  const changes: Change[] = changesData?.data ?? [];

  if (compLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!competitor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Concurrent introuvable</p>
        <Link to="/competitors">
          <Button variant="link" className="mt-2">
            Retour à la liste
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/competitors">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{competitor.name}</h1>
            <Badge variant={competitor.is_active ? 'default' : 'secondary'}>
              {competitor.is_active ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
          <a
            href={competitor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mt-1 transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            {competitor.website}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Pages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Pages surveillées</CardTitle>
          <Button size="sm" onClick={() => setAddPageOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter une page
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {pagesLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : pages.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-6">
              <Globe className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Aucune page configurée</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center gap-3 px-6 py-3">
                  <Badge variant="outline" className="capitalize text-xs shrink-0">
                    {page.type}
                  </Badge>
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-muted-foreground hover:text-primary truncate transition-colors"
                  >
                    {page.url}
                  </a>
                  {page.last_scraped_at && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" />
                      {format(new Date(page.last_scraped_at), 'dd/MM HH:mm')}
                    </span>
                  )}
                  <button
                    onClick={() =>
                      togglePageMutation.mutate({ pageId: page.id, isActive: !page.is_active })
                    }
                    className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    title={page.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {page.is_active ? (
                      <ToggleRight className="h-5 w-5 text-primary" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setDeletePageId(page.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete page dialog */}
      <Dialog open={!!deletePageId} onOpenChange={(o) => !o && setDeletePageId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette page ?</DialogTitle>
            <DialogDescription>
              L'historique des changements de cette page sera aussi supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePageId(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletePageId && deletePageMutation.mutate(deletePageId)}
              disabled={deletePageMutation.isPending}
            >
              {deletePageMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recent changes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique des changements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {changesLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : changes.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-6">
              <p className="text-sm text-muted-foreground">Aucun changement enregistré</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {changes.map((change) => (
                <div key={change.id} className="flex items-start gap-3 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <ImpactBadge level={change.impact_level} />
                      <CategoryBadge category={change.category} />
                      {change.page_type && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {change.page_type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {change.summary ?? 'Aucun résumé'}
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(change.analyzed_at), 'dd MMM yyyy', { locale: fr })}
                  </time>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddPageDialog
        competitorId={id!}
        open={addPageOpen}
        onClose={() => setAddPageOpen(false)}
      />
    </div>
  );
}
