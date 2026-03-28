import { User } from "../types/User";

let currentUser: User = {

 id: "1",

 name: "José",

 university: "FEUP",

 gender: "male"

};

export function getCurrentUser() {
 return currentUser;
}

export function updateUser(user: User) {
 currentUser = user;
}