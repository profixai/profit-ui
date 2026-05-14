import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle, WifiOff, Inbox, ArrowRight,
} from "lucide-react";

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export const LoadingState = ({ message = "Loading…", rows = 4 }: LoadingStateProps) => (
  <div className="space-y-3">
    <p className="text-xs text-muted-foreground">{message}</p>
    <div className="grid grid-cols-1 gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

interface EmptyStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export const EmptyState = ({
  title = "No data yet",
  message,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}: EmptyStateProps) => (
  <Card className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
    <h3 className="text-sm font-semibold">{title}</h3>
    <p className="text-xs text-muted-foreground mt-1 max-w-xs">{message}</p>
    {actionLabel && onAction && (
      <Button size="sm" className="mt-4 text-xs gap-1.5" onClick={onAction}>
        {actionLabel} <ArrowRight className="h-3 w-3" />
      </Button>
    )}
  </Card>
);

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) => (
  <Card className="flex flex-col items-center justify-center py-12 px-6 text-center border-destructive/20 bg-destructive/5">
    <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
      <AlertTriangle className="h-5 w-5 text-destructive" />
    </div>
    <h3 className="text-sm font-semibold">Error</h3>
    <p className="text-xs text-muted-foreground mt-1 max-w-xs">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" className="mt-4 text-xs" onClick={onRetry}>
        Retry
      </Button>
    )}
  </Card>
);

interface DisconnectedStateProps {
  onRetry?: () => void;
}

export const DisconnectedState = ({ onRetry }: DisconnectedStateProps) => (
  <Card className="flex flex-col items-center justify-center py-12 px-6 text-center border-accent/20 bg-accent/5">
    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mb-3">
      <WifiOff className="h-5 w-5 text-accent-foreground" />
    </div>
    <h3 className="text-sm font-semibold">Connection lost</h3>
    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
      Unable to reach the server. Check your connection and try again.
    </p>
    {onRetry && (
      <Button variant="outline" size="sm" className="mt-4 text-xs" onClick={onRetry}>
        Retry
      </Button>
    )}
  </Card>
);
