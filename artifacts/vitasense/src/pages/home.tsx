import { Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, HeartPulse, ShieldCheck, Lock, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { isAuthenticated, login } = useAuth();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <HeartPulse className="h-5 w-5" />
            <span className="font-bold text-lg">VitaSense AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#ai" className="hover:text-foreground transition-colors">Our AI</a>
            <a href="#features" className="hover:text-foreground transition-colors">Providers</a>
            <a href="#faq" className="hover:text-foreground transition-colors">About Us</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")} className="rounded-full">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <Button variant="ghost" size="sm" onClick={login}>Log In</Button>
            )}
            <Button size="sm" className="rounded-full" onClick={isAuthenticated ? undefined : login}>
              {isAuthenticated ? <Link href="/dashboard">Get Started</Link> : "Get Started"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
          {/* Left */}
          <motion.div
            className="flex-1 max-w-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary border border-primary/30 bg-primary/5 rounded-full px-3 py-1 mb-6">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Now available for everyone
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight mb-4">
              Understand<br />
              Your Symptoms<br />
              <span className="text-primary">Smarter</span>
            </h1>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Get clear, accurate, and educational health guidance instantly.
              Powered by advanced AI, designed with the care of a trusted medical professional.
            </p>

            <div className="flex items-center gap-3">
              <Button
                size="lg"
                className="rounded-full h-12 px-7 text-base shadow-md hover:shadow-lg transition-shadow"
                onClick={isAuthenticated ? undefined : login}
              >
                {isAuthenticated ? (
                  <Link href="/analyze" className="flex items-center gap-2">Analyze Symptoms <ChevronRight className="h-4 w-4" /></Link>
                ) : (
                  <span className="flex items-center gap-2">Analyze Symptoms <ChevronRight className="h-4 w-4" /></span>
                )}
              </Button>
              <Button variant="outline" size="lg" className="rounded-full h-12 px-7 text-base">
                Learn More
              </Button>
            </div>

            <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> HIPAA Compliant</span>
              <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-primary" /> 256-bit Encryption</span>
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-primary" /> Medical Review Board</span>
            </div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative w-80 h-72 md:w-96 md:h-80">
              {/* Card with heartbeat + stethoscope visual */}
              <div className="absolute inset-0 bg-card border border-border rounded-3xl shadow-xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  {/* ECG line SVG */}
                  <svg viewBox="0 0 300 80" className="w-64 h-16" fill="none">
                    <path
                      d="M0 40 L50 40 L60 40 L65 10 L70 70 L75 10 L80 70 L85 40 L100 40 L120 40 L125 5 L130 75 L135 5 L140 75 L145 40 L300 40"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-sm"
                    />
                  </svg>
                  {/* Stethoscope icon */}
                  <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <HeartPulse className="h-12 w-12 text-primary" />
                  </div>
                </div>
              </div>
              {/* Decorative ECG lines */}
              <svg className="absolute -bottom-8 -left-8 w-32 h-16 opacity-20 rotate-6" viewBox="0 0 200 60" fill="none">
                <path d="M0 30 L40 30 L50 5 L60 55 L70 5 L80 55 L90 30 L200 30" stroke="hsl(var(--primary))" strokeWidth="2" />
              </svg>
              <svg className="absolute -top-6 -right-6 w-24 h-12 opacity-20 -rotate-12" viewBox="0 0 200 60" fill="none">
                <path d="M0 30 L40 30 L50 5 L60 55 L70 5 L80 55 L90 30 L200 30" stroke="hsl(var(--primary))" strokeWidth="2" />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="how" className="bg-muted/30 border-t border-border/40 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">How VitaSense Works</h2>
            <p className="text-muted-foreground mt-2">Three simple steps to understand your health better</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Describe Your Symptoms", body: "Select from common symptoms or type your own. Add duration and severity for more accurate results.", icon: "🩺" },
              { step: "02", title: "AI-Powered Analysis", body: "Our AI evaluates your symptoms and provides a ranked list of possible conditions with likelihood percentages.", icon: "🤖" },
              { step: "03", title: "Get Personalised Guidance", body: "Receive educational insights, lifestyle tips, and directions to nearby healthcare if needed.", icon: "📋" },
            ].map((item) => (
              <div key={item.step} className="bg-card rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold text-primary/60 mb-1">{item.step}</div>
                <h3 className="font-bold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="ai" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-10">Trusted by thousands</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Sarah K.", quote: "VitaSense helped me understand my symptoms before my doctor's appointment. Clear, educational and reassuring.", rating: 5 },
              { name: "James O.", quote: "The AI analysis is surprisingly accurate and the nearby clinic finder saved me time during an urgent situation.", rating: 5 },
              { name: "Amara L.", quote: "I love that it stores my blood group and allergies. The weekly wellness check helps me track my health over time.", rating: 5 },
            ].map((t) => (
              <div key={t.name} className="bg-card rounded-2xl border border-border p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <p className="font-semibold text-sm text-foreground">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start understanding your health today</h2>
          <p className="opacity-80 mb-8">Free to use. No credit card required. Sign in with Replit to get started.</p>
          <Button
            size="lg"
            variant="secondary"
            className="rounded-full h-12 px-8 text-base"
            onClick={login}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 text-primary">
            <HeartPulse className="h-4 w-4" />
            <span className="font-semibold">VitaSense AI</span>
          </div>
          <p className="text-center text-xs max-w-xl">
            For educational and informational purposes only. Not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
          </p>
          <p>© {new Date().getFullYear()} VitaSense AI</p>
        </div>
      </footer>
    </div>
  );
}
