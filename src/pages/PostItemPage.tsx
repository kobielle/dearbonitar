import { useMemo, useState } from "react";
import { Camera, MapPin, Tag, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { postItem, uploadItemImage } from "@/lib/bonitarCloud";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ITEM_CATEGORIES, NIGERIA_LOCATION_OPTIONS } from "@/lib/marketplace";

const PostItemPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [areaValue, setAreaValue] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [medicineUsage, setMedicineUsage] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const stateOptions = useMemo(() => Object.keys(NIGERIA_LOCATION_OPTIONS), []);
  const areaOptions = stateValue ? NIGERIA_LOCATION_OPTIONS[stateValue] ?? [] : [];
  const isMedication = category === "Medication";

  const handleFileChange = (index: number, file: File | null) => {
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (!stateValue || !areaValue) {
      toast.error("Please select state and area");
      return;
    }

    if (isMedication) {
      if (!medicineName.trim() || !description.trim() || !medicineUsage.trim() || !expirationDate) {
        toast.error("Medication requires medicine name, description, usage, and expiration date");
        return;
      }

      if (new Date(expirationDate) <= new Date()) {
        toast.error("Expired medication is not allowed");
        return;
      }
    }

    const validFiles = files.filter(Boolean) as File[];
    if (validFiles.length < 3) {
      toast.error("Please upload at least 3 photos");
      return;
    }

    setLoading(true);

    try {
      const item = await postItem({
        title,
        description,
        category,
        pickup_location: location,
        state: stateValue,
        area: areaValue,
        medicine_name: isMedication ? medicineName : undefined,
        medicine_usage: isMedication ? medicineUsage : undefined,
        expiration_date: isMedication ? expirationDate : undefined,
      });

      const imageUrls = await Promise.all(validFiles.map((file) => uploadItemImage(file, item.id)));

      const { supabase } = await import("@/integrations/supabase/client");
      await (supabase as any).from("items").update({ image_urls: imageUrls }).eq("id", item.id);

      toast.success("Donation posted!");
      navigate("/feed");
    } catch (err: any) {
      console.error("[post-item] create failed", err);
      toast.error(err.message || "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Post a Donation</h1>
          <p className="font-body text-muted-foreground mb-8">Share something you no longer need with your community</p>

          <form className="space-y-6 bg-card rounded-2xl p-8 shadow-card border border-border" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">
                <Tag className="inline h-4 w-4 mr-1" /> Item Title
              </label>
              <Input
                placeholder="What are you donating?"
                className="font-body"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">
                <FileText className="inline h-4 w-4 mr-1" /> Description
              </label>
              <Textarea
                placeholder="Describe the condition, size, and any other details..."
                className="min-h-[100px] font-body resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ITEM_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-2 rounded-lg text-xs font-body transition-colors ${
                      category === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "text-muted-foreground border border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {isMedication && (
              <div className="space-y-4 rounded-xl border border-secondary/30 bg-secondary/10 p-4">
                <p className="font-body text-sm text-foreground">
                  <strong>Do NOT donate hard drugs, expired medicine, or harmful substances.</strong>
                </p>

                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Medicine Name</label>
                  <Input
                    placeholder="e.g. Paracetamol 500mg"
                    className="font-body"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1.5 block">What it is used for</label>
                  <Textarea
                    placeholder="Describe what this medicine is used for"
                    className="min-h-[80px] font-body resize-none"
                    value={medicineUsage}
                    onChange={(e) => setMedicineUsage(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Expiration Date</label>
                  <Input
                    type="date"
                    className="font-body"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">
                <Camera className="inline h-4 w-4 mr-1" /> Photos (min. 3)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <label
                    key={i}
                    className="aspect-square rounded-xl border-2 border-dashed border-border bg-accent flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                  >
                    {files[i] ? (
                      <img src={URL.createObjectURL(files[i]!)} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <>
                        <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground font-body">Photo {i + 1}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1.5 block">State</label>
                <select
                  value={stateValue}
                  onChange={(e) => {
                    setStateValue(e.target.value);
                    setAreaValue("");
                  }}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-body text-foreground"
                >
                  <option value="">Select State</option>
                  {stateOptions.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Area</label>
                <select
                  value={areaValue}
                  onChange={(e) => setAreaValue(e.target.value)}
                  disabled={!stateValue}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-body text-foreground disabled:opacity-60"
                >
                  <option value="">Select Area</option>
                  {areaOptions.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground mb-1.5 block">
                <MapPin className="inline h-4 w-4 mr-1" /> Pickup Location (public places only)
              </label>
              <Input
                placeholder="e.g. Church of Grace, Bus Stop near Market..."
                className="font-body"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <p className="text-xs text-muted-foreground font-body mt-1">
                Churches, schools, bus stops, shopping plazas, or markets only
              </p>
            </div>

            <div className="bg-accent rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
              <p className="text-xs font-body text-muted-foreground">
                Prohibited items: sand, rags, trash, dangerous materials, or broken unusable items. Violations may
                result in account restriction.
              </p>
            </div>

            <Button variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? "Posting..." : "Post Donation"}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PostItemPage;