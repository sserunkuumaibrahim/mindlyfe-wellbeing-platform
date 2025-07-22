import React from 'react';
import { UserRole } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Building2 } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

const roleOptions = [
  {
    role: 'individual' as UserRole,
    title: 'Individual',
    description: 'Personal mental health support',
    icon: Users,
    color: 'text-blue-600',
  },
  {
    role: 'therapist' as UserRole,
    title: 'Therapist',
    description: 'Licensed mental health professional',
    icon: UserCheck,
    color: 'text-green-600',
  },
  {
    role: 'org_admin' as UserRole,
    title: 'Organization',
    description: 'Manage organizational mental health',
    icon: Building2,
    color: 'text-purple-600',
  },
];

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Account Type</h2>
        <p className="text-gray-600">Select the option that best describes your role</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roleOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Card
              key={option.role}
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => {
                console.log('Card clicked for role:', option.role); // Debug log
                onSelectRole(option.role);
              }}
            >
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">
                  <IconComponent className={`h-8 w-8 ${option.color}`} />
                </div>
                <CardTitle className="text-lg">{option.title}</CardTitle>
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Button clicked for role:', option.role); // Debug log
                    onSelectRole(option.role);
                  }}
                >
                  Select {option.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}