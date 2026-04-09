import { forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Users, Download, Plug, Eye, Lock, FileText, Settings,
} from "lucide-react";

const trustItems = [
  {
    icon: Users,
    title: "Role-Based Access Control",
    description: "Three built-in roles (Director, Manager, Operations) with least-privilege defaults. Custom roles available on Enterprise.",
    status: "Active",
  },
  {
    icon: FileText,
    title: "Audit Logs",
    description: "Every data access, modification, and export is logged with user, timestamp, and action. Logs are retained for 90 days (Enterprise: configurable).",
    status: "Enterprise",
  },
  {
    icon: Download,
    title: "Data Export",
    description: "Full data export in CSV and PDF at any time. No vendor lock-in. API export available on Team and Enterprise.",
    status: "Active",
  },
  {
    icon: Plug,
    title: "Interoperability",
    description: "Connectors for PMS (Opera), POS (Micros), Accounting (Sage), and webhook-based integrations. REST API for custom integrations.",
    status: "Roadmap",
  },
  {
    icon: Shield,
    title: "Security Posture",
    description: "Data encrypted at rest and in transit. Session management with automatic timeout. SSO/SAML on Enterprise.",
    status: "Active",
  },
  {
    icon: Eye,
    title: "Usage Visibility",
    description: "Admin dashboard showing active users, data volumes, API usage, and feature adoption. Exportable usage reports.",
    status: "Team",
  },
  {
    icon: Lock,
    title: "Data Governance",
    description: "Data retention policies, geographic data residency options, and right-to-delete workflows.",
    status: "Enterprise",
  },
  {
    icon: Settings,
    title: "Admin Controls",
    description: "Centralized user management, IP allowlisting, session policies, and delegated administration.",
    status: "Enterprise",
  },
];

const statusColor: Record<string, string> = {
  Active: "bg-positive/10 text-positive border-positive/20",
  Team: "bg-primary/10 text-primary border-primary/20",
  Enterprise: "bg-accent/10 text-accent-foreground border-accent/20",
  Roadmap: "bg-muted text-muted-foreground",
};

export const EnterpriseTrustPanel = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="space-y-4">
    <div>
      <h2 className="text-sm font-semibold">Security, Governance & Compliance</h2>
      <p className="text-[11px] text-muted-foreground mt-0.5">
        Enterprise-grade controls designed for IT review and compliance audits.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {trustItems.map((item) => (
        <Card key={item.title} className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-medium">{item.title}</h3>
            </div>
            <Badge variant="outline" className={`text-[9px] ${statusColor[item.status]}`}>
              {item.status}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
        </Card>
      ))}
    </div>
  </div>
));

EnterpriseTrustPanel.displayName = "EnterpriseTrustPanel";
