
import React from 'react';
import { useRouter } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { 
  Calendar, 
  MessageSquare, 
  Users, 
  Settings, 
  BarChart3, 
  CreditCard,
  User,
  Clock,
  Shield,
  FileText,
  Video,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigationItems = {
  individual: [
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
    { icon: Calendar, label: 'Book Session', href: '/dashboard/book' },
    { icon: Clock, label: 'My Sessions', href: '/dashboard/sessions' },
    { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
    { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
    { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ],
  therapist: [
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
    { icon: Calendar, label: 'Availability', href: '/dashboard/availability' },
    { icon: Clock, label: 'Sessions', href: '/dashboard/sessions' },
    { icon: Users, label: 'Clients', href: '/dashboard/clients' },
    { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
    { icon: Video, label: 'Video Calls', href: '/dashboard/video' },
    { icon: FileText, label: 'Session Notes', href: '/dashboard/notes' },
    { icon: CreditCard, label: 'Earnings', href: '/dashboard/earnings' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ],
  org_admin: [
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Members', href: '/dashboard/members' },
    { icon: Calendar, label: 'Group Sessions', href: '/dashboard/group-sessions' },
    { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
    { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
    { icon: Settings, label: 'Organization', href: '/dashboard/organization' },
  ],
  admin: [
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
    { icon: Shield, label: 'Approvals', href: '/dashboard/approvals' },
    { icon: Users, label: 'User Management', href: '/dashboard/users' },
    { icon: FileText, label: 'Audit Logs', href: '/dashboard/audit' },
    { icon: Settings, label: 'System Settings', href: '/dashboard/system' },
  ],
};

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const { profile } = useProfile();
  const currentPath = window.location.pathname;

  if (!profile) return null;

  const role = profile.role === 'sys_admin' || profile.role === 'super_admin' ? 'admin' : profile.role;
  const items = navigationItems[role as keyof typeof navigationItems] || [];

  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          Mindlyfe
        </h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          
          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive && "bg-primary text-primary-foreground"
              )}
              onClick={() => router.push(item.href)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
};
