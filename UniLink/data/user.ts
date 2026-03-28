import { User } from "../types/User";

const users: User[] = [

 {
  id: "1",
  name: "João",
  university: "FEUP",
  course: "LEIC",
  gender: "male"
 },

 {
  id: "2",
  name: "Maria",
  university: "FEUP",
  course: "LEIC",
  gender: "female"
 }

];

let currentUserId = "1";

export function getUsers() {

 return users;

}

export function getCurrentUser() {

 return users.find(
  u => u.id === currentUserId
 )!;

}

export function switchUser(id: string) {

 currentUserId = id;

}

export function updateUser(updatedUser: User) {

 const index =
  users.findIndex(
   u => u.id === updatedUser.id
  );

 users[index] = updatedUser;

}