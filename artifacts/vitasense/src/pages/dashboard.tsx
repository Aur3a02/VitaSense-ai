import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetRecentAnalyses, getGetRecentAnalysesQueryKey, useGetUrgencyBreakdown, getGetUrgencyBreakdownQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, AlertTriangle, Calendar, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: recent, isLoading: recentLoading } = useGetRecentAnalyses({ query: { queryKey: getGetRecentAnalysesQueryKey() } });
  const { data: breakdown, isLoading: breakdownLoading } = useGetUrgencyBreakdown({ query: { queryKey: getGetUrgencyBreakdownQueryKey() } });

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "mild_concern": return "hsl(var(--chart-5))"; // blueish
      case "moderate_concern": return "hsl(var(--chart-4))"; // yellowish
      case "seek_medical_attention": return "hsl(var(--chart-3))"; // orangish
      case "emergency_care": return "hsl(var(--destructive))"; // red
      default: return "hsl(var(--muted-foreground))";
    }
  };

  const getUrgencyBadgeColor = (level: string) => {
    switch (level) {
      case "mild_concern": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "moderate_concern": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "seek_medical_attention": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "emergency_care": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold text-foreground mb-8">Your Health Dashboard</h1>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/50"></CardHeader>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeek}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Emergencies</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.emergencyCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Most Common</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold truncate">{stats.mostCommonSymptom || "N/A"}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>Your latest symptom checks</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
                  ))}
                </div>
              ) : recent && recent.length > 0 ? (
                <div className="space-y-4">
                  {recent.map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div>
                        <div className="font-medium text-foreground">{analysis.symptoms.join(", ")}</div>
                        <div className="text-sm text-muted-foreground">{format(new Date(analysis.createdAt), "PPP")}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyBadgeColor(analysis.urgencyLevel)}`}>
                        {analysis.urgencyLabel}
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 text-center">
                    <Link href="/history">
                      <Button variant="outline">View All History</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">No recent analyses found.</p>
                  <Link href="/analyze">
                    <Button>Start an Analysis</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Urgency Breakdown</CardTitle>
              <CardDescription>Distribution of your past analyses</CardDescription>
            </CardHeader>
            <CardContent>
              {breakdownLoading ? (
                <div className="h-[250px] bg-muted/50 animate-pulse rounded" />
              ) : breakdown && breakdown.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={breakdown} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <XAxis dataKey="urgencyLabel" tick={{fontSize: 12}} interval={0} tickFormatter={(val) => val.split(' ')[0]} />
                      <YAxis allowDecimals={false} />
                      <Tooltip 
                        cursor={{fill: 'var(--muted)'}}
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getUrgencyColor(entry.urgencyLevel)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground h-[300px] flex items-center justify-center">
                  Not enough data for chart
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
