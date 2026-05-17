import { Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { AppShell } from "@/components/app-shell";
import {
  useGetDashboardStats, getGetDashboardStatsQueryKey,
  useGetRecentAnalyses, getGetRecentAnalysesQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ChevronRight, MapPin, Loader2, Droplets, Moon } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface WellnessScore { score: number; trend: string; lastCheckup: string | null; }
interface UserProfile { genotype: string | null; bloodGroup: string | null; sex: string | null; dateOfBirth: string | null; allergies: string[]; }
interface HealthTip { id: string; title: string; body: string; category: string; icon: string; }

const urgencyBadge: Record<string, string> = {
  mild_concern: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  moderate_concern: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  seek_medical_attention: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  emergency_care: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.firstName ?? user?.email?.split("@")[0] ?? "there";

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: recent, isLoading: recentLoading } = useGetRecentAnalyses({ query: { queryKey: getGetRecentAnalysesQueryKey() } });
  const { data: wellness } = useQuery<WellnessScore>({
    queryKey: ["wellness-score"],
    queryFn: () => fetch("/api/checkup/wellness", { credentials: "include" }).then((r) => r.json()),
  });
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: () => fetch("/api/profile", { credentials: "include" }).then((r) => r.json()),
  });
  const { data: tips } = useQuery<HealthTip[]>({
    queryKey: ["daily-tips"],
    queryFn: () => fetch("/api/tips/daily", { credentials: "include" }).then((r) => r.json()),
    staleTime: 3_600_000,
  });

  const score = wellness?.score ?? 0;
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dashoffset = circ - (score / 100) * circ;
  const scoreColor = score >= 75 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";

  return (
    <AppShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: main column */}
          <div className="xl:col-span-2 space-y-6">
            {/* Welcome + wellness ring */}
            <Card>
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">Welcome back, {firstName}.</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(stats?.totalAnalyses ?? 0) > 0
                      ? `You have completed ${stats?.totalAnalyses} health ${stats?.totalAnalyses === 1 ? "analysis" : "analyses"}. Keep monitoring your wellness.`
                      : "Start your first symptom analysis to track your health."}
                  </p>
                  <Link href="/analyze">
                    <Button size="sm" className="mt-3 gap-2 rounded-full">
                      <Activity className="h-3.5 w-3.5" /> New Symptom Analysis
                    </Button>
                  </Link>
                </div>
                {/* Wellness ring */}
                <div className="shrink-0 relative h-28 w-28">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                    <circle cx="50" cy="50" r={r} fill="none" stroke={scoreColor} strokeWidth="8"
                      strokeDasharray={circ} strokeDashoffset={wellness ? dashoffset : circ}
                      strokeLinecap="round" className="transition-all duration-700" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold" style={{ color: scoreColor }}>{score}%</span>
                    <span className="text-[10px] text-muted-foreground font-medium">WELLNESS</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent analyses */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-foreground">Recent Analyses</h2>
                <Link href="/history" className="text-sm text-primary hover:underline flex items-center gap-1">View All <ChevronRight className="h-3 w-3" /></Link>
              </div>
              <div className="space-y-2">
                {recentLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : recent && recent.length > 0 ? (
                  recent.map((a) => (
                    <Card key={a.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{a.symptoms.slice(0, 2).join(", ")}{a.symptoms.length > 2 ? "..." : ""}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(a.createdAt), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgencyBadge[a.urgencyLevel] ?? "bg-muted text-muted-foreground"}`}>
                            {a.urgencyLabel}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No analyses yet. <Link href="/analyze" className="text-primary hover:underline">Start one now →</Link>
                  </CardContent></Card>
                )}
              </div>
            </div>

            {/* Personalized tips */}
            {tips && tips.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-foreground">Personalized Tips</h2>
                  <Link href="/health-tips" className="text-sm text-primary hover:underline flex items-center gap-1">All Tips <ChevronRight className="h-3 w-3" /></Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tips.map((tip) => (
                    <div key={tip.id} className="p-3 bg-card rounded-xl border border-border">
                      <p className="font-semibold text-sm text-primary mb-1">{tip.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{tip.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby healthcare map placeholder */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-foreground">Nearby Healthcare</h2>
                <Link href="/nearby" className="text-sm text-primary hover:underline flex items-center gap-1">Open Map <ChevronRight className="h-3 w-3" /></Link>
              </div>
              <Card className="overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-800 dark:to-slate-950 relative flex items-center justify-center">
                  <div className="text-center text-white">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-70" />
                    <p className="text-sm font-medium opacity-80">Find healthcare near you</p>
                    <p className="text-xs opacity-50">Uses your location</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <Link href="/nearby">
                    <Button className="w-full gap-2" variant="outline">
                      <MapPin className="h-4 w-4" /> Find Nearby Clinics & Hospitals
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-4">
            {/* Health profile */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3">Health Profile</h3>
                {profile ? (
                  <div className="space-y-2.5">
                    {[
                      { label: "Age / Sex", value: profile.dateOfBirth
                        ? `${Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))} / ${profile.sex ? profile.sex.charAt(0).toUpperCase() : "—"}`
                        : profile.sex ? `— / ${profile.sex.charAt(0).toUpperCase()}` : "—" },
                      { label: "Blood Type", value: profile.bloodGroup ?? "—" },
                      { label: "Genotype", value: profile.genotype ?? "—" },
                      { label: "Allergies", value: profile.allergies?.length > 0 ? profile.allergies.join(", ") : "None" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-medium text-foreground truncate max-w-24 text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">Complete your health profile for better analysis.</p>
                    <Link href="/profile"><Button size="sm" variant="outline" className="w-full">Set Up Profile</Button></Link>
                  </div>
                )}
                <Link href="/profile">
                  <Button size="sm" variant="ghost" className="w-full mt-3 text-xs text-primary">Edit Profile →</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { href: "/analyze", label: "Analyze Symptoms", icon: Activity },
                    { href: "/nearby", label: "Find Nearby Clinics", icon: MapPin },
                    { href: "/weekly-checkup", label: "Weekly Check-up", icon: Activity },
                  ].map((action) => (
                    <Link key={action.href} href={action.href}>
                      <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <action.icon className="h-4 w-4 text-primary" />
                          {action.label}
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            {!statsLoading && stats && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-3">Your Stats</h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Analyses</span><span className="font-bold">{stats.totalAnalyses}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">This Week</span><span className="font-bold">{stats.thisWeek}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Top Symptom</span><span className="font-medium capitalize">{stats.mostCommonSymptom ?? "—"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Emergencies</span><span className={`font-bold ${stats.emergencyCount > 0 ? "text-red-500" : ""}`}>{stats.emergencyCount}</span></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
