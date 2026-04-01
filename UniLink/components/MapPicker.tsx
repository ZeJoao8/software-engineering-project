import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { colors, spacing } from '../styles/theme';
import { layout } from '../styles/layout';
import { components } from '../styles/components';

interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (coords: { latitude: number; longitude: number }) => void;
  initialLocation?: { latitude: number; longitude: number };
  title: string;
}

export default function MapPicker({
  visible,
  onClose,
  onSelect,
  initialLocation,
  title
}: MapPickerProps) {
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.latitude || 41.1780, // Default to FEUP
    longitude: initialLocation?.longitude || -8.5980,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [pickedLocation, setPickedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);

  const handlePress = (e: any) => {
    setPickedLocation(e.nativeEvent.coordinate);
  };

  const handleConfirm = () => {
    if (pickedLocation) {
      onSelect(pickedLocation);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.headerButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!pickedLocation}
          >
            <Text
              style={[
                styles.headerButton,
                !pickedLocation && { color: colors.textLight }
              ]}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={region}
            onPress={handlePress}
          >
            {pickedLocation && (
              <Marker coordinate={pickedLocation} title="Picked Location" />
            )}
          </MapView>

          <View style={styles.instruction}>
            <Text style={styles.instructionText}>
              Tap on the map to pick a location
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  headerButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  instruction: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    color: colors.text,
    fontWeight: '500',
  },
});
