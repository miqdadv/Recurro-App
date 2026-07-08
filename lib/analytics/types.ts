import { AnalyticsEvents } from "./events";

type AuthMethod = "password" | "email_code";

export type AnalyticsEventProperties = {
  [AnalyticsEvents.AuthSignInStarted]: {
    method: AuthMethod;
  };
  [AnalyticsEvents.AuthSignInSucceeded]: {
    method: AuthMethod;
    verification_required?: boolean;
  };
  [AnalyticsEvents.AuthSignInFailed]: {
    method: AuthMethod;
    reason: string;
    stage: "password" | "mfa" | "finalize" | "resend_code";
  };
  [AnalyticsEvents.AuthSignUpStarted]: {
    method: AuthMethod;
  };
  [AnalyticsEvents.AuthSignUpSucceeded]: {
    method: AuthMethod;
    verification_required: boolean;
  };
  [AnalyticsEvents.AuthSignUpFailed]: {
    method: AuthMethod;
    reason: string;
    stage: "create" | "verify" | "finalize" | "resend_code";
  };
  [AnalyticsEvents.AuthValidationFailed]: {
    form_name: "sign_in" | "sign_up";
    fields: string[];
  };
  [AnalyticsEvents.Logout]: undefined;
  [AnalyticsEvents.HomeBalanceViewed]: {
    amount: number;
    currency: string;
    next_renewal_date: string;
  };
  [AnalyticsEvents.UpcomingSubscriptionsViewed]: {
    count: number;
    total_amount: number;
    currency: string;
    soonest_days_left?: number;
  };
  [AnalyticsEvents.SubscriptionListViewed]: {
    count: number;
    total_amount: number;
    currency: string;
    active_count: number;
    paused_count: number;
    cancelled_count: number;
  };
  [AnalyticsEvents.SubscriptionCardExpanded]: SubscriptionAnalyticsProperties;
  [AnalyticsEvents.SubscriptionCardCollapsed]: SubscriptionAnalyticsProperties;
  [AnalyticsEvents.SubscriptionDetailsViewed]: {
    subscription_id?: string;
  };
  [AnalyticsEvents.SearchOpened]: {
    screen_name: "Subscriptions";
  };
  [AnalyticsEvents.SearchPerformed]: {
    screen_name: "Subscriptions";
    query: string;
    results_count: number;
  };
  [AnalyticsEvents.SearchCleared]: {
    screen_name: "Subscriptions";
    previous_query: string;
  };
  [AnalyticsEvents.SearchResultSelected]: SubscriptionAnalyticsProperties & {
    screen_name: "Subscriptions";
    query: string;
    results_count: number;
  };
};

export type SubscriptionAnalyticsProperties = {
  subscription_id: string;
  subscription_name: string;
  category?: string;
  billing_cycle: string;
  amount: number;
  currency: string;
  status?: string;
};

export type ScreenProperties = {
  screen_name: string;
  pathname: string;
  previous_screen?: string;
};
