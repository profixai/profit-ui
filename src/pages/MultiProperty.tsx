import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useRequireRole } from "@/contexts/AuthContext";
import { useMultiProperty } from "@/hooks/useMultiProperty";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";

const kpiLabels = [
  { key: "revpar", label: "RevPAR", fmt: "€" },
  { key: "occ", label: "OCC%", fmt: "%" },
  { key: "adr", label: "ADR", fmt: "€" },
  { key: "gop", label: "GOP", fmt: "€" },
];

const revenueByDept = [
  { department: "Rooms", "Le Grand Hôtel": 198500, "Riviera Palace": 295000, "Alpine Lodge": 102000 },
  { department: "F&B", "Le Grand Hôtel": 78400, "Riviera Palace": 92000, "Alpine Lodge": 38000 },
  { department: "Other", "Le Grand Hôtel": 22000, "Riviera Palace": 25000, "Alpine Lodge": 16000 },
];

const MultiProperty = () => {
  useRequireRole(["manager", "direction"]);
  const navigate = useNavigate();

  const [group, setGroup] = useState("all");
  const { data: properties, loading, error } = useMultiProperty();

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">Portfolio View</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Cross-property performance comparison</p>
          </div>
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="paris">Paris Portfolio</SelectItem>
              <SelectItem value="lyon">Lyon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <LoadingState message="Loading portfolio data…" rows={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : !properties || properties.length === 0 ? (
          <EmptyState
            message="No properties found. Add properties to compare performance."
            actionLabel="Upload Data"
            onAction={() => navigate("/data")}
          />
        ) : (
          <>
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-[140px]">KPI</TableHead>
                    {properties.map((p) => (
                      <TableHead key={p.id} className="text-xs text-center">{p.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpiLabels.map((kpi) => (
                    <TableRow key={kpi.key}>
                      <TableCell className="text-xs font-medium">{kpi.label}</TableCell>
                      {properties.map((prop) => {
                        const val = prop[kpi.key as keyof typeof prop] as number;
                        const onBudget = kpi.key === "gop" ? val >= prop.gopBudget : true;
                        return (
                          <TableCell
                            key={prop.id}
                            className={`text-xs text-center font-mono-data ${
                              kpi.key === "gop"
                                ? onBudget ? "bg-positive/10 text-positive" : "bg-destructive/10 text-destructive"
                                : ""
                            }`}
                          >
                            {kpi.fmt === "€" && val >= 1000 ? `€${(val / 1000).toFixed(0)}K` : kpi.fmt === "€" ? `€${val}` : `${val}%`}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-medium mb-3">Revenue by Department</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueByDept}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Le Grand Hôtel" stackId="a" fill="hsl(var(--primary))" />
                  <Bar dataKey="Riviera Palace" stackId="a" fill="hsl(var(--accent))" />
                  <Bar dataKey="Alpine Lodge" stackId="a" fill="hsl(var(--muted-foreground))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {properties.filter((p) => p.anomalies.length > 0).length > 0 && (
              <Card className="p-4 space-y-3">
                <h2 className="text-sm font-medium">AI Anomaly Summary</h2>
                {properties
                  .filter((p) => p.anomalies.length > 0)
                  .map((p) => (
                    <div key={p.id} className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/15 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium">{p.name}</p>
                        {p.anomalies.map((a, i) => (
                          <p key={i} className="text-xs text-muted-foreground mt-0.5">{a}</p>
                        ))}
                      </div>
                    </div>
                  ))}
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
};

export default MultiProperty;
