import { Alert } from "react-native";
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

let currentUserId: string | null = null;

export function getUsers(){
 return users;
}

export function getCurrentUser(){
 if(!currentUserId) return null;
 return users.find(
  u => u.email === currentUserId
 ) ?? null;
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
 gender:"Male"|"Female"
){

 const normalizedEmail =
  email.toLowerCase().trim();


 const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


 if(!emailRegex.test(normalizedEmail)){
  Alert.alert(
   "Error",
   "Invalid email format"
  );
  return null;
 }

 const exists =
  users.some(
   u => u.email === normalizedEmail
  );

 if(exists){
  Alert.alert(
   "Error",
   "Email already exists"
  );
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
 currentUserId = null;
}

export function updateUser(updatedUser:User){
 const index =
  users.findIndex(
   u => u.email === updatedUser.email
  );
 if(index !== -1){
  users[index] = updatedUser;
 }
}