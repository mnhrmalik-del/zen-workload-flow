import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ScheduleItem {
  technician_name: string;
  job_id: number;
  service_type: string;
  start_time: string;
  end_time: string;
  status: string;
}

export default function Schedule() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/schedule/board');
      setSchedule(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      toast.error('Failed to load schedule');
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-muted border-border';
    
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success/20 border-success';
      case 'in progress':
        return 'bg-primary/20 border-primary';
      default:
        return 'bg-muted border-border';
    }
  };

  const groupedByTechnician = schedule.reduce((acc, item) => {
    if (!acc[item.technician_name]) {
      acc[item.technician_name] = [];
    }
    acc[item.technician_name].push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg"></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Schedule Board</h1>
      <div className="space-y-4">
        {Object.entries(groupedByTechnician).map(([technicianName, items]) => (
          <Card key={technicianName}>
            <CardHeader>
              <CardTitle className="text-lg">{technicianName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={`${item.job_id}-${item.start_time}`}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(item.status)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Job #{item.job_id}</p>
                        <p className="text-sm text-muted-foreground">{item.service_type}</p>
                      </div>
                      <Badge variant="outline">{item.status || 'Pending'}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {new Date(item.start_time).toLocaleString()} - {new Date(item.end_time).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
