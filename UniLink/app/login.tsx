import { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";

import DropDownPicker from "react-native-dropdown-picker";

import { layout } from "../styles/layout";
import { forms } from "../styles/forms";
import { components } from "../styles/components";
import { Button } from "../components/Button";
import { spacing, colors } from "../styles/theme";
import {
  areRequiredFieldsFilled,
  doPasswordsMatch,
  isPasswordStrong,
  isValidEmail,
  isUniversityEmail
} from "../domain/rules/validation";
import { useAuth } from "../hooks/useAuth";
import { login as authLogin, register as authRegister } from "../services/AuthService";


export default function Login() {

  const router = useRouter();
  const { user, isReady } = useAuth();

  const [registerMode, setRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [loading, setLoading] = useState(false);
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);

  const genderItems = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" }
  ];

  useEffect(() => {
    if (isReady && user) {
      router.replace("/(tabs)/searchRide");
    }
  }, [isReady, user, router]);


  async function login() {
    if (loading) return;
    setLoading(true);
    const result = await authLogin(email, password);
    setLoading(false);
    if (!result.ok) {
      Alert.alert("Login failed", result.error);
      return;
    }
    router.replace("/(tabs)/searchRide");
  }


  async function register() {
    if (loading) return;

    const fields = { name, email, password, university, course, confirmPassword };

    if (!areRequiredFieldsFilled(fields)) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid email", "Incorrect email format");
      return;
    }

    if (!isUniversityEmail(email)) {
      Alert.alert("Invalid email", "Email must be from @up.pt (e.g. up123456789@up.pt)");
      return;
    }

    if (!doPasswordsMatch(password, confirmPassword)) {
      Alert.alert("Passwords do not match", "Please confirm your password correctly");
      return;
    }

    if (!isPasswordStrong(password)) {
      Alert.alert("Weak password", "Password must have at least 8 characters");
      return;
    }

    setLoading(true);
    const result = await authRegister(name, email, password, university, course, gender);
    setLoading(false);
    if (!result.ok) {
      Alert.alert("Registration failed", result.error);
      return;
    }
    router.replace("/(tabs)/searchRide");
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }


  return (

    <SafeAreaView style={layout.screen}>
      <ScrollView
        style={layout.screen}
        contentContainerStyle={{
          justifyContent: "center",
          flexGrow: 1
        }}
      >


        <Text style={[
          layout.title,
          { textAlign: "center" }
        ]}
          testID="authScreenTitle"
        >
          UniLink 🌱
        </Text>



        <View style={components.card}>


          {registerMode && (

            <>

              <Text style={forms.label}>
                Name
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                style={forms.input}
                testID="registerNameInput"
              />


              <View style={components.spacerSm} />


              <Text style={forms.label}>
                University
              </Text>

              <TextInput
                value={university}
                onChangeText={setUniversity}
                style={forms.input}
                testID="registerUniversityInput"
              />


              <View style={components.spacerSm} />


              <Text style={forms.label}>
                Course
              </Text>

              <TextInput
                value={course}
                onChangeText={setCourse}
                style={forms.input}
                testID="registerCourseInput"
              />


              <View style={components.spacerSm} />


              <Text style={forms.label}>
                Gender
              </Text>


              <View style={components.pickerWrapper}>

                <DropDownPicker
                  open={genderDropdownOpen}
                  value={gender}
                  items={genderItems}

                  setOpen={setGenderDropdownOpen}
                  setValue={setGender}

                  placeholder="Select gender"
                  testID="genderPicker"

                  style={components.dropdown}

                  dropDownContainerStyle={
                    components.dropdownContainer
                  }

                  textStyle={components.dropdownText}

                  placeholderStyle={
                    components.dropdownPlaceholder
                  }

                  listMode="SCROLLVIEW"

                  scrollViewProps={{
                    nestedScrollEnabled: true
                  }}
                />

              </View>


              <View style={components.spacerSm} />

            </>

          )}



          <Text style={forms.label}>
            Email
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={forms.input}
            testID="loginEmailInput"
          />


          <View style={components.spacerSm} />


          <Text style={forms.label}>
            Password
          </Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={forms.input}
            testID="loginPasswordInput"
          />


          {registerMode && (

            <>

              <View style={components.spacerSm} />

              <Text style={forms.label}>
                Confirm password
              </Text>

              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={forms.input}
                testID="registerConfirmPasswordInput"
              />

            </>

          )}




          <View style={components.spacerMd} />


          <Button testID="authSubmitButton"
            onPress={registerMode ? register : login}
            label={loading
              ? "LOADING..."
              : registerMode
                ? "CREATE ACCOUNT"
                : "LOGIN"}
          />



          <View style={components.spacerSm} />


          <Button
            outline
            testID="authModeToggleButton"
            onPress={() => setRegisterMode(!registerMode)}
            label={registerMode
              ? "Already have account?"
              : "Create account"}
          />



        </View>


      </ScrollView>
    </SafeAreaView>
  );
}
