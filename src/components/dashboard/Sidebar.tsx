
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Calendar,
  MessageSquare,
  Users,
  Settings,
  BarChart3,
  Clock,
  CreditCard,
  Bell,
  UserCog,
  Building,
  Stethoscope,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      roles: ['individual', 'therapist', 'org_admin', 'admin']
    },
    {
      name: 'Book Session',
      href: '/book-session',
      icon: Calendar,
      roles: ['individual']
    },
    {
      name: 'Sessions',
      href: '/sessions',
      icon: Stethoscope,
      roles: ['individual', 'therapist']
    },
    {
      name: 'Availability',
      href: '/availability',
      icon: Clock,
      roles: ['therapist']
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageSquare,
      roles: ['individual', 'therapist', 'org_admin']
    },
    {
      name: 'Team Members',
      href: '/team',
      icon: Users,
      roles: ['org_admin']
    },
    {
      name: 'Organization',
      href: '/organization',
      icon: Building,
      roles: ['org_admin']
    },
    {
      name: 'Billing',
      href: '/billing',
      icon: CreditCard,
      roles: ['individual', 'org_admin']
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UserCog,
      roles: ['admin']
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      roles: ['individual', 'therapist', 'org_admin', 'admin']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['individual', 'therapist', 'org_admin', 'admin']
    },
  ];

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user?.role || 'individual')
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-card border-r w-64', className)}>
      {/* User Profile Section */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={""} />
            <AvatarFallback>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
