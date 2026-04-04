import {
 formatDate,
 sortByDateAsc,
 sortByDateDesc
} from "../utils/date";

test("formatDate returns string", () => {

 const result =
  formatDate(
   new Date().toISOString()
  );

 expect(typeof result)
  .toBe("string");

});

test("sort ascending", () => {

 const rides = [

  {
   departureDateTime:"2026-05-01"
  },

  {
   departureDateTime:"2026-01-01"
  }

 ];

 const sorted =
  sortByDateAsc(rides);

 expect(
  sorted[0].departureDateTime
 ).toBe("2026-01-01");

});

test("sort descending", () => {

 const rides = [

  {
   departureDateTime:"2026-01-01"
  },

  {
   departureDateTime:"2026-05-01"
  }

 ];

 const sorted =
  sortByDateDesc(rides);

 expect(
  sorted[0].departureDateTime
 ).toBe("2026-05-01");

});