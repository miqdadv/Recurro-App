import clsx from "clsx";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { icons } from "@/constants/icons";
import { track } from "@/lib/analytics/analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";

type Frequency = "Monthly" | "Yearly";

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

const FREQUENCIES: Frequency[] = ["Monthly", "Yearly"];

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#f7c8d0",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#c7e8b8",
  Cloud: "#b7dcf0",
  Music: "#b8e8d0",
  Other: "#f0dfb4",
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState("Entertainment");

  const parsedPrice = Number(price);
  const canSubmit = useMemo(
    () => name.trim().length > 0 && Number.isFinite(parsedPrice) && parsedPrice > 0,
    [name, parsedPrice],
  );

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
  };

  const handleClose = () => {
    track(AnalyticsEvents.SubscriptionCreateModalClosed, {
      screen_name: "Home",
      had_name: name.trim().length > 0,
      had_price: price.trim().length > 0,
      selected_frequency: frequency,
      selected_category: category,
    });
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const startDate = dayjs();
    const renewalDate = startDate.add(
      1,
      frequency === "Monthly" ? "month" : "year",
    );
    const subscription: Subscription = {
      id: `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: name.trim(),
      price: parsedPrice,
      frequency,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: icons.wallet,
      billing: frequency,
      currency: "USD",
      color: CATEGORY_COLORS[category],
    };

    track(AnalyticsEvents.SubscriptionCreated, {
      screen_name: "Home",
      subscription_id: subscription.id,
      subscription_name: subscription.name,
      category: subscription.category,
      billing_cycle: subscription.billing,
      amount: subscription.price,
      currency: subscription.currency ?? "USD",
      status: subscription.status,
      renewal_date: subscription.renewalDate ?? "",
    });

    onCreate(subscription);
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="modal-overlay"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable className="flex-1" onPress={handleClose} />
        <View className="modal-container">
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <Pressable
              className="modal-close"
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close new subscription modal"
            >
              <Text className="modal-close-text">x</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerClassName="modal-body"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-field">
              <Text className="auth-label">Name</Text>
              <TextInput
                className="auth-input"
                value={name}
                onChangeText={setName}
                placeholder="Netflix"
                placeholderTextColor="rgba(0, 0, 0, 0.35)"
              />
            </View>

            <View className="auth-field">
              <Text className="auth-label">Price</Text>
              <TextInput
                className="auth-input"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                placeholder="12.99"
                placeholderTextColor="rgba(0, 0, 0, 0.35)"
              />
            </View>

            <View className="auth-field">
              <Text className="auth-label">Frequency</Text>
              <View className="picker-row">
                {FREQUENCIES.map((option) => {
                  const active = frequency === option;

                  return (
                    <Pressable
                      key={option}
                      className={clsx(
                        "picker-option",
                        active && "picker-option-active",
                      )}
                      onPress={() => setFrequency(option)}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          active && "picker-option-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="auth-field">
              <Text className="auth-label">Category</Text>
              <View className="category-scroll">
                {CATEGORIES.map((option) => {
                  const active = category === option;

                  return (
                    <Pressable
                      key={option}
                      className={clsx(
                        "category-chip",
                        active && "category-chip-active",
                      )}
                      onPress={() => setCategory(option)}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          active && "category-chip-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              className={clsx("auth-button", !canSubmit && "auth-button-disabled")}
              disabled={!canSubmit}
              onPress={handleSubmit}
            >
              <Text className="auth-button-text">Create Subscription</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
