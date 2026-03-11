import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/app");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/app");
      }
      if (event === "USER_UPDATED") {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            navigate("/app");
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background styling elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px] -z-10" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        <Card className="border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl mb-4">
              P
            </div>
            <CardTitle className="text-2xl font-heading font-bold">Welcome to Project Pulse</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Sign in or create an account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(var(--primary))',
                      brandAccent: 'hsl(var(--primary) / 0.8)',
                      brandButtonText: 'hsl(var(--primary-foreground))',
                      defaultButtonBackground: 'hsl(var(--secondary))',
                      defaultButtonBackgroundHover: 'hsl(var(--secondary) / 0.8)',
                      inputBackground: 'hsl(var(--background))',
                      inputBorder: 'hsl(var(--border))',
                      inputBorderHover: 'hsl(var(--primary))',
                      inputBorderFocus: 'hsl(var(--ring))',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '0.5rem',
                      buttonBorderRadius: '0.5rem',
                      inputBorderRadius: '0.5rem',
                    },
                  },
                },
                className: {
                  container: 'auth-container',
                  button: 'auth-button font-medium shadow-sm transition-all',
                  input: 'auth-input font-medium',
                  label: 'auth-label font-medium text-muted-foreground',
                  divider: 'auth-divider',
                  message: 'auth-message text-sm',
                },
              }}
              providers={['google', 'github']}
              redirectTo={`${window.location.origin}/app`}
              view="sign_in"
              showLinks={true}
            />
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
