import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Delivery {
  id: string;
  item_id: string;
  donor_id: string;
  recipient_id: string;
  logistics_company: string | null;
  tracking_number: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("deliveries")
        .select("*")
        .or(`donor_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      setDeliveries((data as Delivery[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { deliveries, loading };
};

export const createDelivery = async (data: {
  item_id: string;
  recipient_id: string;
  logistics_company?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: delivery, error } = await supabase
    .from("deliveries")
    .insert({
      ...data,
      donor_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return delivery;
};

export const updateDeliveryStatus = async (
  deliveryId: string,
  status: string,
  trackingNumber?: string
) => {
  const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
  if (trackingNumber) updates.tracking_number = trackingNumber;

  const { error } = await supabase
    .from("deliveries")
    .update(updates)
    .eq("id", deliveryId);

  if (error) throw error;
};
