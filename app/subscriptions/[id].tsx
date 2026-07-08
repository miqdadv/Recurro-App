import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Link, useLocalSearchParams } from 'expo-router';
import { track } from '@/lib/analytics/analytics';
import { AnalyticsEvents } from '@/lib/analytics/events';

const SubscriptionDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    useEffect(() => {
      track(AnalyticsEvents.SubscriptionDetailsViewed, {
        subscription_id: id,
      });
    }, [id]);
  return (
    <View>
      <Text>Subscription Details: {id}</Text>
      <Link href="/">Go Back</Link>
    </View>
  )
}

export default SubscriptionDetails
