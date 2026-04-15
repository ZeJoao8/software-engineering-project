import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
} from "react-native-maps";

import {
  useRouter,
  useFocusEffect,
} from "expo-router";

import {
  getRides,
  subscribeToRidesChanges
} from "../../data/rides";

import { getCurrentUser } from "../../data/user";

import {
  getRoute,
  type RouteResult,
} from "../../utils/routing";

import {
  filterRides,
  FilterCriteria
} from "../../utils/rideFilters";

import {
  sortByDateAsc,
  formatDate
} from "../../utils/date";

import {
  colors,
  spacing,
  radius
} from "../../styles/theme";

import type { Ride } from "../../types/Ride";


// default region (FEUP)
const FEUP_REGION = {
  latitude: 41.1780,
  longitude: -8.5980,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};


export default function MapViewScreen() {

  const router = useRouter();

  const mapRef = React.useRef<MapView>(null);

  const [rides, setRides] =
    useState<Ride[]>([]);

  const [selectedRide, setSelectedRide] =
    useState<Ride | null>(null);

  const [route, setRoute] =
    useState<RouteResult | null>(null);

  const [loadingRoute, setLoadingRoute] =
    useState(false);

  const [now, setNow] =
    useState(new Date());


  // SAME FILTER AS SEARCH TAB
  function computeFilteredRides() {

    const user = getCurrentUser();
    if (!user) return [];

    const filters: FilterCriteria = {
      origin: "",
      destination: "",
      date: "",
      womenOnly: false,
      minSeats: ""
    };

    return sortByDateAsc(
      filterRides(
        getRides(),
        user,
        filters,
        new Date()
      )
    ).filter(
      r =>
        r.originCoords &&
        r.destinationCoords
    );

  }


  // refresh when tab opens
  useFocusEffect(
    useCallback(() => {

      setRides(
        computeFilteredRides()
      );

      setSelectedRide(null);
      setRoute(null);

    }, [])
  );


  // realtime updates
  useEffect(() => {

    const unsubscribe =
      subscribeToRidesChanges(() => {

        setNow(new Date());

        setRides(
          computeFilteredRides()
        );

      });

    return unsubscribe;

  }, []);



  async function selectRide(ride: Ride) {

    setSelectedRide(ride);

    setRoute(null);

    if (
      ride.originCoords &&
      ride.destinationCoords
    ) {

      setLoadingRoute(true);

      const result =
        await getRoute(
          ride.originCoords,
          ride.destinationCoords
        );

      setRoute(result);

      setLoadingRoute(false);


      // AUTO ZOOM TO ROUTE
      if (mapRef.current) {

        mapRef.current.fitToCoordinates(
          [
            ride.originCoords,
            ride.destinationCoords
          ],
          {
            edgePadding: {
              top: 120,
              right: 60,
              bottom: 260,
              left: 60
            },
            animated: true
          }
        );

      }

    }

  }


  function clearSelection() {

    setSelectedRide(null);

    setRoute(null);

  }


  return (

    <View style={styles.container}>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={FEUP_REGION}
        showsUserLocation
        showsMyLocationButton
        onPress={clearSelection}
      >

        {rides.map(ride => (

          <React.Fragment key={ride.id}>

            {/* origin */}
            <Marker
              coordinate={ride.originCoords!}

              pinColor={
                selectedRide?.id === ride.id
                  ? colors.primary
                  : "#22c55e"
              }

              opacity={
                selectedRide &&
                selectedRide.id !== ride.id
                  ? 0.35
                  : 1
              }

              onSelect={() =>
                selectRide(ride)
              }
            />


            {/* destination */}
            <Marker
              coordinate={ride.destinationCoords!}

              pinColor={
                selectedRide?.id === ride.id
                  ? "#ef4444"
                  : "#f87171"
              }

              opacity={
                selectedRide &&
                selectedRide.id !== ride.id
                  ? 0.35
                  : 1
              }

              onSelect={() =>
                selectRide(ride)
              }
            />

          </React.Fragment>

        ))}


        {/* route line */}
        {route && selectedRide && (

          <Polyline
            coordinates={
              route.coordinates
            }

            strokeColor={
              colors.primary
            }

            strokeWidth={4}
          />

        )}

      </MapView>



      {/* ride counter */}
      <View style={styles.badge}>

        <Text style={styles.badgeText}>

          {rides.length}
          {" "}
          ride
          {rides.length !== 1 && "s"}

        </Text>

      </View>



      {/* ride info card */}
      {selectedRide && (

        <View style={styles.rideCard}>

          <View style={styles.cardHeader}>

            <Text style={styles.cardRoute}>

              {selectedRide.origin}
              {" → "}
              {selectedRide.destination}

            </Text>

            <Pressable
              onPress={clearSelection}
            >

              <Text style={styles.closeButton}>
                ✕
              </Text>

            </Pressable>

          </View>



          <Text style={styles.cardDate}>

            {formatDate(
              selectedRide.departureDateTime
            )}

          </Text>



          <View style={styles.cardMeta}>

            <Text style={styles.metaText}>

              {selectedRide.availableSeats}
              {" seats"}

            </Text>


            {route && (

              <>

                <Text style={styles.metaDot}>
                  •
                </Text>

                <Text style={styles.metaText}>
                  {route.distanceKm} km
                </Text>

                <Text style={styles.metaDot}>
                  •
                </Text>

                <Text style={styles.metaText}>
                  ~{route.durationMin} min
                </Text>

              </>

            )}


            {loadingRoute && (

              <Text style={styles.metaText}>
                calculating route...
              </Text>

            )}


            {selectedRide.womenOnly && (

              <>
                <Text style={styles.metaDot}>
                  •
                </Text>

                <Text
                  style={[
                    styles.metaText,
                    {
                      color:
                        colors.women
                    }
                  ]}
                >

                  Women only

                </Text>

              </>

            )}

          </View>



          <Pressable
            style={styles.detailButton}

            testID="mapRideDetailButton"

            onPress={() =>
              router.push(
                `/ride/${selectedRide.id}`
              )
            }
          >

            <Text style={styles.detailButtonText}>

              View details

            </Text>

          </Pressable>

        </View>

      )}

    </View>

  );

}



const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  badge: {

    position: "absolute",

    top: 12,

    alignSelf: "center",

    backgroundColor:
      "rgba(255,255,255,0.95)",

    paddingHorizontal: 14,

    paddingVertical: 6,

    borderRadius: 20,

    elevation: 3,
  },

  badgeText: {

    fontSize: 13,

    fontWeight: "600",

    color: colors.text,
  },


  rideCard: {

    position: "absolute",

    bottom: 24,

    left: 16,

    right: 16,

    backgroundColor: "white",

    borderRadius: radius.lg,

    padding: spacing.lg,

    elevation: 6,

    borderWidth: 1,

    borderColor: colors.border,
  },


  cardHeader: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",
  },


  cardRoute: {

    fontSize: 17,

    fontWeight: "700",

    color: colors.text,

    flex: 1,

    marginRight: 8,
  },


  closeButton: {

    fontSize: 18,

    color: colors.textLight,

    fontWeight: "600",

    padding: 4,
  },


  cardDate: {

    fontSize: 14,

    color: colors.textLight,

    marginTop: 4,

    marginBottom: 8,
  },


  cardMeta: {

    flexDirection: "row",

    flexWrap: "wrap",

    alignItems: "center",

    gap: 4,

    marginBottom: spacing.md,
  },


  metaText: {

    fontSize: 13,

    color: colors.primary,

    fontWeight: "600",
  },


  metaDot: {

    color: colors.textLight,

    fontSize: 13,
  },


  detailButton: {

    backgroundColor: colors.primary,

    paddingVertical: 11,

    borderRadius: radius.md,

    alignItems: "center",
  },


  detailButtonText: {

    color: "white",

    fontWeight: "700",

    fontSize: 15,
  },

});