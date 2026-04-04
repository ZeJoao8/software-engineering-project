test("origin must differ from destination", () => {

 const origin = "FEUP";
 const destination = "Boavista";

 expect(origin !== destination)
  .toBe(true);

});

test("seats must be integer", () => {

 const seats = "2";

 expect(
  Number.isInteger(Number(seats))
 ).toBe(true);

});

test("at least 1 seat", () => {

 const seats = 1;

 expect(seats >= 1)
  .toBe(true);

});