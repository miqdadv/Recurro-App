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
  SearchOpened: "search opened",
  SearchPerformed: "search performed",
  SearchCleared: "search cleared",
  SearchResultSelected: "search result selected",
  SubscriptionCreateModalOpened: "subscription create modal opened",
  SubscriptionCreateModalClosed: "subscription create modal closed",
  SubscriptionCreated: "subscription created",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
