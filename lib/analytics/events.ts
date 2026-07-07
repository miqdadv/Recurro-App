export const AnalyticsEvents = {
  AuthSignInStarted: "auth sign in started",
  AuthSignInSucceeded: "auth sign in succeeded",
  AuthSignInFailed: "auth sign in failed",
  AuthSignUpStarted: "auth sign up started",
  AuthSignUpSucceeded: "auth sign up succeeded",
  AuthSignUpFailed: "auth sign up failed",
  AuthValidationFailed: "auth validation failed",
  Logout: "auth logged out",
  HomeBalanceViewed: "home balance viewed",
  UpcomingSubscriptionsViewed: "upcoming subscriptions viewed",
  SubscriptionListViewed: "subscription list viewed",
  SubscriptionCardExpanded: "subscription card expanded",
  SubscriptionCardCollapsed: "subscription card collapsed",
  SubscriptionDetailsViewed: "subscription details viewed",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
