import type { DriverPreferences } from "./DriverPreferences";
export interface User {

 uid: string;

 name: string;

 university: string;

 course: string;

 gender: "Male" | "Female";

 email: string;

 emergencyContacts?: { name: string; phone: string }[];

 driverPreferences?: DriverPreferences;

}
