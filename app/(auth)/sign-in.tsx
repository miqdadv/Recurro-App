import { AuthScaffold } from "@/components/auth/AuthScaffold";
import { getAuthError, isValidEmail, normalizeEmail } from "@/lib/auth";
import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { track } from "@/lib/analytics/analytics";
import { AnalyticsEvents } from "@/lib/analytics/events";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isBusy = fetchStatus === "fetching";
  const canSubmit = isValidEmail(email) && password.length > 0 && !isBusy;

  const finishSignIn = async () => {
    let completed = true;
    await signIn.finalize({
      navigate: ({ session }) => {
        if (session?.currentTask) {
          completed = false;
          const reason = "One more account step is required before you can continue.";
          setFormError(reason);
          track(AnalyticsEvents.AuthSignInFailed, {
            method: "password",
            reason,
            stage: "finalize",
          });
          return;
        }
        // router.replace("/(tabs)");
      },
    });
    return completed;
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      track(AnalyticsEvents.AuthValidationFailed, {
        form_name: "sign_in",
        fields: [
          ...(!isValidEmail(email) ? ["email"] : []),
          ...(password.length === 0 ? ["password"] : []),
        ],
      });
      return;
    }
    setFormError(null);
    track(AnalyticsEvents.AuthSignInStarted, { method: "password" });
    try {
      const { error } = await signIn.password({
        emailAddress: normalizeEmail(email),
        password,
      });
      if (error) {
        const reason = getAuthError(error, "We couldn't sign you in. Check your details and try again.");
        setFormError(reason);
        track(AnalyticsEvents.AuthSignInFailed, {
          method: "password",
          reason,
          stage: "password",
        });
        return;
      }

      if (signIn.status === "complete") {
        const completed = await finishSignIn();
        if (completed) {
          track(AnalyticsEvents.AuthSignInSucceeded, {
            method: "password",
            verification_required: false,
          });
        }
      } else if (
        signIn.status === "needs_client_trust" ||
        signIn.status === "needs_second_factor"
      ) {
        const emailFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code",
        );
        if (!emailFactor) {
          const reason = "This account needs an additional verification method.";
          setFormError(reason);
          track(AnalyticsEvents.AuthSignInFailed, {
            method: "password",
            reason,
            stage: "mfa",
          });
          return;
        }
        await signIn.mfa.sendEmailCode();
        setVerificationRequired(true);
      } else {
        const reason = "We need a little more information to finish signing you in.";
        setFormError(reason);
        track(AnalyticsEvents.AuthSignInFailed, {
          method: "password",
          reason,
          stage: "password",
        });
      }
    } catch (error) {
      const reason = getAuthError(error, "Something went wrong. Please try again.");
      setFormError(reason);
      track(AnalyticsEvents.AuthSignInFailed, {
        method: "password",
        reason,
        stage: "password",
      });
    }
  };

  const handleVerify = async () => {
    if (code.trim().length < 6 || isBusy) {
      if (code.trim().length < 6) {
        track(AnalyticsEvents.AuthValidationFailed, {
          form_name: "sign_in",
          fields: ["code"],
        });
      }
      return;
    }
    setFormError(null);
    try {
      await signIn.mfa.verifyEmailCode({ code: code.trim() });
      if (signIn.status === "complete") {
        const completed = await finishSignIn();
        if (completed) {
          track(AnalyticsEvents.AuthSignInSucceeded, {
            method: "email_code",
            verification_required: true,
          });
        }
      }
      else {
        const reason = "That code could not complete verification. Please request a new one.";
        setFormError(reason);
        track(AnalyticsEvents.AuthSignInFailed, {
          method: "email_code",
          reason,
          stage: "mfa",
        });
      }
    } catch (error) {
      const reason = getAuthError(error, "That code is invalid or has expired.");
      setFormError(reason);
      track(AnalyticsEvents.AuthSignInFailed, {
        method: "email_code",
        reason,
        stage: "mfa",
      });
    }
  };

  const handleResendCode = async () => {
    if (isBusy) return;
    setFormError(null);
    try {
      await signIn.mfa.sendEmailCode();
    } catch (error) {
      const reason = getAuthError(error, "We couldn't send a new code. Please try again.");
      setFormError(reason);
      track(AnalyticsEvents.AuthSignInFailed, {
        method: "email_code",
        reason,
        stage: "resend_code",
      });
    }
  };

  if (verificationRequired) {
    return (
      <AuthScaffold
        title="Check your inbox"
        subtitle={`Enter the 6-digit security code sent to ${normalizeEmail(email)}.`}
      >
        <View className="auth-form">
          <View className="auth-field">
            <Text className="auth-label">Verification code</Text>
            <TextInput
              className="auth-input tracking-[6px]"
              style={{ textAlign: "center" }}
              value={code}
              onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={6}
              autoFocus
              accessibilityLabel="Verification code"
            />
          </View>
          {(errors.fields.code?.message || formError) && (
            <Text className="auth-error" accessibilityRole="alert">
              {errors.fields.code?.message ?? formError}
            </Text>
          )}
          <Pressable
            className={`auth-button ${code.length !== 6 || isBusy ? "auth-button-disabled" : ""}`}
            onPress={handleVerify}
            disabled={code.length !== 6 || isBusy}
          >
            {isBusy ? <ActivityIndicator color="#081126" /> : <Text className="auth-button-text">Verify and continue</Text>}
          </Pressable>
          <Pressable className="auth-secondary-button" onPress={handleResendCode} disabled={isBusy}>
            <Text className="auth-secondary-button-text">Send a new code</Text>
          </Pressable>
          <Pressable onPress={() => { signIn.reset(); setVerificationRequired(false); setCode(""); }}>
            <Text className="auth-link text-center">Use a different account</Text>
          </Pressable>
        </View>
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold title="Welcome back" subtitle="Sign in to keep every renewal organized and under control.">
      <View className="auth-form">
        <View className="auth-field">
          <Text className="auth-label">Email address</Text>
          <TextInput
            className={`auth-input ${email.length > 0 && !isValidEmail(email) ? "auth-input-error" : ""}`}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="rgba(0,0,0,0.42)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />
          {email.length > 0 && !isValidEmail(email) && <Text className="auth-error">Enter a valid email address.</Text>}
        </View>

        <View className="auth-field">
          <Text className="auth-label">Password</Text>
          <View className="relative">
            <TextInput
              className="auth-input pr-13"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="rgba(0,0,0,0.42)"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />
            <Pressable
              className="absolute bottom-0 right-0 top-0 w-13 items-center justify-center"
              onPress={() => setShowPassword((value) => !value)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={21} color="#081126" />
            </Pressable>
          </View>
        </View>

        {(errors.fields.identifier?.message || errors.fields.password?.message || formError) && (
          <Text className="auth-error" accessibilityRole="alert">
            {errors.fields.identifier?.message ?? errors.fields.password?.message ?? formError}
          </Text>
        )}

        <Pressable
          className={`auth-button ${!canSubmit ? "auth-button-disabled" : ""}`}
          onPress={handleSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
        >
          {isBusy ? <ActivityIndicator color="#081126" /> : <Text className="auth-button-text">Sign in securely</Text>}
        </Pressable>

        <View className="auth-link-row">
          <Text className="auth-link-copy">New to Recurro?</Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable><Text className="auth-link">Create an account</Text></Pressable>
          </Link>
        </View>
        <Text className="auth-helper text-center">Your session is encrypted and securely stored on this device.</Text>
      </View>
    </AuthScaffold>
  );
}
