import { View, Text, StyleSheet } from "react-native";

export default function NewAccountScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>New Account Form Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
});
