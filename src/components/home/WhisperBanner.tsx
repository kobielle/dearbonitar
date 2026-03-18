import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";

const FALLBACK_WHISPERS = [
  "Kindness is free. Spread it everywhere. 💛",
  "One person's extra is another person's blessing.",
  "Give what you can, take only what you need.",
  "Every small act of generosity changes a life.",
];

const WhisperBanner = () => {
  const [whisper, setWhisper] = useState<string | null>(null);

  useEffect(() => {
    const fetchWhisper = async () => {
      const { data, error } = await (supabase as any)
        .from("whispers")
        .select("message")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("[whispers] fetch failed", error);
      }

      if (data && data.length > 0) {
        setWhisper(data[0].message);
      } else {
        // Rotate fallback daily
        const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % FALLBACK_WHISPERS.length;
        setWhisper(FALLBACK_WHISPERS[dayIndex]);
      }
    };

    fetchWhisper();
  }, []);

  if (!whisper) return null;

  return (
    <div className="bg-primary/10 border-y border-primary/20 py-3">
      <div className="container mx-auto px-4 flex items-center justify-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary shrink-0" />
        <p className="font-body text-sm text-foreground italic text-center">
          "{whisper}"
        </p>
      </div>
    </div>
  );
};

export default WhisperBanner;
