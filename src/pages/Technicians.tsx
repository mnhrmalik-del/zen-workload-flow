import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Technician {
  technician_id: number;
  name: string;
  skill_level: string;
  utilization: number;
  available: boolean;
}

export default function Technicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const response = await api.get('/technicians');
      setTechnicians(response.data);
    } catch (error: any) {
      toast.error('Failed to load technicians');
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 50) return 'bg-success';
    if (utilization < 80) return 'bg-warning';
    return 'bg-destructive';
  };

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg"></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Technicians</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Skill Level</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((tech) => (
                <TableRow key={tech.technician_id}>
                  <TableCell>{tech.technician_id}</TableCell>
                  <TableCell className="font-medium">{tech.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tech.skill_level}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getUtilizationColor(tech.utilization)}`}
                          style={{ width: `${tech.utilization}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12">{tech.utilization.toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tech.available ? 'default' : 'secondary'}>
                      {tech.available ? 'Available' : 'Busy'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
