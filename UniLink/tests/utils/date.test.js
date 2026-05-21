import { formatDate, sortByDateAsc, sortByDateDesc } from "../../utils/date";

describe("formatDate", () => {
  test("formats in DD/MM/YYYY HH:mm pattern", () => {
    expect(formatDate("2026-05-01T14:30:00.000Z")).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
  });
});

describe("sortByDateAsc", () => {
  const rides = [
    { departureDateTime: "2026-05-01T10:00:00.000Z" },
    { departureDateTime: "2026-01-01T10:00:00.000Z" },
    { departureDateTime: "2026-03-01T10:00:00.000Z" },
  ];

  test("sorts from earliest to latest", () => {
    const sorted = sortByDateAsc(rides);
    expect(sorted[0].departureDateTime).toBe("2026-01-01T10:00:00.000Z");
    expect(sorted[2].departureDateTime).toBe("2026-05-01T10:00:00.000Z");
  });

  test("handles empty array", () => {
    expect(sortByDateAsc([])).toEqual([]);
  });
});

describe("sortByDateDesc", () => {
  test("sorts from latest to earliest", () => {
    const rides = [
      { departureDateTime: "2026-01-01" },
      { departureDateTime: "2026-05-01" },
    ];
    expect(sortByDateDesc(rides)[0].departureDateTime).toBe("2026-05-01");
  });

  test("handles empty array", () => {
    expect(sortByDateDesc([])).toEqual([]);
  });
});
