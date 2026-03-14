import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Dear Bonitar" className="h-10 w-10" />
              <span className="font-display text-2xl font-bold">
                Dear <span className="text-primary">Bonitar</span>
              </span>
            </div>
            <p className="font-body text-background/70 max-w-md leading-relaxed">
              Dear Bonitar is powered by people who believe kindness should travel freely.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold mb-4 text-primary">Platform</h4>
            <div className="space-y-2">
              {[
                { to: "/feed", label: "Browse Items" },
                { to: "/post-item", label: "Donate an Item" },
                { to: "/journal", label: "Journal" },
                { to: "/spotlight", label: "Bonitar Spotlight" },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="block text-sm text-background/60 hover:text-primary transition-colors font-body">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold mb-4 text-primary">Company</h4>
            <div className="space-y-2">
              {[
                { to: "/guidelines", label: "Community Guidelines" },
                { to: "/advertise", label: "Advertise" },
                { to: "/support", label: "Support the Movement" },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="block text-sm text-background/60 hover:text-primary transition-colors font-body">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50 font-body">
            © {new Date().getFullYear()} Dear Bonitar. Kindness, always.
          </p>
          <div className="flex items-center gap-1 text-sm text-background/50 font-body">
            Made with <Heart className="h-3 w-3 text-primary fill-primary" /> by Bonitars
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
