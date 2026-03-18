import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
}

export function useSubscription() {
  const { user, profile } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setSubscription({
            plan: data.plan,
            status: data.status,
            currentPeriodEnd: data.current_period_end,
          });
        }
        setLoading(false);
      });
  }, [user]);

  const isPro =
    subscription?.status === "active" && subscription?.plan !== "ates";
  const plan =
    subscription?.plan ||
    profile?.subscription_plan ||
    "free";

  return { subscription, loading, isPro, plan };
}
