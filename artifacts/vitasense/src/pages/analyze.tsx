import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAnalyzeSymptoms, useGetSymptomSuggestions, getGetSymptomSuggestionsQueryKey } from "@workspace/api-client-react";
import { SymptomInputDuration, SymptomInputAgeRange, SymptomInputSeverity } from "@workspace/api-client-react";
import { useAnalysis } from "@/lib/analysis-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  symptoms: z.array(z.string()).min(1, "Please enter at least one symptom"),
  duration: z.nativeEnum(SymptomInputDuration),
  ageRange: z.nativeEnum(SymptomInputAgeRange),
  severity: z.nativeEnum(SymptomInputSeverity),
  additionalNotes: z.string().optional(),
});

export default function Analyze() {
  const [location, setLocation] = useLocation();
  const { setLatestResult } = useAnalysis();
  const [symptomInput, setSymptomInput] = useState("");

  const analyzeMutation = useAnalyzeSymptoms();

  const { data: suggestionsData } = useQuery({
    queryKey: getGetSymptomSuggestionsQueryKey({ q: symptomInput }),
    queryFn: async () => {
      // Manual fetch here or use the hook properly? The hook is useGetSymptomSuggestions.
      // Actually it's easier to use the exported query options or just the hook.
      return [];
    },
    enabled: symptomInput.length > 1,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: [],
      duration: SymptomInputDuration.few_hours,
      ageRange: SymptomInputAgeRange.adult,
      severity: SymptomInputSeverity.mild,
      additionalNotes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    analyzeMutation.mutate(
      { data: values },
      {
        onSuccess: (result) => {
          setLatestResult(result);
          setLocation("/results");
        },
      }
    );
  };

  const addSymptom = (symptom: string) => {
    const current = form.getValues("symptoms");
    if (!current.includes(symptom)) {
      form.setValue("symptoms", [...current, symptom], { shouldValidate: true });
    }
    setSymptomInput("");
  };

  const removeSymptom = (symptom: string) => {
    const current = form.getValues("symptoms");
    form.setValue(
      "symptoms",
      current.filter((s) => s !== symptom),
      { shouldValidate: true }
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Understand Your Symptoms
          </h1>
          <p className="text-muted-foreground text-lg">
            Provide details about what you're experiencing, and our AI will help you understand potential causes and next steps.
          </p>
        </div>

        <div className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <FormField
                control={form.control}
                name="symptoms"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">What are your symptoms?</FormLabel>
                    <FormDescription>
                      Type a symptom and press Enter, or select from suggestions.
                    </FormDescription>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <AnimatePresence>
                          {form.watch("symptoms").map((symptom) => (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              key={symptom}
                            >
                              <Badge variant="secondary" className="pl-3 pr-1 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                                {symptom}
                                <button
                                  type="button"
                                  onClick={() => removeSymptom(symptom)}
                                  className="ml-1 p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., Headache, fever, fatigue..."
                          value={symptomInput}
                          onChange={(e) => setSymptomInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (symptomInput.trim()) {
                                addSymptom(symptomInput.trim());
                              }
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="secondary"
                          onClick={() => {
                            if (symptomInput.trim()) {
                              addSymptom(symptomInput.trim());
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How long have you had them?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={SymptomInputDuration.few_hours}>A few hours</SelectItem>
                          <SelectItem value={SymptomInputDuration.one_day}>About a day</SelectItem>
                          <SelectItem value={SymptomInputDuration.several_days}>Several days</SelectItem>
                          <SelectItem value={SymptomInputDuration.one_week_plus}>Over a week</SelectItem>
                          <SelectItem value={SymptomInputDuration.chronic}>Chronic / Ongoing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How severe are they?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={SymptomInputSeverity.mild}>Mild (Noticeable but doesn't interfere with daily life)</SelectItem>
                          <SelectItem value={SymptomInputSeverity.moderate}>Moderate (Interferes with some activities)</SelectItem>
                          <SelectItem value={SymptomInputSeverity.severe}>Severe (Prevents daily activities)</SelectItem>
                          <SelectItem value={SymptomInputSeverity.emergency}>Emergency (Unbearable / Life-threatening)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ageRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SymptomInputAgeRange.child}>Child (0-12)</SelectItem>
                        <SelectItem value={SymptomInputAgeRange.teen}>Teen (13-19)</SelectItem>
                        <SelectItem value={SymptomInputAgeRange.adult}>Adult (20-64)</SelectItem>
                        <SelectItem value={SymptomInputAgeRange.elderly}>Elderly (65+)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional context (Optional)</FormLabel>
                    <FormDescription>
                      Any medical history, recent travel, or other details you think might be relevant.
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="I recently traveled to..." 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-medium" 
                disabled={analyzeMutation.isPending}
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Symptoms
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
