import { User } from "../types/User";

const users: User[] = [

 {
  name: "João",
  university: "FEUP",
  course: "LEIC",
  gender: "Male",
  email: "joao@feup.pt",
  password: "1234"
 },

 {
  name: "Maria",
  university: "FEUP",
  course: "LEIC",
  gender: "Female",
  email: "maria@feup.pt",
  password: "1234"
 }

];

let currentUserId = "1";

export function getUsers() {
 return users;
}

export function getCurrentUser() {
 return users.find(
  u => u.email === currentUserId
 )!;
}

export function loginUser(
 email:string,
 password:string
){
 const normalizedEmail =
  email.toLowerCase().trim();
 const user =
  users.find(
   u =>
    u.email === normalizedEmail &&
    u.password === password
  );
 if(user){
  currentUserId = user.email;
  return true;
 }
 return false;
}

export function registerUser(
 name:string,
 email:string,
 password:string,
 university:string,
 course:string,
 gender:"male"|"female"
){
 const normalizedEmail =
  email.toLowerCase().trim();
 const exists =
  users.some(
   u => u.email === normalizedEmail
  );
 if(exists){
  return null;
 }
 const newUser:User = {
  name,
  email: normalizedEmail,
  password,
  university,
  course,
  gender
 };
 users.push(newUser);
 currentUserId = newUser.email;
 return newUser;
}

export function logoutUser(){
 currentUserId = "";
}

export function updateUser(updatedUser: User) {
 const index =
  users.findIndex(
   u => u.email === updatedUser.email
  );
 users[index] = updatedUser;
}