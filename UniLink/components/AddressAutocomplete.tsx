import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from "react-native";

import {
  searchPlaces,
  type AddressSuggestion,
  type Coordinates,
} from "../utils/routing";

import { colors, spacing, radius } from "../styles/theme";
import { forms } from "../styles/forms";

interface AddressAutocompleteProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (name: string, coords: Coordinates) => void;
  testID?: string;
}

export default function AddressAutocomplete({
  placeholder,
  value,
  onChangeText,
  onSelect,
  testID,
}: AddressAutocompleteProps) {

  const [suggestions, setSuggestions] =
    useState<AddressSuggestion[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [showSuggestions, setShowSuggestions] =
    useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextChange = useCallback(
    (text: string) => {
      onChangeText(text);

      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (text.trim().length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Debounce 500ms to avoid spamming Nominatim
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        const results = await searchPlaces(text);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setLoading(false);
      }, 500);
    },
    [onChangeText]
  );

  function handleSelect(suggestion: AddressSuggestion) {
    onSelect(suggestion.shortName, suggestion.coords);
    setSuggestions([]);
    setShowSuggestions(false);
    Keyboard.dismiss();
  }

  return (
    <View style={styles.container}>

      <View style={styles.inputRow}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          value={value}
          maxLength={80}
          onChangeText={handleTextChange}
          style={[forms.input, styles.input]}
          testID={testID}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        {loading && (
          <ActivityIndicator
            style={styles.loader}
            size="small"
            color={colors.primary}
          />
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>

          {suggestions.map((item, index) => (
            <Pressable
              key={`${item.coords.latitude}-${item.coords.longitude}-${index}`}
              style={({ pressed }) => [
                styles.suggestionItem,
                index < suggestions.length - 1 && styles.suggestionBorder,
                pressed && styles.suggestionPressed,
              ]}
              onPress={() => handleSelect(item)}
            >

              <Text style={styles.suggestionIcon}>📍</Text>

              <View style={styles.suggestionText}>
                <Text
                  style={styles.suggestionName}
                  numberOfLines={1}
                >
                  {item.shortName}
                </Text>
                <Text
                  style={styles.suggestionDetail}
                  numberOfLines={1}
                >
                  {item.displayName}
                </Text>
              </View>

            </Pressable>
          ))}

        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    position: "relative",
    zIndex: 10,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
  },

  loader: {
    position: "absolute",
    right: 12,
  },

  suggestionsContainer: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginTop: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    overflow: "hidden",
  },

  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },

  suggestionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  suggestionPressed: {
    backgroundColor: colors.primarySoft,
  },

  suggestionIcon: {
    fontSize: 16,
  },

  suggestionText: {
    flex: 1,
  },

  suggestionName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  suggestionDetail: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 1,
  },

});
