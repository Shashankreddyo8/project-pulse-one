import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Successfully signed out");
      navigate("/");
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-muted-foreground">Not authenticated</div>;
  }

  const emailUser = user.email?.split("@")[0] || "User";
  const initials = emailUser.substring(0, 2).toUpperCase();
  const provider = user.app_metadata?.provider || "Email";

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Your Profile" 
        description="Manage your account settings and preferences" 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4 border-4 border-background shadow-xl">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-heading text-xl font-bold">{user.user_metadata?.full_name || emailUser}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              
              <div className="mt-6 w-full flex flex-col gap-2">
                <Button variant="outline" className="w-full justify-start text-muted-foreground">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Settings
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start mt-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
              <CardDescription>Personal information associated with your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name / Display Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9" 
                      readOnly 
                      value={user.user_metadata?.full_name || emailUser} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9" 
                      readOnly 
                      value={user.email || ""} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/40 mt-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Authentication Provider</Label>
                  <p className="font-medium capitalize">{provider}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Account ID</Label>
                  <p className="font-mono text-xs truncate text-muted-foreground">{user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
