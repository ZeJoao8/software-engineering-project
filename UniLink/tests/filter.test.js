test("filters women only rides", () => {

 const rides = [

  { womenOnly:true },

  { womenOnly:false }

 ];

 const filtered =
  rides.filter(r => r.womenOnly);

 expect(filtered.length)
  .toBe(1);

});

test("filters by minimum seats", () => {

 const rides = [

  { availableSeats:1 },

  { availableSeats:3 }

 ];

 const filtered =
  rides.filter(r =>
   r.availableSeats >= 2
  );

 expect(filtered.length)
  .toBe(1);

});