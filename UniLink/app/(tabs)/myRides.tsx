import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import { useRides } from "../../hooks/useRides";
import { useReviews } from "../../hooks/useReviews";
import { useReports } from "../../hooks/useReports";
import { useNotifications } from "../../hooks/useNotifications";
import { sortByDateDesc } from "../../utils/date";

import {
  applyMyRidesFilters,
  type StatusFilter,
  type ExtraFilter,
  type RatingFilter,
} from "../../domain/rules/myRidesFilters";
import { isUserDriver, isUserPassenger } from "../../domain/rules/rideRules";

import RideCard from "../../components/rideCard";
import { components } from "../../styles/components";
import { layout } from "../../styles/layout";
import { spacing } from "../../styles/theme";
import { RATING_ACTIVE_COLORS } from "../../utils/ratingStyle";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

const EXTRA_FILTERS: { key: ExtraFilter; label: string }[] = [
  { key: "womenOnly", label: "♀️ Women only" },
  { key: "hasFeedback", label: "💬 Has feedback" },
  { key: "hasReport", label: "⚠️ Has report" },
  { key: "hasNotification", label: "🔔 Has notification" },
];

const RATING_FILTERS: { key: RatingFilter; label: string }[] = [
  { key: "none", label: "⭐ ?" },
  { key: "1-2",  label: "⭐ 1-2" },
  { key: "3",    label: "⭐ 3" },
  { key: "4-5",  label: "⭐ 4-5" },
];


export default function MyRides() {
  const router = useRouter();

  const rides = useRides();
  const { user } = useAuth();
  const { reviews } = useReviews();
  const { reports } = useReports();
  const { notifications } = useNotifications();

  const [driverOpen, setDriverOpen] = useState(true);
  const [passengerOpen, setPassengerOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [extraFilters, setExtraFilters] = useState(new Set<ExtraFilter>());
  const [ratingFilter, setRatingFilter] = useState<RatingFilter | null>(null);

  if (!user) return null;
  const activeUser = user;

  function toggleExtra(key: ExtraFilter) {
    setExtraFilters(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const rideNotifications = notifications.filter(n => n.rideId !== undefined);

  const driverRides = applyMyRidesFilters(
    sortByDateDesc(rides.filter(r => isUserDriver(r, activeUser.uid))),
    "driver",
    activeUser.uid,
    reviews,
    reports,
    statusFilter,
    extraFilters,
    ratingFilter,
    rideNotifications
  );

  const passengerRides = applyMyRidesFilters(
    sortByDateDesc(rides.filter(r => isUserPassenger(r, activeUser.uid))),
    "passenger",
    activeUser.uid,
    reviews,
    reports,
    statusFilter,
    extraFilters,
    ratingFilter,
    rideNotifications
  );

  return (
    <ScrollView
      style={layout.scrollScreen}
      contentContainerStyle={layout.scrollContentTab}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={layout.title}>My rides</Text>

      {/* STATUS */}
      <View style={[components.tagRow, { marginBottom: spacing.sm }]}>
        {STATUS_FILTERS.map(f => (
          <Pressable
            key={f.key}
            onPress={() => setStatusFilter(f.key)}
            style={statusFilter === f.key ? components.badgePrimary : components.miniTag}
          >
            <Text style={statusFilter === f.key ? components.badgePrimaryText : components.miniTagText}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* EXTRA FILTERS */}
      <View style={[components.tagRow, { marginBottom: spacing.sm }]}>
        {EXTRA_FILTERS.filter(f => f.key !== "womenOnly" || activeUser.gender === "Female").map(f => {
          const active = extraFilters.has(f.key);
          const activeStyle =
            f.key === "womenOnly"  ? { container: components.badgeWomen,  text: components.badgeWomenText } :
            f.key === "hasReport"  ? { container: components.dangerTag,   text: components.dangerTagText } :
                                     { container: components.badgePrimary, text: components.badgePrimaryText };
          return (
            <Pressable
              key={f.key}
              onPress={() => toggleExtra(f.key)}
              style={active ? activeStyle.container : components.miniTag}
            >
              <Text style={active ? activeStyle.text : components.miniTagText}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* RATING FILTER */}
      <View style={[components.tagRow, { marginBottom: spacing.md }]}>
        {RATING_FILTERS.map(f => {
          const active = ratingFilter === f.key;
          const ac = RATING_ACTIVE_COLORS[f.key];
          return (
            <Pressable
              key={f.key}
              onPress={() => setRatingFilter(prev => prev === f.key ? null : f.key)}
              style={active
                ? { backgroundColor: ac.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }
                : components.miniTag
              }
            >
              <Text style={active
                ? { color: ac.text, fontSize: 13, fontWeight: "600" }
                : components.miniTagText
              }>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* DRIVER */}
      <View style={[components.card, components.cardPrimary]}>
        <Pressable
          style={components.rowSpaceBetween}
          onPress={() => setDriverOpen(prev => !prev)}
        >
          <Text style={layout.subtitle}>
            Driver{driverRides.length > 0 ? ` (${driverRides.length})` : ""}
          </Text>
          <Text style={layout.collapseIndicator}>
            {driverOpen ? "Hide ▲" : "Show ▼"}
          </Text>
        </Pressable>

        {driverOpen && (
          driverRides.length === 0 ? (
            <Text style={[layout.textLight, components.mtSm]}>No rides</Text>
          ) : (
            <FlatList
              data={driverRides}
              keyExtractor={i => i.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={components.mtMd}>
                  <RideCard
                    ride={item}
                    showOccupancyLabel
                    notifications={rideNotifications.filter(n => n.rideId === item.id)}
                    onPress={() => router.push(`/ride/${item.id}`)}
                  />
                </View>
              )}
            />
          )
        )}
      </View>

      {/* PASSENGER */}
      <View style={[components.card, components.cardNeutral]}>
        <Pressable
          style={components.rowSpaceBetween}
          onPress={() => setPassengerOpen(prev => !prev)}
        >
          <Text style={layout.subtitle}>
            Passenger{passengerRides.length > 0 ? ` (${passengerRides.length})` : ""}
          </Text>
          <Text style={layout.collapseIndicator}>
            {passengerOpen ? "Hide ▲" : "Show ▼"}
          </Text>
        </Pressable>

        {passengerOpen && (
          passengerRides.length === 0 ? (
            <Text style={[layout.textLight, components.mtSm]}>No reservations</Text>
          ) : (
            <FlatList
              data={passengerRides}
              keyExtractor={i => i.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={components.mtMd}>
                  <RideCard
                    ride={item}
                    notifications={rideNotifications.filter(n => n.rideId === item.id)}
                    onPress={() => router.push(`/ride/${item.id}`)}
                  />
                </View>
              )}
            />
          )
        )}
      </View>
    </ScrollView>
  );
}
