import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ClipboardList, CheckCircle2, Clock, TrendingUp, Target } from 'lucide-react';

interface KPIData {
  total_jobs: number;
  pending_jobs: number;
  completed_jobs: number;
  average_utilization: number;
  on_time_completion_rate: number;
}

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      const response = await api.get('/kpi/overview');
      setKpis(response.data);
    } catch (error: any) {
      toast.error('Failed to load KPI data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-32 bg-muted rounded-lg"></div>
      ))}
    </div>;
  }

  const cards = [
    {
      title: 'Total Jobs',
      value: kpis?.total_jobs || 0,
      icon: ClipboardList,
      color: 'text-primary',
    },
    {
      title: 'Pending Jobs',
      value: kpis?.pending_jobs || 0,
      icon: Clock,
      color: 'text-warning',
    },
    {
      title: 'Completed Jobs',
      value: kpis?.completed_jobs || 0,
      icon: CheckCircle2,
      color: 'text-success',
    },
    {
      title: 'Avg Utilization',
      value: `${kpis?.average_utilization?.toFixed(1) || 0}%`,
      icon: TrendingUp,
      color: 'text-chart-4',
    },
    {
      title: 'On-Time Rate',
      value: `${kpis?.on_time_completion_rate?.toFixed(1) || 0}%`,
      icon: Target,
      color: 'text-chart-5',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
