import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
} from "react-native-maps";

import * as Location from "expo-location";

import {
  useRouter,
  useFocusEffect,
} from "expo-router";

import {
  getRides,
  subscribeToRidesChanges,
} from "../data/rides";

import { getCurrentUser } from "../data/user";

import {
  getRoute,
  type RouteResult,
} from "../utils/routing";

import {
  filterRides,
  FilterCriteria,
} from "../utils/rideFilters";

import {
  sortByDateAsc,
  formatDate,
} from "../utils/date";

import { colors } from "../styles/theme";
import { layout } from "../styles/layout";
import { mapStyles } from "../styles/map";

import type { Ride } from "../domain/entities/Ride";
import ZoomControls from "../components/ZoomControls";


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



  useEffect(() => {
    void (async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") return;

        const location =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

        mapRef.current?.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      } catch {
        // Permission denied or unavailable — stay on FEUP_REGION
      }
    })();
  }, []);


  function computeFilteredRides() {

    const user = getCurrentUser();
    if (!user) return [];

    const filters: FilterCriteria = {
      origin: "",
      destination: "",
      date: "",
      womenOnly: false,
      minSeats: "",
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


  useFocusEffect(
    useCallback(() => {

      setRides(
        computeFilteredRides()
      );

      setSelectedRide(null);
      setRoute(null);

    }, [])
  );


  useEffect(() => {

    const unsubscribe =
      subscribeToRidesChanges(() => {

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


      if (mapRef.current) {

        mapRef.current.fitToCoordinates(
          [
            ride.originCoords,
            ride.destinationCoords,
          ],
          {
            edgePadding: {
              top: 120,
              right: 60,
              bottom: 260,
              left: 60,
            },
            animated: true,
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

    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

      {/* HEADER */}
      <View style={layout.screenHeader}>
        <Pressable onPress={() => router.back()} testID="mapBackButton">
          <Text style={layout.link}>← Back</Text>
        </Pressable>
        <Text style={mapStyles.badgeText}>
          {rides.length} ride{rides.length !== 1 && "s"}
        </Text>
      </View>

      <View style={mapStyles.container}>

      <MapView
        ref={mapRef}
        style={mapStyles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={FEUP_REGION}
        showsUserLocation
        showsMyLocationButton
        onPress={clearSelection}
      >

        {rides.map(ride => (

          <React.Fragment key={ride.id}>

            <Marker
              coordinate={ride.originCoords!}

              pinColor={
                selectedRide?.id === ride.id
                  ? colors.primary
                  : colors.accent
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


            <Marker
              coordinate={ride.destinationCoords!}

              pinColor={
                selectedRide?.id === ride.id
                  ? colors.danger
                  : colors.dangerSoft
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



      {/* ZOOM BUTTONS */}
      <ZoomControls
        mapRef={mapRef}
        style={{
          position: "absolute",
          right: 16,
          bottom: "50%",
        }}
      />



      {selectedRide && (

        <View style={mapStyles.rideCard}>

          <View style={mapStyles.cardHeader}>

            <Text style={mapStyles.cardRoute}>

              {selectedRide.origin}
              {" → "}
              {selectedRide.destination}

            </Text>

            <Pressable
              onPress={clearSelection}
            >

              <Text style={mapStyles.closeButton}>
                ✕
              </Text>

            </Pressable>

          </View>



          <Text style={mapStyles.cardDate}>

            {formatDate(
              selectedRide.departureDateTime
            )}

          </Text>



          <View style={mapStyles.cardMeta}>

            <Text style={mapStyles.metaText}>

              {selectedRide.availableSeats}
              {" seats"}

            </Text>


            {route && (

              <>

                <Text style={mapStyles.metaDot}>
                  •
                </Text>

                <Text style={mapStyles.metaText}>
                  {route.distanceKm} km
                </Text>

                <Text style={mapStyles.metaDot}>
                  •
                </Text>

                <Text style={mapStyles.metaText}>
                  ~{route.durationMin} min
                </Text>

              </>

            )}


            {loadingRoute && (

              <Text style={mapStyles.metaText}>
                calculating route...
              </Text>

            )}


            {selectedRide.womenOnly && (

              <>
                <Text style={mapStyles.metaDot}>
                  •
                </Text>

                <Text
                  style={[
                    mapStyles.metaText,
                    { color: colors.women },
                  ]}
                >

                  Women only

                </Text>

              </>

            )}

          </View>



          <Pressable
            style={mapStyles.detailButton}
            testID="mapRideDetailButton"
            onPress={() =>
              router.push(
                `/ride/${selectedRide.id}`
              )
            }
          >

            <Text style={mapStyles.detailButtonText}>
              View details
            </Text>

          </Pressable>

        </View>

      )}

    </View>

    </SafeAreaView>

  );

}
