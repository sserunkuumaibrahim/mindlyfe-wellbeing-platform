
import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <Card
      className={`max-w-md w-full mx-auto animate-fade-in border-0 rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 ${className || ""}`}
      style={{
        boxShadow: "0 20px 60px -12px rgba(0, 0, 0, 0.15), 0 8px 30px -8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <CardHeader className="space-y-2 pb-6 pt-8 px-8 text-center">
        <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-base text-gray-600 leading-relaxed">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-8 pb-2">{children}</CardContent>
      {footer && <CardFooter className="px-8 pb-8">{footer}</CardFooter>}
    </Card>
  );
}
