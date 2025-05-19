
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
      className={`max-w-md w-full mx-auto animate-fade-in border-0 rounded-2xl md:rounded-3xl bg-white/55 shadow-2xl px-6 pb-8 pt-5 backdrop-blur-lg ring-1 ring-white/40 ${className || ""}`}
      style={{
        transition: "box-shadow 0.15s, background 0.3s",
        boxShadow:
          "0 8px 32px 0 rgba(60, 50, 140, 0.1),0 1.5px 9px 0 rgba(80,80,120,.10)",
        // subtle glassy effect + shadow
        backdropFilter: "blur(14px)",
      }}
    >
      <CardHeader className="space-y-1.5 p-6 pb-0 text-center">
        <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-950">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-base md:text-lg text-gray-600 text-center font-normal mt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-4">{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
