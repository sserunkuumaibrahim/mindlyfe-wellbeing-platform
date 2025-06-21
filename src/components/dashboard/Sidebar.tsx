
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  User, 
  Settings, 
  Bell, 
  MessageSquare, 
  BarChart3, 
  Users, 
  Shield,
  Clock,
  CreditCard,
  FileText,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();

  if (!profile) return null;

  const getNavigationItems = () => {
    const commonItems = [
      { icon: User, label: 'Profile', href: '/dashboard/profile' },
      { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
      { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
      { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
    ];

    const roleSpecificItems = {
      individual: [
        { icon: Calendar, label: 'Book Session', href: '/dashboard/book' },
        { icon: Clock, label: 'My Sessions', href: '/dashboard/sessions' },
        { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
        { icon: FileText, label: 'Resources', href: '/dashboard/resources' },
      ],
      therapist: [
        { icon: Calendar, label: 'My Schedule', href: '/dashboard/schedule' },
        { icon: Users, label: 'Clients', href: '/dashboard/clients' },
        { icon: Clock, label: 'Availability', href: '/dashboard/availability' },
        { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
        { icon: CreditCard, label: 'Earnings', href: '/dashboard/earnings' },
        { icon: Phone, label: 'Sessions', href: '/dashboard/sessions' },
      ],
      org_admin: [
        { icon: Users, label: 'Members', href: '/dashboard/members' },
        { icon: Calendar, label: 'Group Sessions', href: '/dashboard/group-sessions' },
        { icon: BarChart3, label: 'Reports', href: '/dashboard/reports' },
        { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
        { icon: Settings, label: 'Organization', href: '/dashboard/organization' },
      ],
      sys_admin: [
        { icon: Shield, label: 'Admin Panel', href: '/dashboard/admin' },
        { icon: Users, label: 'User Management', href: '/dashboard/admin/users' },
        { icon: FileText, label: 'Approvals', href: '/dashboard/admin/approvals' },
        { icon: BarChart3, label: 'Analytics', href: '/dashboard/admin/analytics' },
        { icon: Settings, label: 'System Settings', href: '/dashboard/admin/settings' },
      ],
      super_admin: [
        { icon: Shield, label: 'Super Admin', href: '/dashboard/super-admin' },
        { icon: Users, label: 'All Users', href: '/dashboard/super-admin/users' },
        { icon: BarChart3, label: 'Platform Analytics', href: '/dashboard/super-admin/analytics' },
        { icon: Settings, label: 'Global Settings', href: '/dashboard/super-admin/settings' },
      ],
    };

    return [
      ...roleSpecificItems[profile.role] || [],
      ...commonItems,
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <Card className="w-64 min-h-screen rounded-none border-r">
      <div className="p-6">
        {/* User Profile Section */}
        <div className="flex items-center space-x-3 mb-8">
          <Avatar>
            <AvatarImage src={profile.profile_photo_url} />
            <AvatarFallback>
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">
              {profile.first_name} {profile.last_name}
            </h3>
            <p className="text-xs text-gray-500 capitalize">
              {profile.role.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            
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
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="mt-8 pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </Card>
  );
};
