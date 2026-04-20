import {
  FlatList,
  Switch,
  Text,
  TextInput,
  View
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

import { components } from "../../styles/components";
import { forms } from "../../styles/forms";
import { layout } from "../../styles/layout";
import { colors, spacing } from "../../styles/theme";
import { sortByDateAsc } from "../../utils/date";
import { FilterCriteria, filterRides } from "../../utils/rideFilters";


export default function Home() {

  const router = useRouter();

  const [rides, setRides] =
    useState(getRides());

  const [user, setUser] =
    useState(getCurrentUser());

  const [originFilter, setOriginFilter] =
    useState("");

  const [destinationFilter, setDestinationFilter] =
    useState("");

  const [dateFilter, setDateFilter] =
    useState("");

  const [womenOnlyFilter, setWomenOnlyFilter] =
    useState(false);

  const [minSeats, setMinSeats] =
    useState("");

  const [now, setNow] =
    useState(new Date());

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


  return (

    <View style={layout.screen}>

      <Text style={layout.title}>
        Search rides
      </Text>


      {/* FILTERS */}
      <View style={[components.card, { backgroundColor: colors.neutral, borderColor: colors.neutralLight, borderWidth: 1.5 }]}>

        <Text style={layout.subtitle}>
          Origin
        </Text>

        <TextInput
          placeholder="Origin"
          placeholderTextColor={colors.textLight}
          value={originFilter}
          onChangeText={setOriginFilter}
          style={forms.input}
          testID="searchOriginInput"
        />


        <View style={{ height: spacing.sm }} />

        <Text style={layout.subtitle}>
          Destination
        </Text>

        <TextInput
          placeholder="Destination"
          placeholderTextColor={colors.textLight}
          value={destinationFilter}
          onChangeText={setDestinationFilter}
          style={forms.input}
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



      {/* RESULTS */}

      {availableRides.length === 0 ? (

        <View style={components.card}>

          <Text
            style={{ color: colors.textLight }}
            testID="searchEmptyState"
          >
            No rides found
          </Text>

        </View>

      ) : (

        <FlatList
          data={availableRides}

          keyExtractor={i => i.id}

          contentContainerStyle={{
            paddingBottom: spacing.xl
          }}

          renderItem={({ item }) => (

            <View style={{ marginBottom: spacing.md }}>

              <RideCard
                ride={item}

                onPress={() =>
                  router.push(`/ride/${item.id}`)
                }
              />

            </View>

          )}

        />

      )}

    </View>

  );
}
