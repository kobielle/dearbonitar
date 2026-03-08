import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Heart, LogOut, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, logout } = useAuth();

  const navLinks = [
    { to: "/feed", label: "Browse Items" },
    { to: "/journal", label: "Journal" },
    { to: "/spotlight", label: "Spotlight" },
    { to: "/support", label: "Support" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Dear Bonitar" className="h-9 w-9" />
          <span className="font-display text-xl font-bold text-foreground">
            Dear <span className="text-primary">Bonitar</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-body font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4 mr-1" />
                  {profile?.username || "Profile"}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/signup">
                  <Heart className="h-4 w-4" />
                  Join Bonitars
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block text-sm font-body font-medium text-muted-foreground hover:text-primary py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { logout(); setIsOpen(false); }}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login" onClick={() => setIsOpen(false)}>Log In</Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>Join Bonitars</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
