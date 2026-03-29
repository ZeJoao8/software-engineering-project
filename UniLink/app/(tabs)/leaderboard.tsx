import { View, Text } from "react-native";
import { getRides } from "../../data/rides";
import { getUsers } from "../../data/user";

function calculateCO2Saved(rides) {

 // exemplo simples:
 // cada passageiro poupa 2kg CO2
 const co2PerPassenger = 2;

 const totals = {};

 rides.forEach(r => {

  r.passengers.forEach(p => {

   totals[p] =
    (totals[p] || 0)
    + co2PerPassenger;

  });

 });

 return totals;

}

export default function Leaderboard(){

 const rides = getRides();
 const users = getUsers();

 const totals =
  calculateCO2Saved(rides);

 const ranking =
  users
   .map(u => ({
    name: u.name,
    co2: totals[u.id] || 0
   }))
   .sort((a,b) => b.co2 - a.co2);

 if(ranking.every(u => u.co2 === 0)){

  return(
   <Text>
    No sustainability data yet.
   </Text>
  );

 }

 return(

  <View>

   <Text>
    Sustainability Leaderboard
   </Text>

   {ranking.map((u,i)=>(

    <Text key={i}>
     {i+1}. {u.name} {u.co2} kg CO₂
    </Text>

   ))}

  </View>

 );

}