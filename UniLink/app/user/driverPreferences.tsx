import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { DriverPreferences } from "../../domain/entities/DriverPreferences";
import { DEFAULT_DRIVER_PREFERENCES } from "../../domain/entities/DriverPreferences";
import { useAuth } from "../../hooks/useAuth";
import { updateProfile } from "../../services/ProfileService";
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
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}>

        <Text onPress={() => router.back()} style={{ color: colors.primary, fontWeight: "600", marginBottom: spacing.md }}>
          ← Back
        </Text>

        <Text style={layout.title}>Driver Preferences</Text>
        <Text style={{ color: colors.textLight, marginBottom: spacing.lg }}>Customise your ride experience</Text>

        {PREFS.map((pref) => {
          const showHeader = pref.section !== lastSection;
          lastSection = pref.section;
          return (
            <View key={pref.key}>
              {showHeader && (
                <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1.1, color: colors.textLight, marginTop: spacing.md, marginBottom: spacing.xs }}>
                  {pref.section}
                </Text>
              )}
              <View style={[components.card, { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xs }]}>
                <View style={{ flex: 1, marginRight: spacing.md }}>
                  <Text style={{ fontWeight: "600" }}>{pref.icon} {pref.label}</Text>
                  <Text style={{ fontSize: 12, color: colors.textLight }}>{pref.desc}</Text>
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

        <TouchableOpacity
          testID="saveDriverPrefsButton"
          onPress={() => void save()}
          style={{ backgroundColor: colors.primary, borderRadius: 50, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.lg }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Save Preferences</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}