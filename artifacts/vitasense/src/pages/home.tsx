import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Activity, HeartPulse, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-36 md:pb-48 overflow-hidden flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,var(--primary)/3%,transparent_50%)]" />
        
        <motion.div 
          className="relative z-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Your Private AI Health Companion
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-tight tracking-tight mb-8">
            Understand your body with <span className="text-primary italic">serene confidence.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Describe your symptoms. Get clear, educational insights instantly. No alarmist medical jargon, just calm understanding.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/analyze">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                Analyze Symptoms <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/chatbot">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full">
                Chat with VitaSense
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card px-4 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our advanced AI processes your symptoms against vast medical knowledge to provide educational context.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background/50 border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="h-16 w-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <Activity className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">1. Describe Symptoms</h3>
                <p className="text-muted-foreground">
                  Tell us what you're feeling in your own words, including duration and severity.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="h-16 w-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <HeartPulse className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">2. AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our system evaluates your input to find possible related conditions and context.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="h-16 w-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">3. Get Guidance</h3>
                <p className="text-muted-foreground">
                  Receive educational insights, lifestyle tips, and advice on when to consult a doctor.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-16 bg-muted/50 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ShieldCheck className="h-10 w-10 text-primary/60 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Important Medical Disclaimer</h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto">
            This application is for educational and informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
        </div>
      </section>
    </div>
  );
}
