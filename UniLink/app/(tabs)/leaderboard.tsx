import { useEffect, useState } from "react";
import { Text, View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useRides } from "../../hooks/useRides";
import { spacing } from "../../styles/theme";
import { layout } from "../../styles/layout";
import { components } from "../../styles/components";
import { buildLeaderboard, type UserRankEntry } from "../../domain/rules/leaderboard";

export default function Leaderboard() {
  const router = useRouter();
  const { user: currentUser, getUsers } = useAuth();
  const rides = useRides();
  const [ranking, setRanking] = useState<UserRankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRanking(buildLeaderboard(getUsers(), rides));
    setLoading(false);
  }, [rides, currentUser]);


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
