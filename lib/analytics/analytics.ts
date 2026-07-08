import type { PostHog } from "posthog-react-native";
import type { AnalyticsEventName } from "./events";
import type { AnalyticsEventProperties, ScreenProperties } from "./types";

let client: PostHog | null = null;
let identifiedUserKey: string | null = null;

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type JsonProperties = Record<string, JsonValue | undefined>;

const compact = <T extends JsonProperties>(properties?: T) => {
  if (!properties) return undefined;

  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ) as Record<string, JsonValue>;
};

export const configureAnalytics = (posthog: PostHog | null) => {
  client = posthog;
};

export function track<TEvent extends AnalyticsEventName>(
  event: TEvent,
  properties?: AnalyticsEventProperties[TEvent],
) {
  client?.capture(event, compact(properties as JsonProperties));
}

export function screen(properties: ScreenProperties) {
  client?.screen(properties.screen_name, compact(properties));
}

export function identify(
  distinctId: string,
  properties: {
    email?: string;
    name?: string;
    imageUrl?: string;
  },
) {
  const compactedProperties = compact(properties);
  const identifiedUserKeyValue = JSON.stringify({
    distinctId,
    properties: compactedProperties,
  });

  if (identifiedUserKey === identifiedUserKeyValue) return;

  client?.identify(distinctId, compactedProperties);
  identifiedUserKey = identifiedUserKeyValue;
}

export function reset() {
  client?.reset();
  identifiedUserKey = null;
}

export function group(groupType: string, groupKey: string, properties?: Record<string, unknown>) {
  client?.group(groupType, groupKey, compact(properties as JsonProperties));
}
