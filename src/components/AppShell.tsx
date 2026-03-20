import { ReactNode, useState, useCallback } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { AskProfixPanel } from "@/components/AskProfixPanel";
import { SidebarProvider } from "@/components/ui/sidebar";

interface AppShellProps {
  children: ReactNode;
}

export interface AskProfixContext {
  openAskProfix: (question: string, contextLabel: string) => void;
}

export const AppShell = ({ children }: AppShellProps) => {
  const [askOpen, setAskOpen] = useState(false);
  const [prefill, setPrefill] = useState("");
  const [contextLabel, setContextLabel] = useState("");

  const openAskProfix = useCallback((question: string, label: string) => {
    setPrefill(question);
    setContextLabel(label);
    setAskOpen(true);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto p-6">
            {typeof children === "function"
              ? (children as (ctx: AskProfixContext) => ReactNode)({ openAskProfix })
              : children}
          </main>
        </div>
        <AskProfixPanel
          externalOpen={askOpen}
          onClose={() => setAskOpen(false)}
          prefillQuestion={prefill}
          contextLabel={contextLabel}
        />
      </div>
    </SidebarProvider>
  );
};
