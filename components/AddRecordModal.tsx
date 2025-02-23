import { StyleSheet, View, Text, Pressable, Modal, TextInput, ViewStyle, TextStyle, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useState } from 'react';
import { TransactionType, NewTransaction, TRANSACTION_CATEGORIES, PAYMENT_METHODS } from './TransactionsList';
import { formatCurrency } from '@/utils/currency';

interface Styles {
  modalOverlay: ViewStyle;
  modalContainer: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  content: ViewStyle;
  tabs: ViewStyle;
  tab: ViewStyle;
  activeTab: ViewStyle;
  tabText: TextStyle;
  activeTabText: TextStyle;
  amountContainer: ViewStyle;
  currencySymbol: TextStyle;
  amountInput: TextStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  categoryGrid: ViewStyle;
  categoryItem: ViewStyle;
  activeCategoryItem: ViewStyle;
  categoryIcon: ViewStyle;
  categoryText: TextStyle;
  activeCategoryText: TextStyle;
  methodGrid: ViewStyle;
  methodItem: ViewStyle;
  activeMethodItem: ViewStyle;
  methodText: TextStyle;
  activeMethodText: TextStyle;
  noteInput: TextStyle;
  addButton: ViewStyle;
  addButtonDisabled: ViewStyle;
  addButtonText: TextStyle;
}

interface AddRecordModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd?: (transaction: NewTransaction) => void;
}

export function AddRecordModal({ visible, onClose, onAdd }: AddRecordModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [note, setNote] = useState('');

  const handleAdd = () => {
    if (!amount || !category || !paymentMethod) return;

    const newTransaction: NewTransaction = {
      type,
      amount: type === 'expense' ? -parseFloat(amount) : parseFloat(amount),
      category,
      paymentMethod,
      note: note || undefined
    };

    onAdd?.(newTransaction);
    onClose();
    
    // Reset form
    setAmount('');
    setCategory('');
    setPaymentMethod('');
    setNote('');
    setType('expense');
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <Animated.View 
          entering={FadeIn}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Record</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#fff" />
            </Pressable>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.tabs}>
              <Pressable 
                style={[styles.tab, type === 'expense' && styles.activeTab]}
                onPress={() => setType('expense')}
              >
                <Text style={[styles.tabText, type === 'expense' && styles.activeTabText]}>Expense</Text>
              </Pressable>
              <Pressable 
                style={[styles.tab, type === 'income' && styles.activeTab]}
                onPress={() => setType('income')}
              >
                <Text style={[styles.tabText, type === 'income' && styles.activeTabText]}>Income</Text>
              </Pressable>
              <Pressable 
                style={[styles.tab, type === 'transfer' && styles.activeTab]}
                onPress={() => setType('transfer')}
              >
                <Text style={[styles.tabText, type === 'transfer' && styles.activeTabText]}>Transfer</Text>
              </Pressable>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>GH₵</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoryGrid}>
                {TRANSACTION_CATEGORIES.map((cat) => (
                  <Pressable 
                    key={cat.id}
                    style={[styles.categoryItem, category === cat.id && styles.activeCategoryItem]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: cat.iconBackground }]}>
                      <Ionicons name={cat.icon} size={20} color={cat.iconColor} />
                    </View>
                    <Text style={[styles.categoryText, category === cat.id && styles.activeCategoryText]}>
                      {cat.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.methodGrid}>
                {PAYMENT_METHODS.map((method) => (
                  <Pressable 
                    key={method.id}
                    style={[styles.methodItem, paymentMethod === method.id && styles.activeMethodItem]}
                    onPress={() => setPaymentMethod(method.id)}
                  >
                    <Ionicons name={method.icon} size={20} color={paymentMethod === method.id ? '#2DC653' : '#666'} />
                    <Text style={[styles.methodText, paymentMethod === method.id && styles.activeMethodText]}>
                      {method.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Note</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note"
                placeholderTextColor="#666"
              />
            </View>

            <Pressable 
              style={[styles.addButton, (!amount || !category || !paymentMethod) && styles.addButtonDisabled]}
              onPress={handleAdd}
              disabled={!amount || !category || !paymentMethod}
            >
              <Text style={styles.addButtonText}>Add Transaction</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create<Styles>({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff'
  },
  content: {
    flexGrow: 1,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  activeTab: {
    backgroundColor: '#2DC653'
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500'
  },
  activeTabText: {
    color: '#fff'
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    padding: 0
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -6
  },
  categoryItem: {
    width: '25%',
    padding: 6
  },
  activeCategoryItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  activeCategoryText: {
    color: '#2DC653'
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -6
  },
  methodItem: {
    width: '33.33%',
    padding: 6
  },
  activeMethodItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 12
  },
  methodText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center'
  },
  activeMethodText: {
    color: '#2DC653'
  },
  noteInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14
  },
  addButton: {
    backgroundColor: '#2DC653',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24
  },
  addButtonDisabled: {
    opacity: 0.5
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
