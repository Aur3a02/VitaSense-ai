import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAnalysis } from "@/lib/analysis-context";
import { useSaveAnalysis, getListAnalysesQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { AppShell } from "@/components/app-shell";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, MapPin, Bookmark, BookmarkCheck, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const urgencyConfig = {
  mild_concern:              { label: "Mild Concern",              color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300", bar: "bg-blue-400" },
  moderate_concern:          { label: "Moderate Concern",          color: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300", bar: "bg-yellow-400" },
  seek_medical_attention:    { label: "See a Doctor",              color: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300", bar: "bg-orange-400" },
  emergency_care:            { label: "Emergency",                 color: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300", bar: "bg-red-400" },
};

export default function Results() {
  const [, setLocation] = useLocation();
  const { latestResult, latestInput } = useAnalysis();
  const saveMutation = useSaveAnalysis();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [selected, setSelected] = useState<number>(0);

  useEffect(() => {
    if (!latestResult) setLocation("/analyze");
  }, [latestResult, setLocation]);

  if (!latestResult) return null;

  const urgency = urgencyConfig[latestResult.urgencyLevel as keyof typeof urgencyConfig] ?? urgencyConfig.mild_concern;
  const conditions = latestResult.possibleConditions ?? [];
  const selectedCondition = conditions[selected];

  const handleSave = () => {
    saveMutation.mutate(
      {
        data: {
          symptoms: latestInput?.symptoms ?? ["Unknown"],
          duration: latestInput?.duration ?? "unknown",
          ageRange: latestInput?.ageRange ?? "adult",
          severity: latestInput?.severity ?? "mild",
          urgencyLevel: latestResult.urgencyLevel,
          urgencyLabel: latestResult.urgencyLabel,
          possibleConditions: JSON.stringify(latestResult.possibleConditions),
          lifestyleAdvice: JSON.stringify(latestResult.lifestyleAdvice),
          whenToSeeDoctor: JSON.stringify(latestResult.whenToSeeDoctor),
          summary: latestResult.summary,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          setSaved(true);
          toast({ title: "Analysis saved to your history" });
        },
        onError: () => toast({ title: "Failed to save", variant: "destructive" }),
      }
    );
  };

  return (
    <AppShell>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/analyze")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Symptom Analysis Results</h1>
              <p className="text-sm text-muted-foreground">Based on: {latestInput?.symptoms?.join(", ") ?? "your symptoms"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm px-3 py-1 rounded-full border font-medium ${urgency.color}`}>
              {urgency.label}
            </span>
            <Button size="sm" variant="outline" onClick={handleSave} disabled={saved || saveMutation.isPending} className="gap-1.5">
              {saved ? <><BookmarkCheck className="h-4 w-4 text-primary" /> Saved</> : <><Bookmark className="h-4 w-4" /> Save</>}
            </Button>
          </div>
        </div>

        {/* Emergency banner */}
        {latestResult.urgencyLevel === "emergency_care" && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 dark:bg-red-900/20 dark:border-red-800">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-300">Seek emergency care immediately</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">Call emergency services or go to the nearest emergency room.</p>
            </div>
          </motion.div>
        )}

        {latestResult.summary && (
          <div className="p-4 bg-muted/40 rounded-xl border border-border mb-6 text-sm text-foreground leading-relaxed">
            {latestResult.summary}
          </div>
        )}

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: ranked conditions list */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">Possible Conditions</h2>
            {conditions.map((c, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => setSelected(i)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected === i ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-sm text-foreground">{c.name}</span>
                  <span className="text-sm font-bold text-primary shrink-0 ml-2">{c.likelihood ?? "—"}%</span>
                </div>
                {/* Likelihood bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                  <motion.div
                    className={`h-full rounded-full ${urgency.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${c.likelihood ?? 0}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
              </motion.button>
            ))}

            {/* When to see doctor */}
            {latestResult.whenToSeeDoctor && latestResult.whenToSeeDoctor.length > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl dark:bg-orange-900/10 dark:border-orange-800 mt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-2">When to See a Doctor</p>
                <ul className="space-y-1">
                  {latestResult.whenToSeeDoctor.map((w, i) => (
                    <li key={i} className="text-xs text-orange-700 dark:text-orange-300 flex items-start gap-1.5">
                      <span className="mt-0.5 shrink-0">•</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: condition detail */}
          <div className="lg:col-span-3">
            {selectedCondition && (
              <motion.div
                key={selected}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-card border border-border rounded-2xl p-6 sticky top-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">{selectedCondition.name}</h2>
                  <span className="text-2xl font-bold text-primary">{selectedCondition.likelihood ?? "—"}%</span>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{selectedCondition.description}</p>

                {selectedCondition.commonCauses?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-foreground mb-2">Common Causes & Triggers</h3>
                    <ul className="space-y-1">
                      {selectedCondition.commonCauses.map((c, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5 shrink-0">•</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCondition.riskFactors?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-foreground mb-2">Risk Factors</h3>
                    <ul className="space-y-1">
                      {selectedCondition.riskFactors.map((r, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5 shrink-0">•</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCondition.basicApproaches?.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-sm font-bold text-foreground mb-2">General Approaches</h3>
                    <ul className="space-y-1">
                      {selectedCondition.basicApproaches.map((a, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5 shrink-0">•</span>{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link href="/nearby">
                  <Button className="w-full gap-2">
                    <MapPin className="h-4 w-4" />
                    Find Nearby Healthcare
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Lifestyle advice */}
            {latestResult.lifestyleAdvice && latestResult.lifestyleAdvice.length > 0 && (
              <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Lifestyle Advice</p>
                <ul className="space-y-1.5">
                  {latestResult.lifestyleAdvice.map((a, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5 shrink-0">✓</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6 max-w-2xl mx-auto">
          {latestResult.disclaimer}
        </p>
      </div>
    </AppShell>
  );
}
