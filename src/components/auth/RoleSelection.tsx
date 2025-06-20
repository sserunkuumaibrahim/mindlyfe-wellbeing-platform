
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/user";
import { User, Briefcase, Building2 } from "lucide-react";

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
}

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = [
    {
      value: 'individual' as UserRole,
      title: 'Individual Client',
      description: 'Seeking mental health support and therapy services',
      icon: User,
    },
    {
      value: 'therapist' as UserRole,
      title: 'Therapist',
      description: 'Licensed mental health professional providing therapy services',
      icon: Briefcase,
    },
    {
      value: 'org_admin' as UserRole,
      title: 'Organization',
      description: 'Organization representative managing employee mental health services',
      icon: Building2,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Account Type</h2>
        <p className="text-muted-foreground">
          Select the option that best describes your role
        </p>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Card
              key={role.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedRole === role.value ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedRole(role.value)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={() => selectedRole && onRoleSelect(selectedRole)}
        disabled={!selectedRole}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
}
