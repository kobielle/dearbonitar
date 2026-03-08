import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VideoVerification {
  id: string;
  user_id: string;
  video_url: string;
  status: string;
  reviewer_notes: string | null;
  created_at: string;
}

export const useVideoVerification = () => {
  const [verification, setVerification] = useState<VideoVerification | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("video_verifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setVerification(data as VideoVerification | null);
    setLoading(false);
  };

  const submitVideo = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("verification-videos")
      .upload(path, file);
    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabase.storage
      .from("verification-videos")
      .getPublicUrl(path);

    const { error } = await supabase
      .from("video_verifications")
      .insert({
        user_id: user.id,
        video_url: urlData.publicUrl,
      });
    if (error) throw error;

    await fetchStatus();
  };

  return { verification, loading, fetchStatus, submitVideo };
};
