
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  Clock, 
  Settings, 
  Bell, 
  CreditCard,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sessions', label: 'Sessions', icon: Calendar },
  { path: '/book-session', label: 'Book Session', icon: Calendar, roles: ['individual'] },
  { path: '/messages', label: 'Messages', icon: MessageSquare },
  { path: '/availability', label: 'Availability', icon: Clock, roles: ['therapist'] },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/billing', label: 'Billing', icon: CreditCard },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || 'individual')
  );

  const handleNavigation = (path: string) => {
    try {
      navigate(path);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="flex items-center justify-between p-4">
          <img 
            src="/src/assets/mindlyfe-logo.svg" 
            alt="Mindlyfe Logo" 
            className="h-8 w-auto"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        
        {isMobileMenuOpen && (
          <div className="border-t bg-white">
            <div className="p-2 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <img 
              src="/src/assets/mindlyfe-logo.svg" 
              alt="Mindlyfe Logo" 
              className="h-10 w-auto"
            />
          </div>
          
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
            
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
