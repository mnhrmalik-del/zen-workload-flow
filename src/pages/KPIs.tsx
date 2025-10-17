import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { toast } from 'sonner';

interface TrendData {
  date: string;
  total_jobs: number;
  completed_jobs: number;
}

interface TechnicianPerformance {
  technician_name: string;
  jobs_completed: number;
  average_time: number;
}

export default function KPIs() {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [performance, setPerformance] = useState<TechnicianPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIData();
  }, []);

  const fetchKPIData = async () => {
    try {
      const [trendsRes, perfRes] = await Promise.all([
        api.get('/kpi/trends'),
        api.get('/kpi/technician_performance'),
      ]);
      setTrends(Array.isArray(trendsRes.data) ? trendsRes.data : []);
      setPerformance(Array.isArray(perfRes.data) ? perfRes.data : []);
    } catch (error: any) {
      toast.error('Failed to load KPI data');
      setTrends([]);
      setPerformance([]);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-96 bg-muted rounded-lg"></div>
      ))}
    </div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Key Performance Indicators</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total_jobs" stroke="hsl(var(--chart-1))" name="Total Jobs" />
                <Line type="monotone" dataKey="completed_jobs" stroke="hsl(var(--chart-2))" name="Completed Jobs" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technician Performance - Jobs Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="technician_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="jobs_completed" fill="hsl(var(--chart-1))" name="Jobs Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Time per Job (hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.technician_name}: ${entry.average_time.toFixed(1)}h`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="average_time"
                >
                  {performance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
