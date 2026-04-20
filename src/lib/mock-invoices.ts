export type InvoiceStatus = "pending_approval" | "approved" | "rejected";

export interface FieldWithConfidence<T = string> {
  value: T;
  confidence: number;
}

export interface USALISplit {
  id: string;
  percent: number;
  category: FieldWithConfidence;
  subcategory: FieldWithConfidence;
}

export interface InvoiceExtraction {
  id: string;
  status: InvoiceStatus;
  vendor: FieldWithConfidence;
  invoiceNumber: FieldWithConfidence;
  amount: FieldWithConfidence<number>;
  invoiceDate: FieldWithConfidence;
  dueDate: FieldWithConfidence;
  glCode: FieldWithConfidence;
  splits: USALISplit[];
  documentSrc: string;
}

export const USALI_CATEGORIES: string[] = [
  "Rooms",
  "Food & Beverage",
  "Housekeeping",
  "Administrative & General",
  "Sales & Marketing",
  "Property Operation & Maintenance",
  "Utilities",
  "Other Operating Departments",
];

export const USALI_SUBCATEGORIES: Record<string, string[]> = {
  Rooms: ["Guest Supplies", "Linen", "Uniforms", "Reservation Fees"],
  "Food & Beverage": ["Food Cost", "Beverage Cost", "Kitchen Supplies", "China & Glass"],
  Housekeeping: ["Cleaning Supplies", "Laundry", "Contract Cleaning", "Uniforms"],
  "Administrative & General": ["Office Supplies", "Legal Fees", "Professional Fees", "Credit Card Commissions"],
  "Sales & Marketing": ["Advertising", "Commissions", "Collateral", "Digital Marketing"],
  "Property Operation & Maintenance": ["Building Maintenance", "Grounds", "HVAC", "Contracts"],
  Utilities: ["Electricity", "Water", "Gas", "Waste Removal"],
  "Other Operating Departments": ["Spa", "Parking", "Retail"],
};

const MOCK_INVOICE: InvoiceExtraction = {
  id: "INV-2024-001",
  status: "pending_approval",
  vendor: { value: "Acme Office Supplies Ltd.", confidence: 98 },
  invoiceNumber: { value: "INV-2024-0892", confidence: 95 },
  amount: { value: 2450, confidence: 99 },
  invoiceDate: { value: "2024-01-15", confidence: 97 },
  dueDate: { value: "2024-02-14", confidence: 92 },
  glCode: { value: "6200-150", confidence: 88 },
  splits: [
    {
      id: "split-1",
      percent: 100,
      category: { value: "Housekeeping", confidence: 72 },
      subcategory: { value: "Cleaning Supplies", confidence: 68 },
    },
  ],
  documentSrc: "/mock-invoice.svg",
};

export function getMockInvoice(_id: string): InvoiceExtraction {
  return MOCK_INVOICE;
}
