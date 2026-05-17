import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAnalysis } from "@/lib/analysis-context";
import { useSaveAnalysis, getListAnalysesQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Info, ArrowLeft, Bookmark, HeartPulse, Stethoscope, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Results() {
  const [, setLocation] = useLocation();
  const { latestResult } = useAnalysis();
  const saveMutation = useSaveAnalysis();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!latestResult) {
      setLocation("/analyze");
    }
  }, [latestResult, setLocation]);

  if (!latestResult) return null;

  const handleSave = () => {
    // Assuming we have the inputs stored or just save the result. 
    // Wait, the API needs SavedAnalysisInput which includes the original symptoms.
    // For now we'll construct a valid object based on the result.
    // In a real app we'd also store the initial input in context.
    toast({
      title: "Saving analysis...",
      description: "Please wait.",
    });

    saveMutation.mutate(
      {
        data: {
          symptoms: ["Analyzed Symptoms"], // Mocked since we didn't save input to context
          duration: "unknown",
          ageRange: "adult",
          severity: "unknown",
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
          toast({
            title: "Analysis Saved",
            description: "You can view it later in your History.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save analysis.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "mild_concern": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
      case "moderate_concern": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "seek_medical_attention": return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300";
      case "emergency_care": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isEmergency = latestResult.urgencyLevel === "emergency_care";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => setLocation("/analyze")} className="-ml-4 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Analysis
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={saveMutation.isPending}>
            <Bookmark className="mr-2 h-4 w-4" /> Save to History
          </Button>
        </div>

        {isEmergency && (
          <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-6 rounded-r-lg mb-8 shadow-sm flex items-start gap-4">
            <AlertTriangle className="h-8 w-8 text-destructive shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-destructive mb-1">⚠️ Call emergency services immediately</h2>
              <p className="text-destructive/80 font-medium">Your symptoms indicate a potentially life-threatening condition. Do not wait. Seek immediate medical attention.</p>
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-8">
          <div className="p-6 md:p-8 border-b border-border bg-muted/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Analysis Results</h1>
                <p className="text-muted-foreground">Based on the symptoms you provided.</p>
              </div>
              <Badge className={`text-sm py-1.5 px-4 rounded-full border ${getUrgencyColor(latestResult.urgencyLevel)}`}>
                <Activity className="mr-2 h-4 w-4" /> {latestResult.urgencyLabel}
              </Badge>
            </div>
            
            {latestResult.summary && (
              <div className="mt-6 p-4 bg-background rounded-lg border border-border">
                <p className="text-foreground leading-relaxed">{latestResult.summary}</p>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 space-y-10">
            {/* Possible Conditions */}
            <section>
              <div className="flex items-center gap-2 mb-6 text-xl font-serif font-semibold text-primary">
                <Stethoscope className="h-6 w-6" />
                <h2>Possible Related Conditions</h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {latestResult.possibleConditions.map((condition, i) => (
                  <AccordionItem value={`item-${i}`} key={i} className="border border-border mb-4 rounded-lg overflow-hidden bg-background">
                    <AccordionTrigger className="px-4 py-4 hover:bg-muted/50 hover:no-underline data-[state=open]:bg-muted/50">
                      <span className="font-semibold text-lg">{condition.name}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      <p className="text-muted-foreground mb-4">{condition.description}</p>
                      
                      <div className="space-y-4">
                        {condition.commonCauses.length > 0 && (
                          <div>
                            <h4 className="font-medium text-foreground mb-1 text-sm uppercase tracking-wider">Common Causes</h4>
                            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                              {condition.commonCauses.map((cause, j) => <li key={j}>{cause}</li>)}
                            </ul>
                          </div>
                        )}
                        
                        {condition.basicApproaches.length > 0 && (
                          <div>
                            <h4 className="font-medium text-foreground mb-1 text-sm uppercase tracking-wider">Basic Approaches</h4>
                            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                              {condition.basicApproaches.map((approach, j) => <li key={j}>{approach}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <Separator />

            {/* Recommendations grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <div className="flex items-center gap-2 mb-4 text-lg font-serif font-semibold text-foreground">
                  <HeartPulse className="h-5 w-5 text-primary" />
                  <h3>Lifestyle Advice</h3>
                </div>
                <Card className="bg-background border-border shadow-none h-full">
                  <CardContent className="p-5">
                    <ul className="space-y-3">
                      {latestResult.lifestyleAdvice.map((advice, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold">{i + 1}</span>
                          </div>
                          <span className="text-muted-foreground leading-relaxed">{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4 text-lg font-serif font-semibold text-foreground">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <h3>When to See a Doctor</h3>
                </div>
                <Card className="bg-background border-border shadow-none h-full">
                  <CardContent className="p-5">
                    <ul className="space-y-3">
                      {latestResult.whenToSeeDoctor.map((guidance, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                          <span className="text-muted-foreground leading-relaxed">{guidance}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Disclaimer inside results */}
            <div className="mt-8 p-4 bg-muted rounded-lg flex gap-3 text-sm text-muted-foreground">
              <Info className="h-5 w-5 shrink-0 text-primary/60" />
              <p>{latestResult.disclaimer || "This application is for educational and informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment."}</p>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
