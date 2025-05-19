
import { ReactNode } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <Card className={`w-full max-w-md rounded-2xl border-0 bg-white/90 shadow-xl backdrop-blur-md px-2 pb-6 pt-3 animate-fade-in ${className || ''}`}>
      <CardHeader className="space-y-2 p-6 pb-0 text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {description && <CardDescription className="text-center">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-6 pt-4">{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
