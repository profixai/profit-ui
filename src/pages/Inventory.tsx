import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireRole } from "@/contexts/AuthContext";
import { useInventory } from "@/hooks/useInventory";
import { toast } from "sonner";
import { submitInventory } from "@/services/api";
import { WhyThisMatters } from "@/components/saas/WhyThisMatters";
import { pageValueBlocks } from "@/lib/saas-data";

const departmentLines: Record<string, string[]> = {
  rooms: ["Linen & Towels", "Minibar Restock", "Amenities (Toiletries)", "Cleaning Supplies"],
  fb: ["Beverage Cost", "Food Cost", "Wastage", "Disposables"],
  housekeeping: ["Cleaning Chemicals", "Equipment Maintenance", "Laundry Consumables"],
  maintenance: ["Spare Parts", "Electrical Supplies", "Plumbing Supplies", "HVAC Filters"],
};

type SubmissionStatus = "Draft" | "Submitted" | "Approved";

interface HistoryEntry {
  date: string;
  department: string;
  total: number;
  status: SubmissionStatus;
}

const mockHistory: HistoryEntry[] = [
  { date: "2026-03-31", department: "F&B", total: 3420, status: "Approved" },
  { date: "2026-03-30", department: "Rooms", total: 1850, status: "Approved" },
  { date: "2026-03-30", department: "F&B", total: 3180, status: "Submitted" },
  { date: "2026-03-29", department: "Housekeeping", total: 920, status: "Approved" },
  { date: "2026-03-29", department: "Maintenance", total: 1540, status: "Submitted" },
  { date: "2026-03-28", department: "F&B", total: 3650, status: "Draft" },
  { date: "2026-03-27", department: "Rooms", total: 1720, status: "Approved" },
];

const statusColor: Record<SubmissionStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Submitted: "bg-accent/20 text-accent-foreground",
  Approved: "bg-positive/10 text-positive",
};

const today = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
const todayISO = new Date().toISOString().split("T")[0];

const Inventory = () => {
  useRequireRole(["inventory"]);

  const [activeDept, setActiveDept] = useState("fb");
  const [values, setValues] = useState<Record<string, Record<string, { amount: string; notes: string }>>>({});
  const [statuses, setStatuses] = useState<Record<string, SubmissionStatus>>({});

  const { loading } = useInventory(activeDept, todayISO);

  const getVal = (dept: string, line: string) =>
    values[dept]?.[line] || { amount: "", notes: "" };

  const setVal = (dept: string, line: string, field: "amount" | "notes", v: string) => {
    setValues((prev) => ({
      ...prev,
      [dept]: { ...prev[dept], [line]: { ...getVal(dept, line), [field]: v } },
    }));
  };

  const handleSave = async (dept: string, status: SubmissionStatus) => {
    setStatuses((prev) => ({ ...prev, [dept]: status }));
    if (status === "Submitted") {
      toast.success(`${dept === "fb" ? "F&B" : dept} submission sent for review`);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-base font-semibold">Daily Stock & Cost Entry</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
        </div>

        <Tabs value={activeDept} onValueChange={setActiveDept}>
          <TabsList>
            <TabsTrigger value="rooms" className="text-xs">Rooms</TabsTrigger>
            <TabsTrigger value="fb" className="text-xs">F&B</TabsTrigger>
            <TabsTrigger value="housekeeping" className="text-xs">Housekeeping</TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs">Maintenance</TabsTrigger>
          </TabsList>

          {Object.entries(departmentLines).map(([dept, lines]) => (
            <TabsContent key={dept} value={dept}>
              <Card className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium capitalize">{dept === "fb" ? "Food & Beverage" : dept}</h2>
                  {statuses[dept] && (
                    <Badge className={`text-[10px] ${statusColor[statuses[dept]]}`}>
                      {statuses[dept]}
                    </Badge>
                  )}
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {lines.map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lines.map((line) => {
                      const val = getVal(dept, line);
                      return (
                        <div key={line} className="grid grid-cols-[1fr_120px_1fr] gap-3 items-start">
                          <Label className="text-xs pt-2">{line}</Label>
                          <div>
                            <Input
                              type="number"
                              placeholder="€ 0"
                              value={val.amount}
                              onChange={(e) => setVal(dept, line, "amount", e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <Textarea
                            placeholder="Notes (optional)"
                            value={val.notes}
                            onChange={(e) => setVal(dept, line, "notes", e.target.value)}
                            className="text-xs min-h-[32px] h-8 resize-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => handleSave(dept, "Draft")}>
                    Save Draft
                  </Button>
                  <Button size="sm" className="text-xs" onClick={() => handleSave(dept, "Submitted")}>
                    Submit for Review
                  </Button>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Submission History */}
        <Card className="p-4">
          <h2 className="text-sm font-medium mb-3">Recent Submissions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Department</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
                <TableHead className="text-xs text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHistory.map((entry, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs">{entry.date}</TableCell>
                  <TableCell className="text-xs">{entry.department}</TableCell>
                  <TableCell className="text-xs text-right font-mono-data">€{entry.total.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={`text-[10px] ${statusColor[entry.status]}`}>{entry.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
};

export default Inventory;
