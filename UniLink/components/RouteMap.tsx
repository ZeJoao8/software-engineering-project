import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { colors } from '../styles/theme';
import { getRouteDirections, Coordinate } from '../utils/location';

interface RouteMapProps {
  origin?: Coordinate;
  destination?: Coordinate;
  originName?: string;
  destinationName?: string;
  style?: any;
}

export default function RouteMap({
  origin,
  destination,
  originName = "Start",
  destinationName = "End",
  style
}: RouteMapProps) {
  const mapRef = useRef<MapView>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);

  useEffect(() => {
    async function fetchRoute() {
      if (origin && destination) {
        const route = await getRouteDirections(origin, destination);
        setRouteCoordinates(route);
      } else {
        setRouteCoordinates([]);
      }
    }
    fetchRoute();
  }, [origin, destination]);

  useEffect(() => {
    if (mapRef.current && (origin || destination)) {
      const coords = routeCoordinates.length > 0 ? routeCoordinates : [origin, destination].filter(Boolean) as Coordinate[];
      
      if (coords.length > 0) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [routeCoordinates, origin, destination]);

  const initialLat = origin?.latitude || destination?.latitude || 41.1780;
  const initialLng = origin?.longitude || destination?.longitude || -8.5980;

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: initialLat,
          longitude: initialLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        {origin && (
          <Marker 
            coordinate={origin} 
            title={originName} 
            pinColor={colors.primary}
          />
        )}
        {destination && (
          <Marker 
            coordinate={destination} 
            title={destinationName} 
            pinColor={colors.danger}
          />
        )}
        {routeCoordinates.length > 0 ? (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.primary}
            strokeWidth={4}
          />
        ) : origin && destination ? (
          <Polyline
            coordinates={[origin, destination]}
            strokeColor={colors.primary}
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
