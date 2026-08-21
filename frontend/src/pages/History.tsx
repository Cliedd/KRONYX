import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { changesApi, competitorsApi } from '@/services/api';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ImpactBadge } from '@/components/ImpactBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { Download, ChevronLeft, ChevronRight, Search, History as HistoryIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Change, Competitor, PaginatedResponse } from '@/types';

const PAGE_SIZE = 20;
const CATEGORIES = ['pricing', 'feature', 'positioning', 'communication'];
const IMPACT_LEVELS = ['low', 'medium', 'high'];

export function History() {
  const [page, setPage] = useState(0);
  const [competitorId, setCompetitorId] = useState('');
  const [category, setCategory] = useState('');
  const [impactLevel, setImpactLevel] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedChange, setSelectedChange] = useState<Change | null>(null);

  const { data: competitorsData } = useQuery<{ data: Competitor[] }>({
    queryKey: ['competitors'],
    queryFn: () => competitorsApi.list(),
  });

  const competitors: Competitor[] = competitorsData?.data ?? [];

  const params = {
    competitor_id: competitorId || undefined,
    category: category || undefined,
    impact_level: impactLevel || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const { data, isLoading } = useQuery<{ data: PaginatedResponse<Change> }>({
    queryKey: ['changes', params],
    queryFn: () => changesApi.list(params),
  });

  const changes: Change[] = data?.data?.items ?? [];
  const totalChanges: number = data?.data?.total ?? 0;

  const handleExportCSV = () => {
    if (changes.length === 0) return;
    const headers = ['Date', 'Concurrent', 'Type', 'Catégorie', 'Impact', 'Résumé'];
    const rows = changes.map((c) => [
      format(new Date(c.analyzed_at), 'dd/MM/yyyy HH:mm'),
      c.competitor_name ?? '',
      c.page_type ?? '',
      c.category ?? '',
      c.impact_level,
      `"${(c.summary ?? '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kronyx-historique-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setCompetitorId('');
    setCategory('');
    setImpactLevel('');
    setFromDate('');
    setToDate('');
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Concurrent</Label>
            <Select value={competitorId} onValueChange={(v) => { setCompetitorId(v === '_all' ? '' : v); setPage(0); }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Tous</SelectItem>
                {competitors.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Catégorie</Label>
            <Select value={category} onValueChange={(v) => { setCategory(v === '_all' ? '' : v); setPage(0); }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Toutes</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Impact</Label>
            <Select value={impactLevel} onValueChange={(v) => { setImpactLevel(v === '_all' ? '' : v); setPage(0); }}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Tous</SelectItem>
                {IMPACT_LEVELS.map((l) => (
                  <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Du</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
              className="h-9"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Au</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(0); }}
              className="h-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Réinitialiser
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={changes.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Concurrent</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Résumé</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : changes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center py-12 text-center">
                    <HistoryIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">Aucun changement trouvé</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Modifiez les filtres ou ajoutez des pages à surveiller
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              changes.map((change) => (
                <TableRow
                  key={change.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedChange(change)}
                >
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(change.analyzed_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {change.competitor_name ?? '—'}
                  </TableCell>
                  <TableCell>
                    {change.page_type && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {change.page_type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={change.category} />
                  </TableCell>
                  <TableCell>
                    <ImpactBadge level={change.impact_level} />
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate">
                      {change.summary ?? '—'}
                    </p>
                  </TableCell>
                  <TableCell>
                    {change.page_url && (
                      <a
                        href={change.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary hover:underline text-xs"
                      >
                        <Search className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && totalChanges > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} — {totalChanges} résultat(s) au total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={changes.length < PAGE_SIZE}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selectedChange} onOpenChange={(o) => !o && setSelectedChange(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détail du changement</DialogTitle>
            <DialogDescription>
              {selectedChange &&
                format(new Date(selectedChange.analyzed_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
            </DialogDescription>
          </DialogHeader>
          {selectedChange && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <ImpactBadge level={selectedChange.impact_level} />
                <CategoryBadge category={selectedChange.category} />
                {selectedChange.competitor_name && (
                  <Badge variant="secondary">{selectedChange.competitor_name}</Badge>
                )}
                {selectedChange.page_type && (
                  <Badge variant="outline" className="capitalize">{selectedChange.page_type}</Badge>
                )}
              </div>

              {selectedChange.summary && (
                <div>
                  <h4 className="text-sm font-semibold mb-1.5">Résumé</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedChange.summary}
                  </p>
                </div>
              )}

              {selectedChange.key_changes && (
                <div>
                  <h4 className="text-sm font-semibold mb-1.5">Changements clés</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedChange.key_changes}
                  </p>
                </div>
              )}

              {selectedChange.strategic_recommendation && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-primary mb-1.5">
                    Recommandation stratégique
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedChange.strategic_recommendation}
                  </p>
                </div>
              )}

              {selectedChange.page_url && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Source</h4>
                  <a
                    href={selectedChange.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {selectedChange.page_url}
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
