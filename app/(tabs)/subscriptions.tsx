import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import clsx from "clsx";
import SubscriptionCard from "@/components/SubscriptionCard";
import { track } from "@/lib/analytics/analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { useSubscriptions } from "@/lib/subscriptionsStore";
const SafeAreaView = styled(RNSafeAreaView);

const getSearchableText = (subscription: Subscription) =>
  [
    subscription.name,
    subscription.plan,
    subscription.category,
    subscription.billing,
    subscription.status,
    subscription.paymentMethod,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const toSubscriptionProperties = (subscription: Subscription) => ({
  subscription_id: subscription.id,
  subscription_name: subscription.name,
  category: subscription.category,
  billing_cycle: subscription.billing,
  amount: subscription.price,
  currency: subscription.currency ?? "USD",
  status: subscription.status,
});

const Subscriptions = () => {
  const subscriptions = useSubscriptions();
  const [query, setQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const hasTrackedSearchOpenRef = useRef(false);
  const lastTrackedQueryRef = useRef("");

  const trimmedQuery = query.trim();
  const filteredSubscriptions = useMemo(() => {
    if (!trimmedQuery) return subscriptions;

    const normalizedQuery = trimmedQuery.toLowerCase();
    return subscriptions.filter((subscription) =>
      getSearchableText(subscription).includes(normalizedQuery),
    );
  }, [subscriptions, trimmedQuery]);

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
    if (hasTrackedSearchOpenRef.current) return;

    hasTrackedSearchOpenRef.current = true;
    track(AnalyticsEvents.SearchOpened, {
      screen_name: "Subscriptions",
    });
  }, []);

  const handleSearchBlur = useCallback(() => {
    setIsSearchFocused(false);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    setExpandedSubscriptionId(null);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (!trimmedQuery || lastTrackedQueryRef.current === trimmedQuery) return;

    lastTrackedQueryRef.current = trimmedQuery;
    track(AnalyticsEvents.SearchPerformed, {
      screen_name: "Subscriptions",
      query: trimmedQuery,
      results_count: filteredSubscriptions.length,
    });
  }, [filteredSubscriptions.length, trimmedQuery]);

  const handleClearSearch = useCallback(() => {
    if (!trimmedQuery) return;

    track(AnalyticsEvents.SearchCleared, {
      screen_name: "Subscriptions",
      previous_query: trimmedQuery,
    });
    setQuery("");
    setExpandedSubscriptionId(null);
    lastTrackedQueryRef.current = "";
  }, [trimmedQuery]);

  const handleSubscriptionPress = useCallback(
    (subscription: Subscription) => {
      const willCollapse = expandedSubscriptionId === subscription.id;

      setExpandedSubscriptionId(willCollapse ? null : subscription.id);
      track(
        willCollapse
          ? AnalyticsEvents.SubscriptionCardCollapsed
          : AnalyticsEvents.SubscriptionCardExpanded,
        toSubscriptionProperties(subscription),
      );

      if (!willCollapse && trimmedQuery) {
        track(AnalyticsEvents.SearchResultSelected, {
          screen_name: "Subscriptions",
          query: trimmedQuery,
          results_count: filteredSubscriptions.length,
          ...toSubscriptionProperties(subscription),
        });
      }
    },
    [expandedSubscriptionId, filteredSubscriptions.length, trimmedQuery],
  );

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <FlatList
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() => handleSubscriptionPress(item)}
            />
          )}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View className="mb-5 gap-4">
              <Text className="text-3xl font-sans-bold text-primary">
                Subscriptions
              </Text>
              <View
                className={clsx(
                  "rounded-2xl border bg-card px-4 py-1",
                  isSearchFocused ? "border-accent bg-accent/10" : "border-border",
                )}
              >
                <TextInput
                  className="py-3 text-base font-sans-medium text-primary"
                  value={query}
                  onChangeText={handleSearchChange}
                  onBlur={handleSearchBlur}
                  onFocus={handleSearchFocus}
                  onSubmitEditing={handleSearchSubmit}
                  placeholder="Search by name, category, plan, or status"
                  placeholderTextColor="rgba(0,0,0,0.42)"
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View className="min-h-7 flex-row items-center justify-between">
                <Text className="text-sm font-sans-semibold text-muted-foreground">
                  {filteredSubscriptions.length} of {subscriptions.length} shown
                </Text>
                {trimmedQuery ? (
                  <Pressable onPress={handleClearSearch} accessibilityRole="button">
                    <Text className="text-sm font-sans-bold text-accent">
                      Clear
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          }
          ListEmptyComponent={
            <Text className="home-empty-state">
              No subscriptions match your search
            </Text>
          }
          contentContainerClassName="pb-30"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Subscriptions;
