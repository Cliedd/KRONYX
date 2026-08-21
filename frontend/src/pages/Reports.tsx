import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, TrendingUp, AlertTriangle, Users, Mail, MailX } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Report } from '@/types';

export function Reports() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const { data, isLoading } = useQuery<{ data: Report[] }>({
    queryKey: ['reports'],
    queryFn: () => reportsApi.list(),
  });

  const reports: Report[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Rapports quotidiens</h2>
        <p className="text-sm text-muted-foreground">
          Synthèses automatiques de vos veilles concurrentielles
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <FileText className="h-14 w-14 text-muted-foreground/30 mb-4" />
          <p className="text-base font-medium text-muted-foreground">Aucun rapport disponible</p>
          <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm">
            Les rapports sont générés automatiquement chaque jour lorsque des changements sont
            détectés.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => {
            const dateLabel = (() => {
              try {
                return format(parseISO(report.report_date), 'dd MMMM yyyy', { locale: fr });
              } catch {
                return report.report_date;
              }
            })();

            return (
              <Card
                key={report.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedReport(report)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold">{dateLabel}</CardTitle>
                    <Badge
                      variant={report.sent_at ? 'default' : 'secondary'}
                      className="shrink-0 text-xs"
                    >
                      {report.sent_at ? (
                        <><Mail className="h-3 w-3 mr-1" />Envoyé</>
                      ) : (
                        <><MailX className="h-3 w-3 mr-1" />Non envoyé</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      </div>
                      <p className="text-xl font-bold">{report.content?.total_changes ?? 0}</p>
                      <p className="text-xs text-muted-foreground">Changements</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                      <p className="text-xl font-bold">{report.content?.high_impact_count ?? 0}</p>
                      <p className="text-xs text-muted-foreground">Élevés</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-xl font-bold">
                        {report.content?.competitors_affected ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Concurrents</p>
                    </div>
                  </div>
                  {report.sent_at && (
                    <p className="text-xs text-muted-foreground text-center">
                      Envoyé le{' '}
                      {format(new Date(report.sent_at), 'dd/MM à HH:mm', { locale: fr })}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(o) => !o && setSelectedReport(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Rapport du{' '}
              {selectedReport && (() => {
                try {
                  return format(parseISO(selectedReport.report_date), 'dd MMMM yyyy', { locale: fr });
                } catch {
                  return selectedReport.report_date;
                }
              })()}
            </DialogTitle>
            <DialogDescription>
              {selectedReport?.content?.total_changes ?? 0} changement(s) détecté(s)
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-500">
                    {selectedReport.content?.total_changes ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total changements</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-500">
                    {selectedReport.content?.high_impact_count ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Impact élevé</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {selectedReport.content?.competitors_affected ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Concurrents</p>
                </div>
              </div>

              {/* Changes by competitor */}
              {selectedReport.content?.changes_by_competitor &&
                Object.entries(selectedReport.content.changes_by_competitor).map(
                  ([competitorName, changes]) => (
                    <div key={competitorName}>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                        {competitorName}
                        <Badge variant="secondary" className="text-xs ml-1">
                          {changes.length}
                        </Badge>
                      </h4>
                      <div className="space-y-2 pl-4">
                        {changes.map((change, i) => (
                          <div
                            key={i}
                            className="border border-border rounded-md p-3 text-sm"
                          >
                            <p className="text-muted-foreground">{change.summary ?? 'Aucun résumé'}</p>
                            {change.strategic_recommendation && (
                              <p className="text-primary/80 text-xs mt-1 italic">
                                {change.strategic_recommendation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}

              {/* Raw JSON fallback */}
              {!selectedReport.content?.changes_by_competitor && (
                <pre className="text-xs bg-muted rounded-lg p-4 overflow-auto">
                  {JSON.stringify(selectedReport.content, null, 2)}
                </pre>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
