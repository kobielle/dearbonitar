import { useEffect, useState, useRef } from "react";
import { Shield, Upload, CheckCircle, Clock, XCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useVideoVerification } from "@/lib/verification";
import { toast } from "sonner";

const VerificationPage = () => {
  const { user, profile } = useAuth();
  const { verification, loading, fetchStatus, submitVideo } = useVideoVerification();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchStatus(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large. Max 50MB.");
      return;
    }
    setUploading(true);
    try {
      await submitVideo(file);
      toast.success("Video submitted for review!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
    pending: { icon: Clock, label: "Under Review", color: "text-secondary" },
    approved: { icon: CheckCircle, label: "Verified ✅", color: "text-green-600" },
    rejected: { icon: XCircle, label: "Rejected", color: "text-destructive" },
  };

  const current = verification ? statusConfig[verification.status] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Identity Verification</h1>
            <p className="font-body text-muted-foreground">
              Record a short video saying your name and showing your NIN card to verify your identity.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
            {/* NIN Status */}
            <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-accent">
              <Shield className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-body text-sm font-medium text-foreground">
                  NIN Verified: {profile?.nin_verified ? "✅ Yes" : "❌ Not yet"}
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Your NIN is checked during video verification.
                </p>
              </div>
            </div>

            {/* Video Status */}
            {verification ? (
              <div className="text-center py-6">
                {current && (
                  <>
                    <current.icon className={`h-10 w-10 mx-auto mb-3 ${current.color}`} />
                    <p className={`font-display text-lg font-semibold ${current.color}`}>{current.label}</p>
                    {verification.reviewer_notes && (
                      <p className="font-body text-sm text-muted-foreground mt-2">
                        Note: {verification.reviewer_notes}
                      </p>
                    )}
                    {verification.status === "rejected" && (
                      <Button
                        variant="hero"
                        className="mt-4"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload className="h-4 w-4" />
                        {uploading ? "Uploading..." : "Re-submit Video"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="font-body text-sm text-muted-foreground mb-6">
                  No video submitted yet. Please record a short video (under 60 seconds) clearly showing your face and NIN card.
                </p>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload Verification Video"}
                </Button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleUpload}
            />

            <div className="mt-6 p-4 bg-accent rounded-lg">
              <h3 className="font-body text-sm font-medium text-foreground mb-2">⚠️ Safety Tips</h3>
              <ul className="font-body text-xs text-muted-foreground space-y-1">
                <li>• Your video is stored securely and only reviewed by admins.</li>
                <li>• Your NIN is never shared publicly.</li>
                <li>• Verified accounts earn the ✅ Verified Bonitar badge.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerificationPage;
