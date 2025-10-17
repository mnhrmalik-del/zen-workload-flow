import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import api from '@/lib/api';
import { toast } from 'sonner';
import { AlertCircle, Info } from 'lucide-react';

interface AlertItem {
  alert_id: number;
  alert_type: string;
  message: string;
  severity: string;
  created_at: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/alerts');
      setAlerts(response.data);
    } catch (error: any) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const getAlertVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return AlertCircle;
      default:
        return Info;
    }
  };

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg"></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">System Alerts</h1>
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.length === 0 ? (
            <p className="text-muted-foreground">No active alerts</p>
          ) : (
            alerts.map((alert) => {
              const Icon = getAlertIcon(alert.severity);
              return (
                <Alert key={alert.alert_id} variant={getAlertVariant(alert.severity)}>
                  <Icon className="h-4 w-4" />
                  <AlertTitle className="capitalize">{alert.alert_type}</AlertTitle>
                  <AlertDescription>
                    {alert.message}
                    <div className="text-xs mt-2 opacity-70">
                      {new Date(alert.created_at).toLocaleString()}
                    </div>
                  </AlertDescription>
                </Alert>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
