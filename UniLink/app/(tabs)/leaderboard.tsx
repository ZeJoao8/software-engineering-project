import { useEffect, useState } from "react";
import { Text, View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getRides } from "../../data/rides";
import { getUsers, getCurrentUser } from "../../data/user";
import { colors, spacing } from "../../styles/theme";
import { layout } from "../../styles/layout";
import { components } from "../../styles/components";
import { calculateUserCO2Saved } from "../../domain/rules/sustainability";

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

      const result = users
        .map(u => ({
          id: u.uid,
          name: u.name,
          co2: calculateUserCO2Saved(rides, u.uid)
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
        <Text style={layout.emptyText}>Calculating impact...</Text>
      </View>
    );
  }

  if (ranking.length === 0) {
    return (
      <ScrollView style={layout.scrollScreen} contentContainerStyle={components.leaderboardScrollContent}>
        <Text style={layout.title}>Sustainability Leaderboard</Text>
        <View style={layout.emptyContainer}>
          <Text style={layout.emptyText}>No sustainability data yet</Text>
        </View>
      </ScrollView>
    );
  }

  const top10 = ranking.slice(0, 10);
  const userRankIndex = ranking.findIndex(u => u.id === currentUser?.uid);
  const isUserInTop10 = userRankIndex !== -1 && userRankIndex < 10;

  const userRankEntry = userRankIndex !== -1
    ? ranking[userRankIndex]
    : currentUser ? { id: currentUser.uid, name: currentUser.name, co2: 0 } : null;

  const renderRankItem = (u: UserRankEntry, index: number) => {
    const isCurrentUser = u.id === currentUser?.uid;
    const isTop3 = index !== -1 && index < 3;

    return (
      <Pressable
        key={u.id}
        style={[
          components.card,
          isCurrentUser && components.leaderboardCurrentUser,
          { marginBottom: spacing.sm }
        ]}
        onPress={() => {
          if (isCurrentUser) router.push("/(tabs)/userProfile");
          else router.push(`/user/${u.id}`);
        }}
      >
        <View style={components.row}>
          <Text style={[components.rankNumber, isTop3 && components.rankNumberTop]}>
            {index === -1 ? "-" : `#${index + 1}`}
          </Text>

          <View style={{ flex: 1 }}>
            <Text style={components.rankName}>
              {u.name} {isCurrentUser && "(You)"}
            </Text>
            <Text style={components.rankCO2}>
              {u.co2.toFixed(2)} kg CO₂ saved
            </Text>
          </View>

          {isTop3 && (
            <Text style={components.rankTrophy}>
              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={layout.scrollScreen}
      contentContainerStyle={components.leaderboardScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={layout.title}>Sustainability Leaderboard</Text>

      {top10.map((u, i) => renderRankItem(u, i))}

      {!isUserInTop10 && userRankEntry && (
        <>
          <View style={components.rankDivider}>
            <Text style={components.rankDividerText}>...</Text>
          </View>
          {renderRankItem(userRankEntry, userRankIndex)}
        </>
      )}
    </ScrollView>
  );
}
