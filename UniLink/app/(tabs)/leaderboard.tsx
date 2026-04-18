import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getRides } from "../../data/rides";
import { getUsers, getCurrentUser } from "../../data/user";
import { colors, radius, spacing } from "../../styles/theme";
import { layout } from "../../styles/layout";
import { components } from "../../styles/components";

interface UserRankEntry {
  id: string;
  name: string;
  co2: number;
}
export default function Leaderboard() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [ranking, setRanking] = useState<UserRankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadLeaderboard() {
      const rides = getRides();
      const users = getUsers();

      const CO2_PER_KM = 0.12;
      const totals: Record<string, number> = {};

      for (const r of rides) {
        if (!r.completed || !r.distanceKm) continue;

        const co2SavedPerPassenger = r.distanceKm * CO2_PER_KM;

        r.passengers.forEach(p => {
          totals[p] = (totals[p] || 0) + co2SavedPerPassenger;
        });

        if (r.passengers.length > 0) {
          const driverTotalSaved = co2SavedPerPassenger * r.passengers.length;
          totals[r.driverId] = (totals[r.driverId] || 0) + driverTotalSaved;
        }
      }

      const result = users
        .map(u => ({
          id: u.uid,
          name: u.name,
          co2: totals[u.uid] || totals[u.email] || 0
        }))
        .filter(u => u.co2 > 0)
        .sort((a, b) => b.co2 - a.co2);

      setRanking(result);
      setLoading(false);
    }

    loadLeaderboard();
  }, [currentUser]);


  if (loading) {
    return (
      <View style={[layout.screen, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.emptyText}>Calculating impact...</Text>
      </View>
    );
  }

  if (ranking.length === 0) {
    return (
      <ScrollView style={layout.scrollScreen} contentContainerStyle={styles.scrollContent}>
        <Text style={layout.title}>Sustainability Leaderboard</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No sustainability data yet</Text>
        </View>
      </ScrollView>
    );
  }

  const top10 = ranking.slice(0, 10);
  const userRankIndex = ranking.findIndex(u => u.id === currentUser?.uid || u.id === currentUser?.email);
  const isUserInTop10 = userRankIndex !== -1 && userRankIndex < 10;
  
  // If user has 0 CO2, they aren't in the ranking. We create a placeholder entry.
  const userRankEntry = userRankIndex !== -1 
    ? ranking[userRankIndex] 
    : currentUser ? { id: currentUser.uid, name: currentUser.name, co2: 0 } : null;

  const renderRankItem = (u: UserRankEntry, index: number) => {
    const isCurrentUser = u.id === currentUser?.uid || u.id === currentUser?.email;
    const isTop3 = index !== -1 && index < 3;

    return (
      <Pressable
        key={u.id}
        style={[
          components.card,
          isCurrentUser && styles.currentUserCard,
          { marginBottom: spacing.sm }
        ]}
        onPress={() => {
          if (isCurrentUser) router.push("/(tabs)/userProfile");
          else router.push(`/user/${u.id}`);
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.rank, isTop3 && styles.topRank]}>
            {index === -1 ? "-" : `#${index + 1}`}
          </Text>

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {u.name} {isCurrentUser && "(You)"}
            </Text>
            <Text style={styles.co2}>
              {u.co2.toFixed(2)} kg CO₂ saved
            </Text>
          </View>

          {isTop3 && (
            <Text style={styles.trophy}>
              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView style={layout.scrollScreen} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={layout.title}>Sustainability Leaderboard</Text>

      {top10.map((u, i) => renderRankItem(u, i))}

      {!isUserInTop10 && userRankEntry && (
        <>
          <View style={styles.divider}>
            <Text style={styles.dividerText}>...</Text>
          </View>
          {renderRankItem(userRankEntry, userRankIndex)}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl
  },
  currentUserCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: "white"
  },
  rank: {
    fontSize: 18,
    fontWeight: "700",
    width: 45,
    color: colors.textLight
  },
  topRank: {
    color: colors.primary,
    fontSize: 20,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text
  },
  co2: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2
  },
  trophy: {
    fontSize: 24
  },
  divider: {
    alignItems: "center",
    marginVertical: spacing.md
  },
  dividerText: {
    color: colors.textLight,
    fontSize: 20,
    fontWeight: "600"
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginTop: spacing.xl
  },
  emptyText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "500"
  }
});
