import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Droplets, Moon, Activity, Apple, Brain, Sun, Shield, User, Sunrise, Monitor, Stethoscope, Smile, Wine, Users, Wind, Leaf, Zap, Trees, XCircle, Heart, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  droplets: Droplets, moon: Moon, activity: Activity, apple: Apple, brain: Brain,
  sun: Sun, shield: Shield, user: User, sunrise: Sunrise, monitor: Monitor,
  stethoscope: Stethoscope, smile: Smile, wine: Wine, users: Users, wind: Wind,
  leaf: Leaf, zap: Zap, trees: Trees, "x-circle": XCircle, heart: Heart, package: Package,
};

interface HealthTip {
  id: string;
  title: string;
  body: string;
  category: string;
  icon: string;
}

const categoryColor: Record<string, string> = {
  Nutrition: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Lifestyle: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Fitness: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "Mental Health": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Prevention: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function HealthTips() {
  const { data: tips, isLoading } = useQuery<HealthTip[]>({
    queryKey: ["daily-tips"],
    queryFn: () => fetch("/api/tips/daily", { credentials: "include" }).then((r) => r.json()),
    staleTime: 60_000 * 60,
  });

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Daily Health Tips</h1>
          <p className="text-muted-foreground text-sm mt-1">{today} · Tips refresh daily</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : tips && tips.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Today's Tips</p>
            {tips.map((tip, i) => {
              const Icon = iconMap[tip.icon] ?? Activity;
              return (
                <Card key={tip.id} className="border-l-4 border-l-primary overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 pt-4 px-5">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{tip.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[tip.category] ?? "bg-muted text-muted-foreground"}`}>
                            {tip.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed pl-12">{tip.body}</p>
                  </CardContent>
                </Card>
              );
            })}

            <div className="mt-8">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-4">General Wellness Reminders</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Droplets, label: "Drink 8+ glasses of water daily" },
                  { icon: Moon, label: "Sleep 7-8 hours each night" },
                  { icon: Activity, label: "30 min of exercise daily" },
                  { icon: Apple, label: "Eat 5 servings of produce daily" },
                  { icon: Brain, label: "Practice mindfulness or meditation" },
                  { icon: Stethoscope, label: "Schedule annual health checkups" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg text-sm text-foreground">
                    <r.icon className="h-4 w-4 text-primary shrink-0" />
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            No tips available today. Check back soon!
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-8">
          These tips are for general wellness education only. Always consult a healthcare professional for medical advice.
        </p>
      </div>
    </AppShell>
  );
}
