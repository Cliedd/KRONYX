import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { competitorsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Plus, ExternalLink, Pencil, Trash2, Globe, Loader2, AlertTriangle } from 'lucide-react';
import type { Competitor } from '@/types';

function CompetitorDialog({
  open,
  onClose,
  competitor,
}: {
  open: boolean;
  onClose: () => void;
  competitor?: Competitor;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState(competitor?.name ?? '');
  const [website, setWebsite] = useState(competitor?.website ?? '');

  const createMutation = useMutation({
    mutationFn: (data: { name: string; website: string }) => competitorsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitors'] });
      toast({ title: 'Concurrent ajouté' });
      onClose();
    },
    onError: () => toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'ajouter le concurrent' }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; website: string }) =>
      competitorsApi.update(competitor!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitors'] });
      toast({ title: 'Concurrent modifié' });
      onClose();
    },
    onError: () => toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de modifier le concurrent' }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (competitor) {
      updateMutation.mutate({ name, website });
    } else {
      createMutation.mutate({ name, website });
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{competitor ? 'Modifier le concurrent' : 'Ajouter un concurrent'}</DialogTitle>
          <DialogDescription>
            {competitor
              ? 'Modifiez les informations du concurrent'
              : 'Entrez les informations du nouveau concurrent à surveiller'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du concurrent *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Salesforce"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Site web *</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.salesforce.com"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {competitor ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  competitor,
  onClose,
}: {
  competitor: Competitor | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: string) => competitorsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitors'] });
      toast({ title: 'Concurrent supprimé' });
      onClose();
    },
    onError: () => toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer' }),
  });

  return (
    <Dialog open={!!competitor} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer {competitor?.name} ?</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Toutes les pages et l'historique associés seront
            supprimés.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => competitor && deleteMutation.mutate(competitor.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Competitors() {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Competitor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Competitor | null>(null);

  const { data, isLoading } = useQuery<{ data: Competitor[] }>({
    queryKey: ['competitors'],
    queryFn: () => competitorsApi.list(),
  });

  const competitors: Competitor[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Vos concurrents</h2>
          <p className="text-sm text-muted-foreground">{competitors.length} concurrent(s) suivis</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un concurrent
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Site web</TableHead>
              <TableHead className="text-center">Pages</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(5)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : competitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center py-12 text-center">
                    <Globe className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Aucun concurrent ajouté
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Cliquez sur "Ajouter un concurrent" pour commencer
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              competitors.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/competitors/${c.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {c.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">{c.pages_count ?? 0}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? 'default' : 'secondary'}>
                      {c.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTarget(c)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(c)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CompetitorDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {editTarget && (
        <CompetitorDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          competitor={editTarget}
        />
      )}
      <DeleteDialog competitor={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  );
}
