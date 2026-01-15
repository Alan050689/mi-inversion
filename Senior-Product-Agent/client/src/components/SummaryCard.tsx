import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  isLoading?: boolean;
  testId: string;
  variant?: "default" | "positive" | "negative";
}

export function SummaryCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  isLoading,
  testId,
  variant = "default"
}: SummaryCardProps) {
  const variantStyles = {
    default: "text-foreground",
    positive: "text-emerald-600 dark:text-emerald-400",
    negative: "text-red-600 dark:text-red-400",
  };

  return (
    <Card data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            {isLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <p className={`text-3xl font-bold tracking-tight ${variantStyles[variant]}`}>
                {value}
              </p>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-md">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
