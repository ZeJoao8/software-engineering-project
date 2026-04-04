import { render } from "@testing-library/react-native";
import RideCard from "../components/rideCard";

const ride = {
 id:"1",
 origin:"FEUP",
 destination:"Boavista",
 departureDateTime:new Date().toISOString(),
 availableSeats:2,
 totalSeats:3,
 womenOnly:false,
 completed:false
};

test("renders route", () => {

 const { getByText } =
  render(
   <RideCard
    ride={ride}
    onPress={()=>{}}
   />
  );

 expect(
  getByText("FEUP → Boavista")
 ).toBeTruthy();

});

test("shows women only label", () => {

 const { getByText } =
  render(
   <RideCard
    ride={{
     ...ride,
     womenOnly:true
    }}
    onPress={()=>{}}
   />
  );

 expect(
  getByText("women only")
 ).toBeTruthy();

});