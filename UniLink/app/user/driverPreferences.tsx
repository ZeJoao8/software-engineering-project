import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { DriverPreferences } from "../../domain/entities/DriverPreferences";
import { DEFAULT_DRIVER_PREFERENCES } from "../../domain/entities/DriverPreferences";
import { useAuth } from "../../hooks/useAuth";
import { updateProfile } from "../../services/ProfileService";
import { Button } from "../../components/Button";
import { components } from "../../styles/components";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";

const PREFS = [
  { key: "noSmoking",      icon: "🚭", label: "No smoking",       desc: "Non-smoking passengers only",    section: "PASSENGERS" },
  { key: "acceptLuggage",  icon: "🧳", label: "Accept Luggage",   desc: "Allow hand luggage / bags",      section: "TRIP" },
  { key: "acceptPets",     icon: "🐾", label: "Pets allowed",     desc: "Allow small pets",               section: "TRIP" },
  { key: "passengerMusic", icon: "🎵", label: "Passenger music",  desc: "Allow passengers to play music", section: "TRIP" },
] as const;

export default function DriverPreferencesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<DriverPreferences>({
    ...DEFAULT_DRIVER_PREFERENCES,
    ...user?.driverPreferences,
  });

  async function save() {
    if (!user) return;
    const result = await updateProfile({ ...user, driverPreferences: prefs });
    if (!result.ok) { Alert.alert("Error", result.error); return; }
    Alert.alert("Saved", "Your preferences have been saved.", [{ text: "OK", onPress: () => router.back() }]);
  }

  let lastSection = "";

  return (
    <SafeAreaView style={layout.screen}>
      <ScrollView contentContainerStyle={layout.scrollContentLg}>

        <Text onPress={() => router.back()} style={layout.backLink}>
          ← Back
        </Text>

        <Text style={layout.title}>Driver Preferences</Text>
        <Text style={[layout.textLight, components.mbSm]}>Customise your ride experience</Text>

        {PREFS.map((pref) => {
          const showHeader = pref.section !== lastSection;
          lastSection = pref.section;
          return (
            <View key={pref.key}>
              {showHeader && (
                <Text style={layout.sectionLabel}>{pref.section}</Text>
              )}
              <View style={[components.card, components.rowSpaceBetween]}>
                <View style={{ flex: 1, marginRight: spacing.md }}>
                  <Text style={layout.headingSm}>{pref.icon} {pref.label}</Text>
                  <Text style={layout.textLightSm}>{pref.desc}</Text>
                </View>
                <Switch
                  testID={`pref_${pref.key}`}
                  value={prefs[pref.key]}
                  onValueChange={(v) => setPrefs(p => ({ ...p, [pref.key]: v }))}
                  trackColor={{ false: "#d1d5db", true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          );
        })}

        <Button
          testID="saveDriverPrefsButton"
          onPress={() => void save()}
          label="Save Preferences"
          style={{ marginTop: spacing.lg }}
        />

      </ScrollView>
    </SafeAreaView>
  );
}
