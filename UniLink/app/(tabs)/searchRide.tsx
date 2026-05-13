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
      <View style={components.rowSpaceBetween}>
        <Text style={layout.title}>Search rides</Text>
        <Pressable
          onPress={() => router.push("/mapView")}
          testID="openMapButton"
          style={[components.badgePrimary, { paddingVertical: 6 }]}
        >
          <Text style={components.badgePrimaryText}>🗺️ Search on Map</Text>
        </Pressable>
      </View>

      <View style={[components.card, components.cardNeutral]}>

        <Text style={layout.subtitle}>Origin</Text>

        <AddressAutocomplete
          placeholder="Origin"
          value={originFilter}
          onChangeText={(text) => { setOriginFilter(text); setOriginCoords(null); }}
          onSelect={(name, coords) => { setOriginFilter(name); setOriginCoords(coords); }}
          testID="searchOriginInput"
        />

        <View style={components.spacerSm} />

        <Text style={layout.subtitle}>Destination</Text>

        <AddressAutocomplete
          placeholder="Destination"
          value={destinationFilter}
          onChangeText={(text) => { setDestinationFilter(text); setDestinationCoords(null); }}
          onSelect={(name, coords) => { setDestinationFilter(name); setDestinationCoords(coords); }}
          testID="searchDestinationInput"
        />

        <View style={components.spacerSm} />

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

        <View style={components.spacerSm} />

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

          <View style={[components.rowSpaceBetween, { marginTop: spacing.sm }]}>

            <Text style={layout.subtitle}>
              Women only
            </Text>

            <Switch
              value={womenOnlyFilter}
              onValueChange={setWomenOnlyFilter}
              testID="searchWomenOnlySwitch"
              trackColor={{
                false: colors.switchTrackOff,
                true: colors.switchTrackOn,
              }}
              thumbColor={
                womenOnlyFilter
                  ? colors.women
                  : colors.switchThumbOff
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
        <Text style={layout.textLight} testID="searchEmptyState">
          No rides found
        </Text>
      </View>

      {
        <View style={components.card}>
          <Pressable
            onPress={() => setShowBusAlternatives(prev => !prev)}
            style={components.rowSpaceBetween}
          >
            <Text style={[layout.headingSm, { color: colors.textLight }]}>
              🚌 Bus Alternatives
            </Text>
            <Text style={layout.collapseIndicator}>
              {showBusAlternatives ? "Hide ▲" : "Show ▼"}
            </Text>
          </Pressable>

          {showBusAlternatives && (
            <View style={components.mtMd}>
              {!hasBothCoords ? (
                <View style={components.infoBox}>
                  <Text>⚠️</Text>
                  <Text style={components.infoBoxText}>
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
