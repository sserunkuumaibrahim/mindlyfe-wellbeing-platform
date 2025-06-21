
import { UserRole } from "@/types/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Stethoscope, Building2 } from "lucide-react";

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
}

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const roles = [
    {
      role: 'individual' as UserRole,
      title: 'Individual Client',
      description: 'I am seeking mental health support and therapy services',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      role: 'therapist' as UserRole,
      title: 'Licensed Therapist',
      description: 'I am a licensed mental health professional offering therapy services',
      icon: Stethoscope,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      role: 'org_admin' as UserRole,
      title: 'Organization',
      description: 'I represent an organization seeking mental health services for members',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">
          Select the option that best describes you to get started
        </p>
      </div>

      <div className="space-y-3">
        {roles.map(({ role, title, description, icon: Icon, color, bgColor }) => (
          <Card
            key={role}
            className={`cursor-pointer transition-all duration-200 border-2 hover:border-primary/50 ${bgColor}`}
            onClick={() => onRoleSelect(role)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription className="text-sm">
                    {description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="text-xs text-muted-foreground text-center mt-6">
        All registrations are subject to verification and approval
      </div>
    </div>
  );
}
