import { AuthScaffold } from "@/components/auth/AuthScaffold";
import { getAuthError, isStrongPassword, isValidEmail, normalizeEmail } from "@/lib/auth";
import { useAuth, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const isBusy = fetchStatus === "fetching";
  const canSubmit = isValidEmail(email) && isStrongPassword(password) && !isBusy;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setFormError(null);
    try {
      const { error } = await signUp.password({ emailAddress: normalizeEmail(email), password });
      if (error) {
        setFormError(getAuthError(error, "We couldn't create your account. Please try again."));
        return;
      }
      await signUp.verifications.sendEmailCode();
      setAwaitingCode(true);
    } catch (error) {
      setFormError(getAuthError(error, "Something went wrong. Please try again."));
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6 || isBusy) return;
    setFormError(null);
    try {
      await signUp.verifications.verifyEmailCode({ code });
      if (signUp.status !== "complete") {
        setFormError("We couldn't finish setting up your account. Please request a new code.");
        return;
      }
      await signUp.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) {
            setFormError("One more account step is required before you can continue.");
            return;
          }
          router.replace("/(tabs)");
        },
      });
    } catch (error) {
      setFormError(getAuthError(error, "That code is invalid or has expired."));
    }
  };

  if (signUp.status === "complete" || isSignedIn) return null;

  if (awaitingCode) {
    return (
      <AuthScaffold title="Verify your email" subtitle={`We sent a 6-digit code to ${normalizeEmail(email)}.`}>
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
            />
          </View>
          {(errors.fields.code?.message || formError) && <Text className="auth-error">{errors.fields.code?.message ?? formError}</Text>}
          <Pressable className={`auth-button ${code.length !== 6 || isBusy ? "auth-button-disabled" : ""}`} onPress={handleVerify} disabled={code.length !== 6 || isBusy}>
            {isBusy ? <ActivityIndicator color="#081126" /> : <Text className="auth-button-text">Verify and start tracking</Text>}
          </Pressable>
          <Pressable className="auth-secondary-button" onPress={() => signUp.verifications.sendEmailCode()} disabled={isBusy}>
            <Text className="auth-secondary-button-text">Send a new code</Text>
          </Pressable>
          <Pressable onPress={() => { signUp.reset(); setAwaitingCode(false); setCode(""); }}>
            <Text className="auth-link text-center">Change email address</Text>
          </Pressable>
        </View>
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold title="Take control of renewals" subtitle="Create your account and make surprise charges a thing of the past.">
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
          />
          {email.length > 0 && !isValidEmail(email) && <Text className="auth-error">Enter a valid email address.</Text>}
        </View>
        <View className="auth-field">
          <Text className="auth-label">Create a password</Text>
          <View className="relative">
            <TextInput
              className={`auth-input pr-13 ${password.length > 0 && !isStrongPassword(password) ? "auth-input-error" : ""}`}
              value={password}
              onChangeText={setPassword}
              placeholder="Choose a secure password"
              placeholderTextColor="rgba(0,0,0,0.42)"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />
            <Pressable className="absolute bottom-0 right-0 top-0 w-13 items-center justify-center" onPress={() => setShowPassword((value) => !value)} accessibilityLabel={showPassword ? "Hide password" : "Show password"}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={21} color="#081126" />
            </Pressable>
          </View>
          <Text className={password.length > 0 && !isStrongPassword(password) ? "auth-error" : "auth-helper"}>Use 8+ characters with uppercase, lowercase, and a number.</Text>
        </View>
        {(errors.fields.emailAddress?.message || errors.fields.password?.message || formError) && <Text className="auth-error" accessibilityRole="alert">{errors.fields.emailAddress?.message ?? errors.fields.password?.message ?? formError}</Text>}
        <Pressable className={`auth-button ${!canSubmit ? "auth-button-disabled" : ""}`} onPress={handleSubmit} disabled={!canSubmit}>
          {isBusy ? <ActivityIndicator color="#081126" /> : <Text className="auth-button-text">Create my account</Text>}
        </Pressable>
        <View className="auth-link-row">
          <Text className="auth-link-copy">Already have an account?</Text>
          <Link href="/(auth)/sign-in" asChild><Pressable><Text className="auth-link">Sign in</Text></Pressable></Link>
        </View>
        <Text className="auth-helper text-center">We will only use your email for account access and important billing alerts.</Text>
        <View nativeID="clerk-captcha" />
      </View>
    </AuthScaffold>
  );
}
