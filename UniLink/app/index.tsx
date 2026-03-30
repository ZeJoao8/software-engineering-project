import {

 View,
 Text,
 Button,
 StyleSheet

} from "react-native";

import { useRouter } from "expo-router";

import {

 getUsers,
 switchUser

} from "../data/user";

export default function SelectUser() {

 const router = useRouter();

 const users = getUsers();

 function chooseUser(id: string) {

  switchUser(id);

  router.replace("/(tabs)/searchRide");

 }

 return (

  <View style={styles.container}>

   <Text style={styles.title}>

    Select Profile

   </Text>

   {users.map(user => (

    <Button

     key={user.id}

     title={`${user.name} (${user.gender})`}

     onPress={() => chooseUser(user.id)}

    />

   ))}

  </View>

 );

}

const styles = StyleSheet.create({

 container: {

  flex: 1,

  justifyContent: "center",

  padding: 20,

  gap: 10

 },

 title: {

  fontSize: 22,

  fontWeight: "bold",

  marginBottom: 20

 }

});