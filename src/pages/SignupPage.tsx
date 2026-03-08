import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, EyeOff, Mail, Lock, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"donor" | "recipient">("donor");

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="Dear Bonitar" className="h-12 w-12" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Become a Bonitar</h1>
          <p className="font-body text-muted-foreground">Join the kindness network today</p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
          <div className="flex gap-2 mb-6">
            {(["donor", "recipient"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-body font-medium transition-all ${
                  role === r
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "donor" ? "🤲 Donor" : "🙏 Recipient"}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="text" placeholder="@YourBonitarName" className="pl-10 font-body" />
              </div>
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="your@email.com" className="pl-10 font-body" />
              </div>
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters, 1 number, 1 symbol"
                  className="pl-10 pr-10 font-body"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="bg-accent rounded-lg p-3 flex items-start gap-3">
              <Shield className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
              <p className="text-xs font-body text-muted-foreground leading-relaxed">
                We verify all accounts with NIN and video verification to keep our community safe. 
                You'll complete this after signup.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="mt-1 rounded border-border accent-primary" />
              <span className="text-xs font-body text-muted-foreground">
                I agree to the{" "}
                <Link to="/guidelines" className="text-primary hover:underline">Community Guidelines</Link>
                {" "}and{" "}
                <Link to="/guidelines" className="text-primary hover:underline">Terms of Use</Link>
              </span>
            </div>

            <Button variant="hero" size="lg" className="w-full">
              <Heart className="h-4 w-4" />
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm font-body text-muted-foreground mt-6">
            Already a Bonitar?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
