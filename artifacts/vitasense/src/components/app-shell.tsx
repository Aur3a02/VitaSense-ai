import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useTheme } from "@/components/theme-provider";
import {
  LayoutDashboard, Activity, History, MessageSquare, MapPin, Lightbulb,
  ClipboardCheck, Settings, LogOut, Moon, Sun, Menu, HeartPulse, X, User, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AppShellProps {
  children: ReactNode;
}

const MAIN_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/analyze", label: "My Analyses", icon: Activity },
  { href: "/nearby", label: "Nearby Clinics", icon: MapPin },
  { href: "/health-tips", label: "Health Tips", icon: Lightbulb },
  { href: "/weekly-checkup", label: "Weekly Check-up", icon: ClipboardCheck },
  { href: "/chatbot", label: "AI Assistant", icon: MessageSquare },
  { href: "/history", label: "History", icon: History },
];

const ACCOUNT_NAV = [
  { href: "/profile", label: "Settings", icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "User"
    : "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border/40">
        <HeartPulse className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg text-foreground">VitaSense</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-2">MAIN</p>
        {MAIN_NAV.map((item) => {
          const active = location === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </div>
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-2">ACCOUNT</p>
          {ACCOUNT_NAV.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-border/40">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "User"
    : "User";
  const plan = "Free Plan";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-border/40 bg-background shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:ml-56">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-4 md:px-6 border-b border-border/40 bg-background/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-56">
                <SidebarContent onClose={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")} className="rounded-full">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 pl-2 border-l border-border/40">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{plan}</p>
              </div>
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} className="h-8 w-8 rounded-full object-cover" alt={displayName} />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {initials || <User className="h-4 w-4" />}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
