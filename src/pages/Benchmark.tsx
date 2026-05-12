import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { REGIONS, STAR_CATEGORIES } from "@/lib/benchmark/data";
import {
  calculateBenchmark,
  generateWatchouts,
  generateOpportunities,
  generateSustainability,
  type BenchmarkResult,
  type SustainabilityResult,
  type Watchout,
  type Opportunity,
} from "@/lib/benchmark/calculate";
import { supabase } from "@/integrations/supabase/client";
import BenchmarkReport from "@/components/benchmark/BenchmarkReport";

const WRAPPER_STYLE: React.CSSProperties = {
  "--background": "#fafaf7",
  "--foreground": "#1a2e29",
  "--card": "#ffffff",
  "--card-foreground": "#1a2e29",
  "--muted": "#f3f4f0",
  "--muted-foreground": "#6b7470",
  "--border": "#e6e4dd",
  "--primary": "#6b54b8",
  "--primary-foreground": "#ffffff",
  "--accent": "#02392C",
  "--accent-foreground": "#ffffff",
  "--destructive": "#b94a3d",
  "--destructive-foreground": "#ffffff",
  backgroundColor: "#fafaf7",
  color: "#1a2e29",
  fontFamily: "'DM Sans', sans-serif",
  minHeight: "100vh",
} as React.CSSProperties;

interface BenchmarkInputs {
  rooms: number;
  starCode: string;
  regionId: string;
}

interface ReportData {
  b: BenchmarkResult;
  sus: SustainabilityResult;
  watchouts: Watchout[];
  opps: Opportunity[];
}

export default function Benchmark() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [inputs, setInputs] = useState<BenchmarkInputs>({
    rooms: 35,
    starCode: "3",
    regionId: "",
  });
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const roomsLabel = inputs.rooms >= 300 ? "300+" : String(inputs.rooms);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.regionId) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    // Insert lead to Supabase (non-blocking)
    try {
      const { error } = await supabase.from("benchmark_leads" as any).insert({
        email,
        rooms: inputs.rooms,
        star_category: inputs.starCode,
        region_id: inputs.regionId,
        created_at: new Date().toISOString(),
      });
      if (error) {
        console.error("Supabase benchmark_leads insert error:", error);
      }
    } catch (err) {
      console.error("Supabase insert failed:", err);
    }

    // Compute report
    const b = calculateBenchmark(inputs.rooms, inputs.starCode, inputs.regionId);
    const sus = generateSustainability(b);
    const watchouts = generateWatchouts(b);
    const opps = generateOpportunities(b);
    setReportData({ b, sus, watchouts, opps });
    setSubmitting(false);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setStep(1);
    setReportData(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedRegion = inputs.regionId ? REGIONS[inputs.regionId] : null;
  const selectedStar = STAR_CATEGORIES[inputs.starCode];

  return (
    <div style={WRAPPER_STYLE}>
      {/* Step 3: Report */}
      {step === 3 && reportData && (
        <BenchmarkReport
          b={reportData.b}
          sus={reportData.sus}
          watchouts={reportData.watchouts}
          opps={reportData.opps}
          onBack={handleBack}
        />
      )}

      {/* Step 1 & 2 share common header */}
      {(step === 1 || step === 2) && (
        <>
          {/* Header */}
          <header
            className="px-6 py-4 flex items-center gap-3"
            style={{ borderBottom: "1px solid #e6e4dd", backgroundColor: "#ffffff" }}
          >
            <img src="/profix-logo.svg" alt="Profix" className="h-7 w-auto" />
            <span className="text-sm font-semibold" style={{ color: "#6b7470" }}>
              Hotel Benchmark
            </span>
          </header>

          <div className="max-w-xl mx-auto px-4 py-10">
            {/* Step 1 — Input form */}
            {step === 1 && (
              <>
                <div className="mb-8 text-center">
                  <h1
                    className="text-2xl md:text-3xl font-bold leading-tight mb-3"
                    style={{ color: "#1a2e29" }}
                  >
                    Know your numbers before your competitors do.
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: "#6b7470" }}>
                    Built on the latest INE, Banco de Portugal, DREM, SREA, AHP and Horwath HTL
                    data — get a complete view of how a hotel of your size, category and region
                    should be performing in 2025. Just three inputs.
                  </p>
                </div>

                <Card style={{ border: "1px solid #e6e4dd" }}>
                  <CardContent className="pt-6 pb-6">
                    <form onSubmit={handleInputSubmit} className="space-y-7">
                      {/* Rooms slider */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                          <Label
                            className="text-sm font-semibold"
                            style={{ color: "#1a2e29" }}
                          >
                            Number of rooms
                          </Label>
                          <span
                            className="text-lg font-bold tabular-nums"
                            style={{ color: "#02392C" }}
                          >
                            {roomsLabel} rooms
                          </span>
                        </div>
                        <Slider
                          min={10}
                          max={300}
                          step={5}
                          value={[inputs.rooms]}
                          onValueChange={([v]) => setInputs((p) => ({ ...p, rooms: v }))}
                          className="w-full"
                        />
                        <div
                          className="flex justify-between text-xs"
                          style={{ color: "#6b7470" }}
                        >
                          <span>10</span>
                          <span>300+</span>
                        </div>
                      </div>

                      {/* Star category */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold" style={{ color: "#1a2e29" }}>
                          Star category
                        </Label>
                        <RadioGroup
                          value={inputs.starCode}
                          onValueChange={(v) => setInputs((p) => ({ ...p, starCode: v }))}
                          className="grid grid-cols-2 gap-2"
                        >
                          {Object.entries(STAR_CATEGORIES).map(([code, cat]) => (
                            <Label
                              key={code}
                              htmlFor={`star-${code}`}
                              className="flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors"
                              style={{
                                border:
                                  inputs.starCode === code
                                    ? "2px solid #02392C"
                                    : "1px solid #e6e4dd",
                                backgroundColor:
                                  inputs.starCode === code ? "#f0fdf4" : "#ffffff",
                                color: "#1a2e29",
                              }}
                            >
                              <RadioGroupItem value={code} id={`star-${code}`} />
                              <span className="text-sm">{cat.label}</span>
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Region select */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold" style={{ color: "#1a2e29" }}>
                          Region
                        </Label>
                        <Select
                          value={inputs.regionId}
                          onValueChange={(v) => setInputs((p) => ({ ...p, regionId: v }))}
                        >
                          <SelectTrigger
                            className="w-full"
                            style={{ border: "1px solid #e6e4dd", color: "#1a2e29" }}
                          >
                            <SelectValue placeholder="Select your region" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(REGIONS).map(([id, r]) => (
                              <SelectItem key={id} value={id}>
                                {r.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="submit"
                        disabled={!inputs.regionId}
                        className="w-full font-semibold text-sm py-5"
                        style={{ backgroundColor: "#02392C", color: "#ffffff" }}
                      >
                        Get my benchmark →
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Step 2 — Email gate */}
            {step === 2 && (
              <>
                <div className="mb-8 text-center">
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
                    style={{ backgroundColor: "#f0fdf4", color: "#02392C" }}
                  >
                    Report ready
                  </div>
                  <h1
                    className="text-2xl font-bold mb-2"
                    style={{ color: "#1a2e29" }}
                  >
                    Your personalized report is ready.
                  </h1>
                  <p className="text-sm" style={{ color: "#6b7470" }}>
                    Enter your email to see your benchmark.
                  </p>
                  {selectedRegion && selectedStar && (
                    <p
                      className="mt-3 font-medium text-sm"
                      style={{ color: "#02392C" }}
                    >
                      {roomsLabel}-room {selectedStar.name} in {selectedRegion.name}
                    </p>
                  )}
                </div>

                <Card style={{ border: "1px solid #e6e4dd" }}>
                  <CardContent className="pt-6 pb-6">
                    <form onSubmit={handleEmailSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold" style={{ color: "#1a2e29" }}>
                          Work email
                        </Label>
                        <Input
                          type="email"
                          required
                          placeholder="you@yourhotel.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{ border: "1px solid #e6e4dd", color: "#1a2e29" }}
                        />
                        {emailError && (
                          <p className="text-xs" style={{ color: "#b94a3d" }}>{emailError}</p>
                        )}
                      </div>

                      <p className="text-xs" style={{ color: "#6b7470" }}>
                        By continuing, you agree to receive your benchmark report and occasional
                        Profix insights. Unsubscribe anytime.
                      </p>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full font-semibold text-sm py-5"
                        style={{ backgroundColor: "#02392C", color: "#ffffff" }}
                      >
                        {submitting ? "Generating…" : "See my report →"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <button
                  onClick={() => setStep(1)}
                  className="mt-4 text-sm underline block mx-auto"
                  style={{ color: "#6b7470", background: "none", border: "none", cursor: "pointer" }}
                >
                  ← Back
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
