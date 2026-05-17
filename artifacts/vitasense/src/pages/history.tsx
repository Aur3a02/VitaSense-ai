import { useListAnalyses, getListAnalysesQueryKey, useDeleteAnalysis, getGetDashboardStatsQueryKey, getGetUrgencyBreakdownQueryKey, getGetRecentAnalysesQueryKey } from "@workspace/api-client-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Info } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function History() {
  const { data: analyses, isLoading } = useListAnalyses({ query: { queryKey: getListAnalysesQueryKey() } });
  const deleteMutation = useDeleteAnalysis();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetUrgencyBreakdownQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentAnalysesQueryKey() });
          toast({ title: "Analysis deleted" });
        },
        onError: () => {
          toast({ title: "Failed to delete", variant: "destructive" });
        }
      }
    );
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

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif font-bold text-foreground mb-8">Analysis History</h1>

      {!analyses || analyses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground flex flex-col items-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg mb-2">No analyses saved yet.</p>
            <p>Your saved symptom analyses will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {analyses.map((analysis) => {
              const conditions = JSON.parse(analysis.possibleConditions || "[]");
              return (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden">
                    <Accordion type="single" collapsible>
                      <AccordionItem value={`item-${analysis.id}`} className="border-none">
                        <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-b border-border">
                          <AccordionTrigger className="hover:no-underline py-0 flex-1 justify-start gap-4">
                            <div className="flex flex-col items-start gap-1">
                              <span className="font-semibold text-lg">{analysis.symptoms.join(", ")}</span>
                              <span className="text-sm text-muted-foreground">{format(new Date(analysis.createdAt), "PPP 'at' p")}</span>
                            </div>
                          </AccordionTrigger>
                          <div className="flex items-center gap-4">
                            <Badge className={`px-3 py-1 text-sm ${getUrgencyBadgeColor(analysis.urgencyLevel)}`}>
                              {analysis.urgencyLabel}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(analysis.id);
                              }}
                              disabled={deleteMutation.isPending}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <AccordionContent className="p-6 bg-card">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                              <span className="text-sm text-muted-foreground block mb-1">Duration</span>
                              <span className="font-medium capitalize">{analysis.duration.replace("_", " ")}</span>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground block mb-1">Severity</span>
                              <span className="font-medium capitalize">{analysis.severity}</span>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground block mb-1">Age Range</span>
                              <span className="font-medium capitalize">{analysis.ageRange}</span>
                            </div>
                          </div>
                          
                          {analysis.summary && (
                            <div className="mb-6">
                              <h4 className="font-semibold mb-2">Summary</h4>
                              <p className="text-muted-foreground">{analysis.summary}</p>
                            </div>
                          )}

                          {conditions.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3">Possible Conditions</h4>
                              <div className="flex flex-wrap gap-2">
                                {conditions.map((c: any, i: number) => (
                                  <Badge key={i} variant="outline" className="bg-background">{c.name}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
    </AppShell>
  );
}
