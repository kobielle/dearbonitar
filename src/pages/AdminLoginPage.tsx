import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ADMIN_DASHBOARD_PATH = "/control-room-b0n1t4r-x9k2";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (attempts >= 5) {
      toast.error("Too many login attempts. Please try again later.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);

      // Check admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login failed");

      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (!isAdmin) {
        await supabase.auth.signOut();
        setAttempts((p) => p + 1);
        toast.error("Access denied. Admin credentials required.");
        return;
      }

      toast.success("Welcome, Admin!");
      navigate(ADMIN_DASHBOARD_PATH);
    } catch (err: any) {
      setAttempts((p) => p + 1);
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Access</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Authorized personnel only</p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="admin@email.com" className="pl-10 font-body" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 font-body" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {attempts >= 3 && (
              <p className="text-xs font-body text-destructive">
                {5 - attempts} attempt{5 - attempts !== 1 ? "s" : ""} remaining before lockout.
              </p>
            )}

            <Button variant="default" size="lg" className="w-full" disabled={loading || attempts >= 5}>
              <Shield className="h-4 w-4 mr-2" />
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs font-body text-muted-foreground mt-6">
          This area is monitored. Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
