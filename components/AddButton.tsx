import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AddButtonProps {
  onPress: () => void;
  size?: number;
  color?: string;
}

export function AddButton({ 
  onPress, 
  size = 24, 
  color = "#FFF" 
}: AddButtonProps) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.button}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="add" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 8,
    padding: 4,
  },
});
