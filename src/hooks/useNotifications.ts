import { useState, useEffect, useCallback } from "react";

interface UseNotificationsReturn {
  permission: NotificationPermission | "unsupported";
  isSupported: boolean;
  isGranted: boolean;
  isDenied: boolean;
  isDefault: boolean;
  requestPermission: () => Promise<void>;
  dismissBanner: () => void;
  showBanner: boolean;
}

const BANNER_DISMISSED_KEY = "notification_banner_dismissed";

export function useNotifications(): UseNotificationsReturn {
  const isSupported = typeof window !== "undefined" && "Notification" in window;

  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    isSupported ? Notification.permission : "unsupported"
  );
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      return localStorage.getItem(BANNER_DISMISSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isSupported) return;
    // Sync permission state in case it changed externally
    const check = () => setPermission(Notification.permission);
    check();
    // There's no standard event for permission changes, so we poll occasionally
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        // Store subscription info in localStorage for now
        // Full push server integration would register the service worker here
        localStorage.setItem("notification_permission", "granted");
        localStorage.setItem("notification_granted_at", new Date().toISOString());
      }
    } catch (err) {
      console.error("Failed to request notification permission:", err);
    }
  }, [isSupported]);

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
    try {
      localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    } catch {
      // localStorage not available
    }
  }, []);

  const isGranted = permission === "granted";
  const isDenied = permission === "denied";
  const isDefault = permission === "default";

  // Show the banner only if: supported, not granted, not denied, and not manually dismissed
  const showBanner = isSupported && !isGranted && !isDenied && !bannerDismissed;

  return {
    permission,
    isSupported,
    isGranted,
    isDenied,
    isDefault,
    requestPermission,
    dismissBanner,
    showBanner,
  };
}
