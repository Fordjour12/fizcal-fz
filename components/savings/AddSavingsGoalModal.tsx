import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
  Text,
  ScrollView,
} from "react-native";
import { formatCurrency } from "@/utils/currency";

interface AddSavingsGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (goal: {
    goalName: string;
    targetAmount: number;
    targetDate?: Date;
  }) => void;
}

export function AddSavingsGoalModal({
  visible,
  onClose,
  onAdd,
}: AddSavingsGoalModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(windowHeight)).current;
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() + i
  );
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const days = Array.from(
    { length: getDaysInMonth(selectedMonth, selectedYear) },
    (_, i) => i + 1
  );

  useEffect(() => {
    if (visible) {
      // Slide up
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide down
      Animated.spring(slideAnim, {
        toValue: windowHeight,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, windowHeight, slideAnim]);

  const handleAdd = () => {
    if (!goalName || !targetAmount) return;

    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    onAdd({
      goalName,
      targetAmount: parseFloat(targetAmount),
      targetDate: selectedDate,
    });

    // Reset form
    setGoalName("");
    setTargetAmount("");
    setSelectedMonth(new Date().getMonth());
    setSelectedDay(new Date().getDate());
    setSelectedYear(new Date().getFullYear());
    onClose();
  };

  const handleTargetAmountChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = text.replace(/[^0-9.]/g, "");
    setTargetAmount(numericValue);
  };

  const handleOverlayPress = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] }
            ]}>
            <Text style={styles.title}>New Savings Goal</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Goal Name</Text>
              <TextInput
                style={styles.input}
                value={goalName}
                onChangeText={setGoalName}
                placeholder="Enter goal name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Target Amount</Text>
              <TextInput
                style={styles.input}
                value={targetAmount}
                onChangeText={handleTargetAmountChange}
                placeholder="Enter target amount"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Target Date (Optional)</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {`${months[selectedMonth]} ${selectedDay}, ${selectedYear}`}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <View style={styles.pickerRow}>
                  {/* Month Picker */}
                  <View style={styles.pickerColumn}>
                    <Text style={styles.pickerLabel}>Month</Text>
                    <ScrollView 
                      showsVerticalScrollIndicator={false}
                      style={styles.pickerScroll}
                    >
                      {months.map((month, index) => (
                        <TouchableOpacity
                          key={month}
                          style={[styles.pickerItem, 
                            selectedMonth === index && styles.selectedPickerItem
                          ]}
                          onPress={() => setSelectedMonth(index)}
                        >
                          <Text style={[styles.pickerText, 
                            selectedMonth === index && styles.selectedPickerText
                          ]}>
                            {month}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Day Picker */}
                  <View style={styles.pickerColumn}>
                    <Text style={styles.pickerLabel}>Day</Text>
                    <ScrollView 
                      showsVerticalScrollIndicator={false}
                      style={styles.pickerScroll}
                    >
                      {days.map((day) => (
                        <TouchableOpacity
                          key={day}
                          style={[styles.pickerItem, 
                            selectedDay === day && styles.selectedPickerItem
                          ]}
                          onPress={() => setSelectedDay(day)}
                        >
                          <Text style={[styles.pickerText, 
                            selectedDay === day && styles.selectedPickerText
                          ]}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Year Picker */}
                  <View style={styles.pickerColumn}>
                    <Text style={styles.pickerLabel}>Year</Text>
                    <ScrollView 
                      showsVerticalScrollIndicator={false}
                      style={styles.pickerScroll}
                    >
                      {years.map((year) => (
                        <TouchableOpacity
                          key={year}
                          style={[styles.pickerItem, 
                            selectedYear === year && styles.selectedPickerItem
                          ]}
                          onPress={() => setSelectedYear(year)}
                        >
                          <Text style={[styles.pickerText, 
                            selectedYear === year && styles.selectedPickerText
                          ]}>
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.doneButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  (!goalName || !targetAmount) && styles.disabledButton,
                ]}
                onPress={handleAdd}
                disabled={!goalName || !targetAmount}
              >
                <Text style={styles.buttonText}>Add Goal</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: "60%",
    width: "100%",
  },
  datePickerContainer: {
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerLabel: {
    color: "#888",
    fontSize: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  pickerScroll: {
    height: 200,
  },
  pickerItem: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    marginVertical: 2,
  },
  selectedPickerItem: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
  },
  pickerText: {
    color: "#888",
    fontSize: 16,
  },
  selectedPickerText: {
    color: "#FFF",
    fontWeight: "600",
  },
  doneButton: {
    alignSelf: "flex-end",
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  doneButtonText: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "600",
  },
  dateButton: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#CCC",
  },
  input: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
    color: "#FFF",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 15,
    marginRight: 10,
    alignItems: "center",
  },
  addButton: {
    flex: 1,
    backgroundColor: "#2E8B57",
    borderRadius: 8,
    padding: 15,
    marginLeft: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#1A472C",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
