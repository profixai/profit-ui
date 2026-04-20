import { useParams } from "react-router-dom";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { getMockInvoice } from "@/lib/mock-invoices";
import { InvoiceLayout } from "@/components/invoices/InvoiceLayout";
import { InvoiceHeader } from "@/components/invoices/InvoiceHeader";
import { InvoiceViewer } from "@/components/invoices/InvoiceViewer";
import { ExtractedDataCard } from "@/components/invoices/ExtractedDataCard";

export default function InvoiceDetail() {
  const { id = "INV-2024-001" } = useParams();
  const invoice = getMockInvoice(id);

  return (
    <InvoiceLayout>
      <InvoiceHeader invoice={invoice} />
      <div className="flex-1 overflow-hidden p-4">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg">
          <ResizablePanel defaultSize={55} minSize={35}>
            <div className="h-full pr-2">
              <InvoiceViewer src={invoice.documentSrc} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={45} minSize={30}>
            <div className="h-full pl-2">
              <ExtractedDataCard invoice={invoice} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </InvoiceLayout>
  );
}
