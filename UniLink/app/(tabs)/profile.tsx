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
 updateUser,
 getUsers,
 switchUser
} from "../../data/user";

export default function Profile() {

 const [user, setUser] =
  useState(getCurrentUser());

 function saveProfile() {

  updateUser(user);

  setUser({
   ...user
  });

  alert("Profile saved");

 }

 function changeUser(id: string) {

  switchUser(id);

  setUser(
   getCurrentUser()
  );

 }

 function updateField(
  field: string,
  value: string
 ) {

  setUser({

   ...user,

   [field]: value

  });

 }

 return (

  <View style={styles.container}>

   <Text style={styles.title}>
    Profile
   </Text>

   <TextInput
    value={user.name}
    onChangeText={(text) =>
     updateField("name", text)
    }
    placeholder="Name"
    style={styles.input}
   />

   <TextInput
    value={user.course}
    onChangeText={(text) =>
     updateField("course", text)
    }
    placeholder="Course"
    style={styles.input}
   />

   <Text>
    Gender: {user.gender}
   </Text>

   <Text>
    University: {user.university}
   </Text>

   <Button
    title="Save profile"
    onPress={saveProfile}
   />

   <Text style={{ marginTop: 20 }}>
    Switch profile
   </Text>

   {getUsers().map(u => (

    <Button
     key={u.id}
     title={`${u.name} (${u.gender})`}
     onPress={() => changeUser(u.id)}
    />

   ))}

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