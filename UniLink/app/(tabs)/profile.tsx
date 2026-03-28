import { useState } from "react";

import {

 View,
 Text,
 TextInput,
 Button,
 StyleSheet

} from "react-native";

import {

 getCurrentUser,
 updateUser

} from "../../data/user";

export default function Profile() {

 const user = getCurrentUser();

 const [name, setName] = useState(user.name);

 const [gender, setGender] =
  useState(user.gender);

 function saveProfile() {

  updateUser({

   ...user,
   name,
   gender

  });

  alert("Profile saved");

 }

 return (

  <View style={styles.container}>

   <Text style={styles.title}>
    Profile
   </Text>

   <TextInput

    value={name}

    onChangeText={setName}

    placeholder="Name"

    style={styles.input}

   />

   <Text>
    Gender:
   </Text>

   <Button
    title="Male"
    onPress={() => setGender("male")}
   />

   <Button
    title="Female"
    onPress={() => setGender("female")}
   />

   <Text>
    Selected: {gender}
   </Text>

   <Button
    title="Save"
    onPress={saveProfile}
   />

  </View>

 );

}

const styles = StyleSheet.create({

 container: {

  flex: 1,
  padding: 20,
  gap: 10

 },

 title: {

  fontSize: 20,
  fontWeight: "bold"

 },

 input: {

  borderWidth: 1,
  padding: 10,
  borderRadius: 5

 }

});