import {
  FlatList,
  Switch,
  Text,
  TextInput,
  View,
  Pressable
} from "react-native";


import {
  useFocusEffect,
  useRouter
} from "expo-router";

import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  getRides,
  removeEmptyPastRides,
  subscribeToRidesChanges
} from "../../data/rides";

import { subscribeToReviewsChanges } from "../../data/reviews";
import { subscribeToReportsChanges } from "../../data/reports";

import {
  getCurrentUser
} from "../../data/user";

import RideCard from "../../components/rideCard";
import BusAlternatives from "../../components/BusAlternatives";
import AddressAutocomplete from "../../components/AddressAutocomplete";

import { components } from "../../styles/components";
import { forms } from "../../styles/forms";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";
import { sortByDateAsc } from "../../utils/date";
import { FilterCriteria, filterRides } from "../../utils/rideFilters";
import { type Coordinates } from "../../utils/routing";


export default function Home() {

  const router = useRouter();

  const [rides, setRides] =
    useState(getRides());

  const [user, setUser] =
    useState(getCurrentUser());

  const [originFilter, setOriginFilter] =
    useState("");

  const [originCoords, setOriginCoords] =
    useState<Coordinates | null>(null);

  const [destinationFilter, setDestinationFilter] =
    useState("");

  const [destinationCoords, setDestinationCoords] =
    useState<Coordinates | null>(null);

  const [dateFilter, setDateFilter] =
    useState("");

  const [womenOnlyFilter, setWomenOnlyFilter] =
    useState(false);

  const [minSeats, setMinSeats] =
    useState("");

  const [now, setNow] =
    useState(new Date());

  const [showBusAlternatives, setShowBusAlternatives] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      setRides([...getRides()]);
      setUser(getCurrentUser());
    }, [])
  );

  useEffect(() => {
    const triggerRender = () => {
      setNow(new Date());
      setRides([...getRides()]);
    };

    const unsubRides = subscribeToRidesChanges(triggerRender);
    const unsubReviews = subscribeToReviewsChanges(triggerRender);
    const unsubReports = subscribeToReportsChanges(triggerRender);

    const interval =
      setInterval(() => {
        removeEmptyPastRides();
        triggerRender();
      }, 10000);
    return () => {
      unsubRides();
      unsubReviews();
      unsubReports();
      clearInterval(interval);
    };
  }, []);

  if (!user) return null;

  const filters: FilterCriteria = {
    origin: originFilter,
    destination: destinationFilter,
    date: dateFilter,
    womenOnly: womenOnlyFilter,
    minSeats: minSeats
  };

  const availableRides = sortByDateAsc(
    filterRides(rides, user, filters, now)
  );

  const filtersHeader = (
    <View>
      <Text style={layout.title}>
        Search rides
      </Text>

      <View style={[components.card, { backgroundColor: colors.neutral, borderColor: colors.neutralLight, borderWidth: 1.5 }]}>

        <Text style={layout.subtitle}>Origin</Text>

        <AddressAutocomplete
          placeholder="Origin"
          value={originFilter}
          onChangeText={(text) => { setOriginFilter(text); setOriginCoords(null); }}
          onSelect={(name, coords) => { setOriginFilter(name); setOriginCoords(coords); }}
          testID="searchOriginInput"
        />

        <View style={{ height: spacing.sm }} />

        <Text style={layout.subtitle}>Destination</Text>

        <AddressAutocomplete
          placeholder="Destination"
          value={destinationFilter}
          onChangeText={(text) => { setDestinationFilter(text); setDestinationCoords(null); }}
          onSelect={(name, coords) => { setDestinationFilter(name); setDestinationCoords(coords); }}
          testID="searchDestinationInput"
        />

        <View style={{ height: spacing.sm }} />

        <Text style={layout.subtitle}>
          Date
        </Text>

        <TextInput
          placeholder="ex: 30/03 or 30/03 14:00"
          placeholderTextColor={colors.textLight}
          value={dateFilter}
          onChangeText={setDateFilter}
          style={forms.input}
          testID="searchDateInput"
        />

        <View style={{ height: spacing.sm }} />

        <Text style={layout.subtitle}>
          Minimum seats
        </Text>

        <TextInput
          placeholder="1"
          placeholderTextColor={colors.textLight}
          value={minSeats}
          keyboardType="numeric"
          onChangeText={setMinSeats}
          style={forms.input}
          testID="searchMinSeatsInput"
        />

        {user.gender === "Female" && (

          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: spacing.sm
          }}>

            <Text style={layout.subtitle}>
              Women only
            </Text>

            <Switch
              value={womenOnlyFilter}
              onValueChange={setWomenOnlyFilter}
              testID="searchWomenOnlySwitch"
              trackColor={{
                false: "#bcbdc1",
                true: "#fbcfe8"
              }}
              thumbColor={
                womenOnlyFilter
                  ? colors.women
                  : "#8b8e91"
              }
            />

          </View>

        )}

      </View>
    </View>
  );

  const hasBothCoords = originCoords !== null && destinationCoords !== null;

  const emptyState = (
    <>
      <View style={components.card}>
        <Text
          style={{ color: colors.textLight }}
          testID="searchEmptyState"
        >
          No rides found
        </Text>
      </View>

      {
        <View style={[components.card, { borderColor: colors.primaryLight, borderWidth: 1.5 }]}>
          <Pressable
            onPress={() => setShowBusAlternatives(prev => !prev)}
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
          >
            <Text style={{ fontWeight: "700", fontSize: 15, color: colors.primary }}>
              🚌 Bus Alternatives
            </Text>
            <Text style={{ fontSize: 18, color: colors.primary, fontWeight: "600" }}>
              {showBusAlternatives ? "▲" : "▼"}
            </Text>
          </Pressable>

          {showBusAlternatives && (
            <View style={{ marginTop: spacing.sm }}>
              {!hasBothCoords ? (
                <View style={{
                  backgroundColor: colors.warningSoft,
                  borderRadius: 8,
                  padding: spacing.sm,
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: spacing.xs,
                  marginTop: spacing.xs,
                }}>
                  <Text style={{ fontSize: 15 }}>⚠️</Text>
                  <Text style={{ color: colors.text, fontSize: 13, flex: 1, lineHeight: 18 }}>
                    To see bus alternatives, please select a specific address from the suggestions for{" "}
                    {!originCoords ? "Origin" : ""}
                    {!originCoords && !destinationCoords ? " and " : ""}
                    {!destinationCoords ? "Destination" : ""}.
                  </Text>
                </View>
              ) : (
                <BusAlternatives
                  origin={originFilter}
                  destination={destinationFilter}
                  originCoords={originCoords}
                  destinationCoords={destinationCoords}
                />
              )}
            </View>
          )}
        </View>
      }
    </>
  );


  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
      data={availableRides}
      keyExtractor={i => i.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={filtersHeader}
      ListEmptyComponent={emptyState}
      renderItem={({ item }) => (
        <View style={{ marginBottom: spacing.md }}>
          <RideCard
            ride={item}
            onPress={() => router.push(`/ride/${item.id}`)}
          />
        </View>
      )}
    />
  );

}
