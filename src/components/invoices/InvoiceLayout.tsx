import { ReactNode } from "react";
import { InvoiceSidebar } from "./InvoiceSidebar";

interface Props {
  children: ReactNode;
}

export function InvoiceLayout({ children }: Props) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <InvoiceSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
