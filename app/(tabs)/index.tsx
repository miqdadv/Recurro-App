import "@/global.css";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/expo";
import { track } from "@/lib/analytics/analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { addSubscription, useSubscriptions } from "@/lib/subscriptionsStore";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const subscriptions = useSubscriptions();
  const trackedHomeSummaryRef = useRef(false);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  useEffect(() => {
    if (trackedHomeSummaryRef.current) return;

    trackedHomeSummaryRef.current = true;
    const homeCurrency = subscriptions[0]?.currency ?? "USD";
    const statusCounts = subscriptions.reduce(
      (counts, subscription) => {
        if (subscription.status === "active") counts.active_count += 1;
        if (subscription.status === "paused") counts.paused_count += 1;
        if (subscription.status === "cancelled") counts.cancelled_count += 1;
        return counts;
      },
      { active_count: 0, paused_count: 0, cancelled_count: 0 },
    );

    track(AnalyticsEvents.HomeBalanceViewed, {
      amount: HOME_BALANCE.amount,
      currency: homeCurrency,
      next_renewal_date: HOME_BALANCE.nextRenewalDate,
    });
    track(AnalyticsEvents.UpcomingSubscriptionsViewed, {
      count: UPCOMING_SUBSCRIPTIONS.length,
      total_amount: UPCOMING_SUBSCRIPTIONS.reduce(
        (total, subscription) => total + subscription.price,
        0,
      ),
      currency: UPCOMING_SUBSCRIPTIONS[0]?.currency ?? homeCurrency,
      soonest_days_left: UPCOMING_SUBSCRIPTIONS[0]?.daysLeft,
    });
    track(AnalyticsEvents.SubscriptionListViewed, {
      count: subscriptions.length,
      total_amount: subscriptions.reduce(
        (total, subscription) => total + subscription.price,
        0,
      ),
      currency: homeCurrency,
      ...statusCounts,
    });
  }, [subscriptions]);

  const handleSubscriptionPress = useCallback((subscription: Subscription) => {
    const willCollapse = expandedSubscriptionId === subscription.id;

    setExpandedSubscriptionId(willCollapse ? null : subscription.id);
    track(
      willCollapse
        ? AnalyticsEvents.SubscriptionCardCollapsed
        : AnalyticsEvents.SubscriptionCardExpanded,
      {
        subscription_id: subscription.id,
        subscription_name: subscription.name,
        category: subscription.category,
        billing_cycle: subscription.billing,
        amount: subscription.price,
        currency: subscription.currency ?? "USD",
        status: subscription.status,
      },
    );
  }, [expandedSubscriptionId]);

  const handleCreateSubscription = useCallback((subscription: Subscription) => {
    addSubscription(subscription);
    setExpandedSubscriptionId(subscription.id);
  }, []);

  const userLabel =
    user?.fullName?.trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "User";
  const avatarSource =
    user?.hasImage && user.imageUrl
      ? { uri: user.imageUrl }
      : images.avatar;

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={avatarSource} className="home-avatar" />
                <Text className="home-user-name">{userLabel}</Text>
              </View>
              <Pressable
                onPress={() => setIsCreateModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Create subscription"
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5 ">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
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
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet</Text>
        }
        contentContainerClassName="pb-30"
      />
      <CreateSubscriptionModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreate={handleCreateSubscription}
      />
    </SafeAreaView>
  );
}
