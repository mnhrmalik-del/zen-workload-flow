import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  AlertCircle,
  BarChart3,
  LogOut,
  Wrench,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Technicians', url: '/technicians', icon: Users },
  { title: 'Job Cards', url: '/job-cards', icon: ClipboardList },
  { title: 'Schedule', url: '/schedule', icon: Calendar },
  { title: 'Alerts', url: '/alerts', icon: AlertCircle },
  { title: 'KPIs', url: '/kpis', icon: BarChart3 },
];

export function AppSidebar() {
  const { logout, user } = useAuth();

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-sidebar-primary" />
          <div>
            <h2 className="font-semibold text-sidebar-foreground">Workshop Manager</h2>
            <p className="text-xs text-sidebar-foreground/60">Load Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'hover:bg-sidebar-accent/50'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="mb-2 text-sm text-sidebar-foreground">
          <p className="font-medium">{user?.username}</p>
          <p className="text-xs text-sidebar-foreground/60">{user?.email}</p>
        </div>
        <SidebarMenuButton onClick={logout} className="w-full">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
