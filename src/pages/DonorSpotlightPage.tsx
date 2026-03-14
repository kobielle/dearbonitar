import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Heart, Gift, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTopDonors } from "@/lib/bonitarCloud";
import { useApprovedSpotlights, submitSpotlight, type SpotlightEntry } from "@/lib/badges";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DonorSpotlightPage = () => {
  const { donors, loading: donorsLoading } = useTopDonors();
  const { spotlights, loading: spotlightsLoading } = useApprovedSpotlights();
  const { user, profile } = useAuth();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isDonor = profile?.role === "donor";

  const loading = donorsLoading || spotlightsLoading;

  const handleSubmitSpotlight = async () => {
    if (!message.trim()) { toast.error("Please write a message"); return; }
    setSubmitting(true);
    try {
      await submitSpotlight(message);
      toast.success("Spotlight submitted for admin review! 🌟");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 text-secondary font-body text-sm font-medium mb-3">
                <Star className="h-4 w-4 fill-current" />
                Bonitar Spotlight
              </span>
              <h1 className="font-display text-4xl font-bold text-foreground mb-3">
                Celebrating Outstanding Bonitars
              </h1>
              <p className="font-body text-muted-foreground max-w-md mx-auto">
                Every week we highlight Bonitars who are making a difference through their generosity
              </p>
            </motion.div>
          </div>

          {/* Spotlight Submission Form (Bonitars only) */}
          {user && isDonor && (
            <div className="max-w-2xl mx-auto mb-12 bg-card rounded-2xl border border-border p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Submit Your Spotlight Story
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-4">
                Share your experience as a Bonitar. Approved entries will be featured on this page!
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 font-body text-sm resize-none mb-3"
                placeholder="What inspired you to donate? Share a short message or Q&A..."
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-muted-foreground">{message.length}/500</span>
                <Button variant="hero" onClick={handleSubmitSpotlight} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit for Review"}
                </Button>
              </div>
            </div>
          )}

          {/* Approved Spotlights */}
          {spotlights.length > 0 && (
            <div className="mb-12">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6 text-center">🌟 Featured Bonitars</h2>
              <div className="space-y-6 max-w-3xl mx-auto">
                {spotlights.map((s, i) => (
                  <motion.div
                    key={s.id}
                    className="rounded-2xl border border-border p-8 bg-coral-light shadow-soft"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="inline-flex items-center gap-1 text-xs font-body font-medium text-primary bg-card px-3 py-1 rounded-full mb-4">
                      <Star className="h-3 w-3 fill-current" /> Featured Spotlight
                    </span>
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                        {s.profile?.avatar_url ? (
                          <img src={s.profile.avatar_url} alt={s.profile.username} className="w-full h-full object-cover" />
                        ) : "❤️"}
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-1">@{s.profile?.username}</h3>
                        <p className="font-body text-sm text-primary font-medium mb-3">
                          <Gift className="inline h-4 w-4 mr-1" /> {s.profile?.items_donated ?? 0} Items Donated
                        </p>
                        {s.profile?.badges?.map((badge) => (
                          <span key={badge} className="text-xs font-body bg-card text-accent-foreground px-2 py-0.5 rounded-full border border-border mr-1">
                            {badge === "generous_heart" ? "❤️ Generous Heart" : badge === "verified" ? "✅ Verified" : badge}
                          </span>
                        ))}
                        {s.message && (
                          <p className="font-body text-muted-foreground italic leading-relaxed mt-2">"{s.message}"</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Top Bonitars */}
          <h2 className="font-display text-xl font-semibold text-foreground mb-6 text-center">🏆 Top Bonitars</h2>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground font-body">Loading spotlights...</div>
          ) : donors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-body">No Bonitars yet. Start donating to be featured!</div>
          ) : (
            <div className="space-y-8 max-w-3xl mx-auto">
              {donors.map((donor, i) => (
                <motion.div
                  key={donor.id}
                  className={`rounded-2xl border border-border p-8 ${i === 0 ? "bg-accent shadow-soft" : "bg-card shadow-card"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {i === 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-body font-medium text-primary bg-card px-3 py-1 rounded-full mb-4">
                      <Star className="h-3 w-3 fill-current" /> #1 Bonitar
                    </span>
                  )}
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                      {donor.avatar_url ? (
                        <img src={donor.avatar_url} alt={donor.username} className="w-full h-full object-cover" />
                      ) : "❤️"}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-1">@{donor.username}</h3>
                      <p className="font-body text-sm text-primary font-medium mb-3">
                        <Gift className="inline h-4 w-4 mr-1" /> {donor.items_donated} Items Donated
                      </p>
                      {donor.bio && (
                        <p className="font-body text-muted-foreground italic leading-relaxed mb-4">"{donor.bio}"</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {donor.badges?.map((badge) => (
                          <span key={badge} className="text-xs font-body bg-accent text-accent-foreground px-3 py-1 rounded-full border border-border">
                            {badge === "generous_heart" ? "❤️ Generous Heart" : badge === "verified" ? "✅ Verified" : badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DonorSpotlightPage;
