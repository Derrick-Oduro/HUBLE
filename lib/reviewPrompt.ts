import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const REVIEW_LAST_PROMPT_AT_KEY = "review:lastPromptAt";
const REVIEW_OPT_OUT_KEY = "review:optOut";
const REVIEW_RATED_KEY = "review:rated";

const MIN_STREAK_FOR_PROMPT = 7;
const PROMPT_COOLDOWN_DAYS = 21;

const getStoreReviewModule = (): {
  isAvailableAsync?: () => Promise<boolean>;
  requestReview?: () => Promise<void>;
} | null => {
  try {
    // Optional dependency: this still works if expo-store-review is unavailable.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("expo-store-review");
  } catch {
    return null;
  }
};

const canPromptNow = async (streak: number): Promise<boolean> => {
  if (streak < MIN_STREAK_FOR_PROMPT) {
    return false;
  }

  const [[, rated], [, optedOut], [, lastPromptAt]] = await AsyncStorage.multiGet([
    REVIEW_RATED_KEY,
    REVIEW_OPT_OUT_KEY,
    REVIEW_LAST_PROMPT_AT_KEY,
  ]);

  if (rated === "true" || optedOut === "true") {
    return false;
  }

  if (!lastPromptAt) {
    return true;
  }

  const lastPromptDate = new Date(lastPromptAt);
  if (Number.isNaN(lastPromptDate.getTime())) {
    return true;
  }

  const elapsedMs = Date.now() - lastPromptDate.getTime();
  const cooldownMs = PROMPT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return elapsedMs >= cooldownMs;
};

const requestStoreReview = async (): Promise<void> => {
  const StoreReview = getStoreReviewModule();

  try {
    if (!StoreReview?.isAvailableAsync || !StoreReview?.requestReview) {
      return;
    }

    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
    }
  } finally {
    await AsyncStorage.setItem(REVIEW_RATED_KEY, "true");
  }
};

export const maybePromptForReview = async (streak: number): Promise<boolean> => {
  const shouldPrompt = await canPromptNow(streak);
  if (!shouldPrompt) {
    return false;
  }

  await AsyncStorage.setItem(REVIEW_LAST_PROMPT_AT_KEY, new Date().toISOString());

  Alert.alert(
    "Enjoying HUBLE?",
    "You just hit a 7-day streak. Would you mind giving the app a quick rating?",
    [
      {
        text: "Later",
        style: "cancel",
      },
      {
        text: "No Thanks",
        style: "destructive",
        onPress: () => {
          void AsyncStorage.setItem(REVIEW_OPT_OUT_KEY, "true");
        },
      },
      {
        text: "Rate App",
        onPress: () => {
          void requestStoreReview();
        },
      },
    ],
  );

  return true;
};
