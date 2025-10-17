import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ScheduleItem {
  technician_name: string;
  job_id: number;
  car_model: string;
  service_type: string;
  task_status: string;
  scheduled_time: string;
  promised_delivery: string;
}

export default function Schedule() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [hoveredJob, setHoveredJob] = useState<number | null>(null);

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'in progress':
        return 'bg-yellow-500';
      case 'planned':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Generate time slots from 7 AM to 8 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Calculate position and width for a job block
  const getJobPosition = (scheduledTime: string, promisedDelivery: string) => {
    const startTime = new Date(scheduledTime);
    const endTime = new Date(promisedDelivery);
    
    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    const endHour = endTime.getHours() + endTime.getMinutes() / 60;
    
    // Position relative to 7 AM (start of timeline)
    const left = ((startHour - 7) / 13) * 100; // 13 hours total (7 AM - 8 PM)
    const width = ((endHour - startHour) / 13) * 100;
    
    return { left: `${Math.max(0, left)}%`, width: `${Math.max(5, width)}%` };
  };

  const groupedByTechnician = schedule.reduce((acc, item) => {
    if (!acc[item.technician_name]) {
      acc[item.technician_name] = [];
    }
    acc[item.technician_name].push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  const handleRefresh = () => {
    setLoading(true);
    fetchSchedule();
  };

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workshop Schedule Board</h1>
          <p className="text-muted-foreground mt-1">Daily Technician Workload</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="rounded-none"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="rounded-none"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Week
            </Button>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 items-center text-sm">
        <span className="font-medium">Status:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span>Planned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span>Completed</span>
        </div>
      </div>

      {/* Timeline Board */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* Time header */}
            <div className="flex border-b bg-muted/50 sticky top-0 z-10">
              <div className="w-40 flex-shrink-0 p-3 font-semibold border-r bg-muted">
                Technician
              </div>
              <div className="flex-1 flex">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="flex-1 p-3 text-center text-sm font-medium border-r last:border-r-0"
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>

            {/* Technician rows */}
            {Object.entries(groupedByTechnician).length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No scheduled jobs found
              </div>
            ) : (
              Object.entries(groupedByTechnician).map(([technicianName, items]) => (
                <div key={technicianName} className="flex border-b last:border-b-0 hover:bg-muted/30">
                  <div className="w-40 flex-shrink-0 p-3 font-medium border-r bg-muted/20">
                    {technicianName}
                  </div>
                  <div className="flex-1 relative min-h-[80px]">
                    {items.map((item) => {
                      const position = getJobPosition(item.scheduled_time, item.promised_delivery);
                      return (
                        <div
                          key={item.job_id}
                          className={`absolute top-2 bottom-2 ${getStatusColor(item.task_status)} rounded-lg p-2 shadow-sm border border-white/20 cursor-pointer hover:shadow-md transition-shadow overflow-hidden`}
                          style={{
                            left: position.left,
                            width: position.width,
                          }}
                          onMouseEnter={() => setHoveredJob(item.job_id)}
                          onMouseLeave={() => setHoveredJob(null)}
                        >
                          <div className="text-xs text-white font-medium truncate">
                            {item.service_type}
                          </div>
                          <div className="text-xs text-white/90 truncate">
                            {item.car_model}
                          </div>

                          {/* Tooltip */}
                          {hoveredJob === item.job_id && (
                            <div className="absolute z-50 top-full left-0 mt-1 bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 min-w-[250px]">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">Job #{item.job_id}</span>
                                  <Badge className={getStatusBadgeColor(item.task_status)}>
                                    {item.task_status}
                                  </Badge>
                                </div>
                                <div className="text-sm space-y-0.5">
                                  <div><span className="font-medium">Service:</span> {item.service_type}</div>
                                  <div><span className="font-medium">Car:</span> {item.car_model}</div>
                                  <div><span className="font-medium">Start:</span> {new Date(item.scheduled_time).toLocaleTimeString()}</div>
                                  <div><span className="font-medium">End:</span> {new Date(item.promised_delivery).toLocaleTimeString()}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
