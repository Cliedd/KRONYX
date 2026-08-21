import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ImpactBadge } from '@/components/ImpactBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { Building2, Globe, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Change, DashboardStats } from '@/types';

// Génère des données de démonstration pour le graphique
function generateChartData() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'dd/MM', { locale: fr }),
    changements: Math.floor(Math.random() * 12),
  }));
}

const CHART_DATA = generateChartData();

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
}: {
  title: string;
  value: number | undefined;
  icon: React.ElementType;
  description?: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-3xl font-bold">{value ?? 0}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const {
    data: statsData,
    isLoading: statsLoading,
  } = useQuery<{ data: DashboardStats }>({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats(),
  });

  const {
    data: changesData,
    isLoading: changesLoading,
  } = useQuery<{ data: Change[] }>({
    queryKey: ['recent-changes'],
    queryFn: () => dashboardApi.recentChanges(),
  });

  const stats = statsData?.data;
  const changes: Change[] = changesData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Concurrents suivis"
          value={stats?.total_competitors}
          icon={Building2}
          loading={statsLoading}
          description="Actifs dans votre espace"
        />
        <StatCard
          title="Pages surveillées"
          value={stats?.total_pages}
          icon={Globe}
          loading={statsLoading}
          description="Scraping automatique"
        />
        <StatCard
          title="Changements aujourd'hui"
          value={stats?.changes_today}
          icon={TrendingUp}
          loading={statsLoading}
          description="Détectés dans les dernières 24h"
        />
        <StatCard
          title="Cette semaine"
          value={stats?.changes_week}
          icon={Calendar}
          loading={statsLoading}
          description="Sur les 7 derniers jours"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Activité — 30 derniers jours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorChangements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: '#2563EB' }}
                />
                <Area
                  type="monotone"
                  dataKey="changements"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#colorChangements)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent changes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Derniers changements détectés</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {changesLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : changes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <AlertTriangle className="h-10 w-10 text-muted-foreground/40 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Aucun changement détecté</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Ajoutez des concurrents et des pages à surveiller
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {changes.slice(0, 10).map((change) => (
                <div key={change.id} className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <ImpactBadge level={change.impact_level} />
                      <CategoryBadge category={change.category} />
                      {change.competitor_name && (
                        <span className="text-xs font-medium text-foreground">
                          {change.competitor_name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {change.summary ?? 'Aucun résumé disponible'}
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground shrink-0 mt-0.5">
                    {format(new Date(change.analyzed_at), 'dd MMM HH:mm', { locale: fr })}
                  </time>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
