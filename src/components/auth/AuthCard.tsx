
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
      className={`max-w-md w-full mx-auto rounded-3xl bg-white/95 shadow-2xl px-6 pb-8 pt-5 
      animate-fade-in border-0 ring-1 ring-black/5 backdrop-blur-md ${className || ""}`}
      style={{
        transition: "box-shadow 0.2s, background 0.4s",
      }}
    >
      <CardHeader className="space-y-1.5 p-6 pb-0 text-center">
        <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-base md:text-lg text-gray-500 text-center font-normal mt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-4">{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
