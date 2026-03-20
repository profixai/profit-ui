import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ExplainButtonProps {
  onClick: () => void;
}

export const ExplainButton = ({ onClick }: ExplainButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-primary"
        onClick={onClick}
      >
        <MessageCircle className="h-3.5 w-3.5" />
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom">
      <p className="text-xs">Explain with AI</p>
    </TooltipContent>
  </Tooltip>
);
