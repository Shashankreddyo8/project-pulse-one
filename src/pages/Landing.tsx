import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, UserPlus, LayoutDashboard, LogOut, Activity, FileText, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 font-body">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-xl sticky top-0 z-50 bg-background/70">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
              P
            </div>
            <span className="font-heading font-semibold text-xl tracking-tight text-white">Project Pulse</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
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
                  variant="ghost" 
                  className="gap-2 font-medium text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="hidden sm:block">
                  <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                    Start Free Analysis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
          
          <Badge variant="outline" className="mb-8 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-sm font-medium rounded-full">
            Project Pulse 2.0 is now live
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight mb-8 max-w-4xl leading-[1.1] text-white">
            Know the real health of your project — <span className="text-primary">instantly.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
            Paste a project link and let AI analyze activity, documentation, and updates to reveal hidden risks before they become problems.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px-8 text-base shadow-xl shadow-primary/25 rounded-xl">
                Start Free Analysis
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base bg-transparent border-border hover:bg-white/5 rounded-xl">
              View Demo
            </Button>
          </div>

          {/* Hero Visual Mock */}
          <div className="mt-20 w-full max-w-5xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <div className="relative rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-2 shadow-2xl">
              <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
                <div className="h-10 border-b border-border/50 flex items-center px-4 gap-2 bg-muted/30">
                  <div className="w-3 h-3 rounded-full bg-destructive/80" />
                  <div className="w-3 h-3 rounded-full bg-warning/80" />
                  <div className="w-3 h-3 rounded-full bg-success/80" />
                </div>
                <div className="p-8 grid md:grid-cols-3 gap-6 opacity-80">
                  <div className="col-span-2 space-y-4">
                    <div className="h-8 w-48 bg-muted rounded-md" />
                    <div className="h-64 bg-muted/50 rounded-lg w-full" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-32 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                       <span className="text-4xl font-bold text-primary">84</span>
                    </div>
                    <div className="h-24 bg-warning/10 border border-warning/20 rounded-lg" />
                    <div className="h-24 bg-destructive/10 border border-destructive/20 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 border-y border-border/40 bg-muted/10">
          <div className="container mx-auto px-6 text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8">
              Trusted by modern engineering teams
            </p>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
              <span className="text-xl font-bold font-heading">Acme Corp</span>
              <span className="text-xl font-bold font-heading tracking-tighter">GlobalTech</span>
              <span className="text-xl font-bold font-heading italic">Nexus</span>
              <span className="text-xl font-bold font-heading">Stark Ind.</span>
              <span className="text-xl font-bold font-heading tracking-widest">AERIS</span>
            </div>
          </div>
        </section>

        {/* How It Works (Bento Box) */}
        <section className="py-32 px-6 container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-white">How it works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Get an accurate pulse check of any project in four simple steps without writing a single line of code.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { step: "Step 1", title: "Paste Project Links", desc: "Drop your GitHub repo, docs, or changelog URLs into the platform.", icon: <FileText className="w-6 h-6 text-primary" /> },
              { step: "Step 2", title: "Pulse Scans Pages", desc: "Our engine instantly parses the provided pages for public signals.", icon: <Activity className="w-6 h-6 text-secondary" /> },
              { step: "Step 3", title: "AI Analyzes Signals", desc: "Proprietary AI evaluates commits, release cadence, and issue freshness.", icon: <CheckCircle className="w-6 h-6 text-success" /> },
              { step: "Step 4", title: "Score & Insights", desc: "Receive a definitive Health Score and actionable risk mitigations.", icon: <TrendingUp className="w-6 h-6 text-warning" /> }
            ].map((item, i) => (
              <Card key={i} className="bg-card/50 border-border/50 hover:bg-card hover:border-border transition-colors">
                <CardHeader>
                  <div className="mb-4">
                    <span className="text-sm font-medium text-muted-foreground">{item.step}</span>
                  </div>
                  <div className="mb-4 p-3 bg-muted w-fit rounded-lg">
                    {item.icon}
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 border-t border-border/40 relative">
          <div className="container mx-auto max-w-6xl space-y-32">
            
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-3xl font-heading font-bold mb-6 text-white">Link-Based Project Analysis</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  No complex integrations required. Users simply paste a link and the system scans the page for vital signs. Support for GitHub, public documentation, and changelogs.
                </p>
                <ul className="space-y-4">
                  {['Instant data extraction', 'No webhooks needed', 'Supports open source projects'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-2xl" />
                <div className="relative bg-card border border-border/50 rounded-2xl p-6 shadow-2xl">
                  <div className="space-y-4">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-12 bg-background border border-border rounded-lg flex items-center px-4">
                      <span className="text-muted-foreground">https://github.com/organization/repo</span>
                    </div>
                    <Button className="w-full">Analyze Project</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Reverse */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1 relative">
                 <div className="absolute inset-0 bg-warning/5 rounded-2xl blur-2xl" />
                <div className="relative bg-card border border-border/50 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-success" strokeDasharray="283" strokeDashoffset="45" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-bold text-success">84</span>
                      <span className="text-sm text-muted-foreground">Excellent</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-3xl font-heading font-bold mb-6 text-white">AI Health Scoring</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  AI dynamically calculates a definitive project health score utilizing the extracted signals. It looks beyond simple activity graphs to understand context and sentiment.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-3xl font-heading font-bold mb-6 text-white">Smart Risk Detection</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Detect early warning signs such as declining commit activity, growing issue backlogs, or outdated documentation before they stall your project.
                </p>
              </div>
              <div className="relative">
                 <div className="absolute inset-0 bg-destructive/5 rounded-2xl blur-2xl" />
                <div className="relative space-y-4">
                  <div className="bg-card border border-warning/30 rounded-xl p-4 flex gap-4 shadow-lg items-start">
                    <AlertTriangle className="w-6 h-6 text-warning shrink-0" />
                    <div>
                      <h4 className="font-medium text-white">Warning: Documentation Stale</h4>
                      <p className="text-sm text-muted-foreground mt-1">Readme hasn't been updated in 45 days despite major new releases.</p>
                    </div>
                  </div>
                  <div className="bg-card border border-destructive/30 rounded-xl p-4 flex gap-4 shadow-lg items-start">
                    <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
                    <div>
                      <h4 className="font-medium text-white">Critical: PR Velocity Dropping</h4>
                      <p className="text-sm text-muted-foreground mt-1">Merge times have increased by 400% over the last two weeks.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 bg-muted/5 border-t border-border/40">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-white">Simple, transparent pricing</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Free Tier */}
              <Card className="flex flex-col bg-card/40 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="text-xl">Free</CardTitle>
                  <CardDescription>Perfect for trial</CardDescription>
                  <div className="mt-4 flex items-baseline text-4xl font-bold text-white">
                    $0
                    <span className="text-sm font-normal text-muted-foreground ml-1">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {["5 projects", "Basic analysis", "Community Support"].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/auth" className="w-full">
                    <Button variant="outline" className="w-full">Start Free</Button>
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
                  <CardDescription>For professionals</CardDescription>
                  <div className="mt-4 flex items-baseline text-4xl font-bold text-white">
                    $29
                    <span className="text-sm font-normal text-muted-foreground ml-1">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {["Unlimited projects", "Advanced AI insights", "Trend analytics", "Priority Support"].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/auth" className="w-full">
                    <Button className="w-full shadow-lg shadow-primary/20">Upgrade to Pro</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Enterprise Tier */}
              <Card className="flex flex-col bg-card/40 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <CardDescription>Custom limits</CardDescription>
                  <div className="mt-4 flex items-baseline text-4xl font-bold text-white">
                    Custom
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {["Everything in Pro", "Custom integrations", "Priority analysis", "Dedicated Support"].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full focus:ring-0">Contact Sales</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 text-center border-t border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-white">
              Understand your project health before problems appear.
            </h2>
            <Link to="/auth">
              <Button size="lg" className="h-14 px-10 text-lg shadow-xl shadow-primary/20 rounded-xl">
                Start Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-background">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">P</div>
               <span className="font-heading font-semibold text-lg text-white">Project Pulse</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The modern standard for continuous project health monitoring and AI-driven insights.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Docs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Sales</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© 2026 Project Pulse. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

