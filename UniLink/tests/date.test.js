import {
  formatDate,
  sortByDateAsc,
  sortByDateDesc
} from "../utils/date";

describe("Date Utilities", () => {
  test("formatDate uses DD/MM/YYYY HH:mm format", () => {
    const isoString = "2026-05-01T14:30:00.000Z";
    const result = formatDate(isoString);
    
    // Note: formatDate uses local time, so we check for components
    // rather than the exact string to avoid timezone issues in CI
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
  });

  test("sortByDateAsc sorts correctly", () => {
    const rides = [
      { departureDateTime: "2026-05-01T10:00:00.000Z" },
      { departureDateTime: "2026-01-01T10:00:00.000Z" },
      { departureDateTime: "2026-03-01T10:00:00.000Z" }
    ];

    const sorted = sortByDateAsc(rides);
    expect(sorted[0].departureDateTime).toBe("2026-01-01T10:00:00.000Z");
    expect(sorted[1].departureDateTime).toBe("2026-03-01T10:00:00.000Z");
    expect(sorted[2].departureDateTime).toBe("2026-05-01T10:00:00.000Z");
  });

  test("sortByDateDesc sorts correctly", () => {
    const rides = [
      { departureDateTime: "2026-01-01" },
      { departureDateTime: "2026-05-01" }
    ];

    const sorted = sortByDateDesc(rides);
    expect(sorted[0].departureDateTime).toBe("2026-05-01");
  });

  test("sortByDate handles empty arrays", () => {
    expect(sortByDateAsc([])).toEqual([]);
    expect(sortByDateDesc([])).toEqual([]);
  });
});
