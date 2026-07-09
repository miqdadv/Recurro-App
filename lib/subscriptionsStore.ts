import { useSyncExternalStore } from "react";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";

let subscriptions = HOME_SUBSCRIPTIONS;
const listeners = new Set<() => void>();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => subscriptions;

export const addSubscription = (subscription: Subscription) => {
  subscriptions = [subscription, ...subscriptions];
  emitChange();
};

export const useSubscriptions = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
