import { colors } from "../styles/theme";
import type { RatingFilter } from "../domain/rules/myRidesFilters";

export function getFeedbackStyle(rating: number) {
  if (rating >= 4) return { backgroundColor: colors.primarySoft, borderLeftColor: colors.primaryLight };
  if (rating === 3) return { backgroundColor: colors.warning, borderLeftColor: "#fde047" };
  return { backgroundColor: colors.warningSoft, borderLeftColor: colors.dangerSoft };
}

export function ratingBackground(rating: number): string {
  if (rating >= 4) return colors.primaryLight;
  if (rating === 3) return colors.warning;
  return colors.dangerSoft;
}

export const RATING_ACTIVE_COLORS: Record<RatingFilter, { bg: string; text: string }> = {
  "none": { bg: colors.neutralDark,  text: colors.text },
  "1-2":  { bg: colors.dangerSoft,   text: colors.danger },
  "3":    { bg: colors.warning,      text: colors.text },
  "4-5":  { bg: colors.primaryLight, text: colors.primaryDark },
};
