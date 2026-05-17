import { useState } from "react";
import { useLocation } from "wouter";
import { useAnalyzeSymptoms, useGetSymptomSuggestions, getGetSymptomSuggestionsQueryKey } from "@workspace/api-client-react";
import { SymptomInputDuration, SymptomInputAgeRange, SymptomInputSeverity } from "@workspace/api-client-react";
import { useAnalysis } from "@/lib/analysis-context";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, X, ChevronRight, ChevronLeft, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const QUICK_SYMPTOMS = [
  "Headache","Fatigue","Fever","Nausea","Shortness of Breath",
  "Chest Pain","Back Pain","Sore Throat","Dizziness","Joint Pain",
  "Rash","Abdominal Pain","Cough","Vomiting","Insomnia",
];

const STEPS = ["Symptoms","Duration","Details"];

export default function Analyze() {
  const [, setLocation] = useLocation();
  const { setLatestResult } = useAnalysis();
  const { toast } = useToast();
  const analyzeMutation = useAnalyzeSymptoms();

  const [step, setStep] = useState(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [duration, setDuration] = useState<string>(SymptomInputDuration.few_hours);
  const [ageRange, setAgeRange] = useState<string>(SymptomInputAgeRange.adult);
  const [severity, setSeverity] = useState<string>(SymptomInputSeverity.mild);
  const [notes, setNotes] = useState("");

  const { data: suggestions } = useGetSymptomSuggestions(
    { q: searchQ },
    { query: { enabled: searchQ.length > 1, queryKey: getGetSymptomSuggestionsQueryKey({ q: searchQ }) } }
  );

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const addCustomSymptom = () => {
    const t = searchQ.trim();
    if (t && !symptoms.includes(t)) {
      setSymptoms((prev) => [...prev, t]);
    }
    setSearchQ("");
  };

  const handleSubmit = () => {
    if (symptoms.length === 0) {
      toast({ title: "Add at least one symptom", variant: "destructive" });
      return;
    }
    analyzeMutation.mutate(
      { data: { symptoms, duration: duration as typeof SymptomInputDuration[keyof typeof SymptomInputDuration], ageRange: ageRange as typeof SymptomInputAgeRange[keyof typeof SymptomInputAgeRange], severity: severity as typeof SymptomInputSeverity[keyof typeof SymptomInputSeverity], additionalNotes: notes || null } },
      {
        onSuccess: (result) => {
          setLatestResult(result, { symptoms, duration, ageRange, severity, additionalNotes: notes });
          setLocation("/results");
        },
        onError: () => toast({ title: "Analysis failed. Please try again.", variant: "destructive" }),
      }
    );
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  const filteredSuggestions = searchQ.length > 1
    ? (suggestions ?? []).filter((s) => !symptoms.includes(s.label)).slice(0, 8)
    : [];

  return (
    <AppShell>
      <div className="min-h-full p-6 flex gap-6 max-w-5xl mx-auto">
        {/* Main form card */}
        <div className="flex-1">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            {/* Progress */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
              <span className="text-sm font-medium text-primary">{STEPS[step]}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-xl font-bold mb-1">Select Your Symptoms</h2>
                  <p className="text-sm text-muted-foreground mb-4">Tap any symptoms or search for others.</p>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search symptoms (e.g., Headache)"
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
                    />
                    {searchQ && (
                      <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {filteredSuggestions.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {filteredSuggestions.map((s) => (
                        <button key={s.id} onClick={() => { toggleSymptom(s.label); setSearchQ(""); }}
                          className="px-3 py-1.5 text-sm border border-primary/40 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                          + {s.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {QUICK_SYMPTOMS.map((s) => (
                      <button key={s} onClick={() => toggleSymptom(s)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          symptoms.includes(s)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border text-foreground hover:border-primary/60"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>

                  {symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                      {symptoms.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {s}
                          <button onClick={() => toggleSymptom(s)} className="hover:text-primary/60"><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-xl font-bold mb-1">Duration</h2>
                  <p className="text-sm text-muted-foreground mb-6">How long have you had these symptoms?</p>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: "few_hours", label: "A few hours", desc: "Less than 24 hours" },
                      { value: "one_day", label: "About 1 day", desc: "24-48 hours" },
                      { value: "several_days", label: "Several days", desc: "2-7 days" },
                      { value: "one_week_plus", label: "1 week or more", desc: "More than a week" },
                      { value: "chronic", label: "Chronic / Long-term", desc: "Ongoing condition" },
                    ].map((opt) => (
                      <button key={opt.value} onClick={() => setDuration(opt.value)}
                        className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                          duration === opt.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-background hover:border-primary/40"
                        }`}>
                        <div>
                          <p className="font-medium text-sm">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                        {duration === opt.value && <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">✓</div>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Additional Details</h2>
                    <p className="text-sm text-muted-foreground mb-4">Help us give you a better assessment.</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Severity</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "mild", label: "Mild", color: "border-green-400 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" },
                        { value: "moderate", label: "Moderate", color: "border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300" },
                        { value: "severe", label: "Severe", color: "border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300" },
                        { value: "emergency", label: "Emergency", color: "border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300" },
                      ].map((opt) => (
                        <button key={opt.value} onClick={() => setSeverity(opt.value)}
                          className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            severity === opt.value ? opt.color : "border-border bg-background text-foreground hover:border-primary/40"
                          }`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Age Range</label>
                    <Select value={ageRange} onValueChange={setAgeRange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="child">Child (0-12)</SelectItem>
                        <SelectItem value="teen">Teen (13-17)</SelectItem>
                        <SelectItem value="adult">Adult (18-64)</SelectItem>
                        <SelectItem value="elderly">Elderly (65+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Additional context <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <textarea
                      className="w-full rounded-xl border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                      rows={3}
                      placeholder="e.g., I recently travelled, I have diabetes, taking medications..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="gap-1">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => {
                  if (step === 0 && symptoms.length === 0) { toast({ title: "Add at least one symptom", variant: "destructive" }); return; }
                  setStep((s) => s + 1);
                }} className="gap-1">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={analyzeMutation.isPending} className="gap-2 min-w-32">
                  {analyzeMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Activity className="h-4 w-4" /> Analyze</>}
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">For educational purposes only. Not a medical diagnosis.</p>
        </div>

        {/* Sidebar summary */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="bg-foreground text-background rounded-2xl p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Your Analysis</span>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-50 mb-1">SYMPTOMS</p>
                {symptoms.length === 0 ? (
                  <p className="opacity-40 text-xs italic">None selected</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {symptoms.map((s) => (
                      <span key={s} className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest opacity-50 mb-1">DURATION</p>
                <p className="opacity-80 text-xs capitalize">{duration.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest opacity-50 mb-1">DETAILS</p>
                <p className="opacity-80 text-xs capitalize">{severity} · {ageRange}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
