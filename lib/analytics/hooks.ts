import { useUser } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";
import { configureAnalytics, identify, reset } from "./analytics";
import { useEffect, useRef } from "react";

export function useAnalyticsClient() {
  const posthog = usePostHog();

  useEffect(() => {
    configureAnalytics(posthog);
  }, [posthog]);
}

export function useClerkAnalyticsIdentity() {
  const { isLoaded, isSignedIn, user } = useUser();
  const hadSignedInUserRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName ?? undefined,
        imageUrl: user.imageUrl,
      });
      hadSignedInUserRef.current = true;
      return;
    }

    if (hadSignedInUserRef.current) {
      reset();
      hadSignedInUserRef.current = false;
    }
  }, [isLoaded, isSignedIn, user]);
}
