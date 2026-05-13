import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from "react-native";

import {
  searchPlaces,
  type AddressSuggestion,
  type Coordinates,
} from "../utils/routing";

import { colors } from "../styles/theme";
import { forms } from "../styles/forms";
import { components } from "../styles/components";

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

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (text.trim().length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

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
    <View style={components.autocomplete}>

      <View style={components.autocompleteRow}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          value={value}
          maxLength={80}
          onChangeText={handleTextChange}
          style={[forms.input, { flex: 1 }]}
          testID={testID}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 0);
          }}
        />
        {loading && (
          <ActivityIndicator
            style={components.autocompleteLoader}
            size="small"
            color={colors.primary}
          />
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={components.suggestionsList}>

          {suggestions.map((item, index) => (
            <Pressable
              key={`${item.coords.latitude}-${item.coords.longitude}-${index}`}
              testID={testID ? `${testID}-suggestion-${index}` : undefined}
              style={({ pressed }) => [
                components.suggestionItem,
                index < suggestions.length - 1 && components.suggestionSeparator,
                pressed && components.suggestionHighlight,
              ]}
              onPress={() => handleSelect(item)}
            >

              <Text style={components.suggestionIconText}>📍</Text>

              <View style={components.suggestionTextGroup}>
                <Text
                  style={components.suggestionName}
                  numberOfLines={1}
                >
                  {item.shortName}
                </Text>
                <Text
                  style={components.suggestionDetail}
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
