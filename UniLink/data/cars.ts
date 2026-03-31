import { Car } from "../types/Car";

let cars: Car[] = [

 {
  id: "1",
  model: "Toyota Corolla",
  color: "White",
  licensePlate: "AA-00-11",
  seatCapacity: 5,
  ownerId: "joao@feup.pt"
 },

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

export function deleteCar(id:string){
 cars = cars.filter(
  c => c.id !== id
 );
}