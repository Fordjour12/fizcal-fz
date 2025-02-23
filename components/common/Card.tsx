import { shadows } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: object;
}

export function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    ...shadows.medium,
    elevation: 4,
  },
});
