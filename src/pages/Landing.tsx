import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Landing() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Successfully signed out");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              P
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">Project Pulse</span>
          </div>
          
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link to="/app">
                  <Button variant="ghost" className="gap-2 font-medium">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="gap-2 font-medium">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="gap-2 font-medium shadow-lg shadow-primary/20">
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-24 lg:py-32 px-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px] -z-10" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] -z-10" />

          <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/10 text-primary">
            New: Enhanced AI Insights 🚀
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight mb-8 max-w-4xl leading-tight">
            The intelligent hub for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">entire workflow</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
            Project Pulse connects your favorite tools like GitHub, Slack, and Jira into a single, unified dashboard to monitor activity, find insights, and streamline development.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 text-base shadow-xl shadow-primary/25">
                Get Started for Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              View Demo
            </Button>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 px-6 bg-muted/30 border-t border-border/40">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Simple, transparent pricing</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Start for free, upgrade when you need to connect more tools and unlock advanced AI recommendations.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Tier */}
              <Card className="flex flex-col bg-card/50 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="text-xl">Hobbyist</CardTitle>
                  <CardDescription>Perfect for personal projects</CardDescription>
                  <div className="mt-4 flex items-baseline text-4xl font-bold">
                    $0
                    <span className="text-sm font-normal text-muted-foreground ml-1">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {["Up to 2 Tool Integrations", "7-day Event History", "Basic Signals", "Community Support"].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/auth" className="w-full">
                    <Button variant="outline" className="w-full">Get Started</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Pro Tier */}
              <Card className="flex flex-col relative border-primary/50 shadow-2xl shadow-primary/10 bg-card">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Pro</CardTitle>
                  <CardDescription>For growing teams and startups</CardDescription>
                  <div className="mt-4 flex items-baseline text-4xl font-bold">
                    $29
                    <span className="text-sm font-normal text-muted-foreground ml-1">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {["Unlimited Integrations", "Unlimited Event History", "Advanced AI Recommendations", "Priority Support", "Custom Dashboards"].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/auth" className="w-full">
                    <Button className="w-full">Start 14-Day Trial</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Enterprise Tier */}
              <Card className="flex flex-col bg-card/50 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <CardDescription>Advanced security and control</CardDescription>
                  <div className="mt-4 flex items-baseline text-4xl font-bold">
                    $99
                    <span className="text-sm font-normal text-muted-foreground ml-1">/user/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {["Everything in Pro", "SSO & SAML", "Dedicated Success Manager", "SLA Guarantees", "On-Premise Deployment Options"].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Project Pulse. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Inline Badge component import here to avoid path issues
import { Badge } from "@/components/ui/badge";
