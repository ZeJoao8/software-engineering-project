import { Car } from "../types/Car";

let cars: Car[] = [

 {
  id: "1",
  model: "Toyota Corolla",
  color: "White",
  licensePlate: "AA-00-11",
  seatCapacity: 5,
  ownerId: "1"
 },

 {
  id: "2",
  model: "Honda Civic",
  color: "Black",
  licensePlate: "BB-22-33",
  seatCapacity: 5,
  ownerId: "2"
 }

];

export function getCars() {

 return cars;

}

export function getUserCars(userId: string) {

 return cars.filter(

  c => c.ownerId === userId

 );

}

export function addCar(car: Car) {

 cars = [...cars, car];

}