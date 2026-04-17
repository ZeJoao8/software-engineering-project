import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { getRides } from "../../data/rides";
import { getUsers } from "../../data/user";
import { colors, radius, spacing } from "../../styles/theme";
import { getRoute } from "../../utils/routing";

// leaderboard baseada em CO2 com UI melhorada
export default function Leaderboard() {

  const [ranking, setRanking] = useState([]);

  useEffect(() => {

    async function loadLeaderboard() {

      const rides = getRides();
      const users = getUsers();

      const CO2_PER_KM = 0.12;
      const totals = {};

      for (const r of rides) {

        if (!r.originCoords || !r.destinationCoords) continue;

        const route = await getRoute(
          r.originCoords,
          r.destinationCoords
        );

        const co2 = route.distanceKm * CO2_PER_KM;

        r.passengers.forEach(p => {
          totals[p] = (totals[p] || 0) + co2;
        });

        if (r.passengers.length > 0) {
          totals[r.driverId] =
            (totals[r.driverId] || 0) +
            (co2 * r.passengers.length);
        }
      }

      const result = users
        .map(u => ({
          id: u.id,
          name: u.name,
          co2: totals[u.id] || 0
        }))
        .sort((a, b) => b.co2 - a.co2);

      setRanking(result);
    }

    loadLeaderboard();

  }, []);

  if (ranking.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No sustainability data yet
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Sustainability Leaderboard
      </Text>

      {ranking.map((u, i) => {

        const isTop3 = i < 3;

        return (
          <View
            key={u.id}
            style={[
              styles.card,
              isTop3 && styles.topCard
            ]}
          >

            <Text style={styles.rank}>
              #{i + 1}
            </Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {u.name}
              </Text>
              <Text style={styles.co2}>
                {u.co2.toFixed(2)} kg CO₂ saved
              </Text>
            </View>

            {isTop3 && (
              <Text style={styles.trophy}>
                🏆
              </Text>
            )}

          </View>
        );
      })}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: "white"
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    elevation: 3
  },

  topCard: {
    borderWidth: 2,
    borderColor: colors.primarySoft
  },

  rank: {
    fontSize: 18,
    fontWeight: "700",
    marginRight: spacing.md,
    color: colors.primary
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text
  },

  co2: {
    fontSize: 13,
    color: colors.textLight
  },

  trophy: {
    fontSize: 20
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary
  },

  emptyText: {
    color: colors.text,
    fontSize: 16
  }

});