import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Zap } from 'lucide-react';

interface JobCard {
  job_id: number;
  customer_name: string;
  service_type: string;
  promised_delivery_time: string;
  status: string;
  technician_id?: number;
}

export default function JobCards() {
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    service_type: '',
    promised_delivery_time: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobcards');
      setJobs(response.data);
    } catch (error: any) {
      toast.error('Failed to load job cards');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/jobcards', formData);
      toast.success('Job card created successfully');
      setOpen(false);
      setFormData({ customer_name: '', service_type: '', promised_delivery_time: '' });
      fetchJobs();
    } catch (error: any) {
      toast.error('Failed to create job card');
    }
  };

  const handleAutoAssign = async (jobId: number) => {
    try {
      await api.post(`/jobcards/auto_assign?job_id=${jobId}`);
      toast.success('Job auto-assigned successfully');
      fetchJobs();
    } catch (error: any) {
      toast.error('Failed to auto-assign job');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg"></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Cards</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Job Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Job Card</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type</Label>
                <Input
                  id="service_type"
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_time">Promised Delivery Time</Label>
                <Input
                  id="delivery_time"
                  type="datetime-local"
                  value={formData.promised_delivery_time}
                  onChange={(e) => setFormData({ ...formData, promised_delivery_time: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Create Job Card</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Job Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Delivery Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.job_id}>
                  <TableCell>{job.job_id}</TableCell>
                  <TableCell className="font-medium">{job.customer_name}</TableCell>
                  <TableCell>{job.service_type}</TableCell>
                  <TableCell>{new Date(job.promised_delivery_time).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {!job.technician_id && job.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAutoAssign(job.job_id)}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Auto Assign
                      </Button>
                    )}
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
