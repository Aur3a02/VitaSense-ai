import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, TrendingUp, TrendingDown, Minus, CheckCircle2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Checkup {
  id: number;
  userId: string;
  weekStart: string;
  wellnessScore: number;
  symptoms: string[];
  notes?: string;
  aiSummary?: string;
  createdAt: string;
}

interface WellnessScore {
  score: number;
  trend: "up" | "down" | "stable" | "no_data";
  lastCheckup: string | null;
}

const COMMON_SYMPTOMS = [
  "Fatigue", "Headache", "Stress", "Poor Sleep", "Anxiety", "Back Pain",
  "Stomach Issues", "Low Energy", "Brain Fog", "Muscle Soreness",
];

export default function WeeklyCheckup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [score, setScore] = useState(70);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: wellness } = useQuery<WellnessScore>({
    queryKey: ["wellness-score"],
    queryFn: () => fetch("/api/checkup/wellness", { credentials: "include" }).then((r) => r.json()),
  });

  const { data: history } = useQuery<Checkup[]>({
    queryKey: ["checkups"],
    queryFn: () => fetch("/api/checkup", { credentials: "include" }).then((r) => r.json()),
  });

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const r = await fetch("/api/checkup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wellnessScore: score, symptoms: selectedSymptoms, notes: notes || null }),
      });
      if (!r.ok) throw new Error("Failed");
      toast({ title: "Checkup submitted!", description: "Your wellness score has been recorded." });
      queryClient.invalidateQueries({ queryKey: ["wellness-score"] });
      queryClient.invalidateQueries({ queryKey: ["checkups"] });
      setSubmitted(true);
    } catch {
      toast({ title: "Error submitting checkup", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const trendIcon = {
    up: <TrendingUp className="h-4 w-4 text-green-500" />,
    down: <TrendingDown className="h-4 w-4 text-red-500" />,
    stable: <Minus className="h-4 w-4 text-yellow-500" />,
    no_data: <Minus className="h-4 w-4 text-muted-foreground" />,
  };

  const scoreColor = (s: number) =>
    s >= 75 ? "text-green-600" : s >= 50 ? "text-yellow-600" : "text-red-600";

  const scoreRingColor = (s: number) =>
    s >= 75 ? "#22c55e" : s >= 50 ? "#eab308" : "#ef4444";

  const r = 52;
  const circ = 2 * Math.PI * r;
  const dashoffset = circ - (score / 100) * circ;
  const currentDash = wellness ? circ - (wellness.score / 100) * circ : circ;

  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Weekly Wellness Check-up</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Rate your wellness each week to track your health trends over time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="relative h-28 w-28 shrink-0">
                <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
                  <circle
                    cx="60" cy="60" r={r} fill="none"
                    stroke={wellness ? scoreRingColor(wellness.score) : "#e5e7eb"}
                    strokeWidth="10"
                    strokeDasharray={circ}
                    strokeDashoffset={wellness ? currentDash : circ}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold ${wellness ? scoreColor(wellness.score) : "text-muted-foreground"}`}>
                    {wellness ? wellness.score : "--"}%
                  </span>
                  <span className="text-xs text-muted-foreground">Wellness</span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground">Current Score</p>
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  {wellness && trendIcon[wellness.trend]}
                  <span className="capitalize">{wellness?.trend === "no_data" ? "No previous data" : wellness?.trend ?? "—"}</span>
                </div>
                {wellness?.lastCheckup && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last: {format(new Date(wellness.lastCheckup), "MMM d, yyyy")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Past Checkups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-40 overflow-y-auto">
              {history && history.length > 0 ? (
                history.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{format(new Date(c.createdAt), "MMM d")}</span>
                    <span className={`font-semibold ${scoreColor(c.wellnessScore)}`}>{c.wellnessScore}%</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No history yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {submitted ? (
          <Card className="text-center py-12">
            <CardContent className="flex flex-col items-center gap-3">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h2 className="text-lg font-semibold">Checkup Submitted!</h2>
              <p className="text-muted-foreground text-sm">Your wellness score has been recorded for this week.</p>
              <Button variant="outline" onClick={() => { setSubmitted(false); setScore(70); setSelectedSymptoms([]); setNotes(""); }}>
                Submit Another
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>This Week's Check-up</CardTitle>
              <CardDescription>How are you feeling overall this week?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium">Wellness Score</label>
                  <span className={`text-2xl font-bold ${scoreColor(score)}`}>{score}%</span>
                </div>
                <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${score}%`,
                      background: `linear-gradient(to right, #ef4444, #eab308, #22c55e)`,
                    }}
                  />
                </div>
                <input
                  type="range" min={0} max={100} value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full mt-2 accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Feeling poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Any symptoms this week? (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selectedSymptoms.includes(s)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Additional notes (optional)</label>
                <Textarea
                  placeholder="Any other health observations this week..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Submit Weekly Check-up
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
