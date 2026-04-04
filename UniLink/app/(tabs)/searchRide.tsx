import {
  View,
  Text,
  FlatList,
  TextInput,
  Switch
} from "react-native";

import {
  useRouter,
  useFocusEffect
} from "expo-router";

import {
  useState,
  useCallback,
  useEffect
} from "react";

import {
  getRides,
  removeEmptyPastRides,
  subscribeToRidesChanges
} from "../../data/rides";

import {
  getCurrentUser
} from "../../data/user";

import RideCard from "../../components/rideCard";

import { formatDate, sortByDateAsc } from "../../utils/date";
import { layout } from "../../styles/layout";
import { components } from "../../styles/components";
import { colors, spacing } from "../../styles/theme";
import { forms } from "../../styles/forms";
import { filterRides, FilterCriteria } from "../../utils/rideFilters";


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
    const unsubscribe =
      subscribeToRidesChanges(() => {
        setNow(new Date());
        setRides([...getRides()]);
      });

    const interval =
      setInterval(() => {
        removeEmptyPastRides();
        setNow(new Date());
        setRides([...getRides()]);
      }, 10000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if(!user) return null;

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
      <View style={components.card}>

        <Text style={layout.subtitle}>
          Origin
        </Text>

        <TextInput
          placeholder="Origin"
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
                false: "#d1d5db",
                true: "#fbcfe8"
              }}

              thumbColor={
                womenOnlyFilter
                  ? colors.women
                  : "#f9fafb"
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
