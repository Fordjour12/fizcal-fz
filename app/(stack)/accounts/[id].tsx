import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function AccountDetailsScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Account Details Coming Soon</Text>
      <Text style={styles.text}>Account ID: {id}</Text>
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
    marginVertical: 4,
  },
});
