import React, { useState, useEffect, Component } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import data from '@/assets/quotes.json';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRouter } from 'expo-router';
import { ThemeContext } from '../utils/ThemeContext';
import { themes } from '../utils/theme';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: themes[this.context.theme].background }]}>
          <Text style={[styles.errorText, { color: '#ff0000' }]}>Something went wrong: {this.state.error?.toString()}</Text>
          <Pressable style={styles.retryButton} onPress={() => this.setState({ hasError: false, error: null })}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.contextType = ThemeContext;

const arrMin = 0;
const arrMax = data.quotes.length - 1;
const getRandomQuote = () => {
  const rng = Math.floor(Math.random() * (arrMax - arrMin + 1));
  return data.quotes[rng];
};

type Habit = { name: string; completed: boolean };
type MarkedDates = { [date: string]: { selected: boolean; marked: boolean; selectedColor: string } };

const calculateStreak = (markedDates: MarkedDates): number => {
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const dateString = currentDate.toISOString().split('T')[0];
    const dayData = markedDates[dateString];
    if (!dayData || dayData.selectedColor !== '#4CAF50') break;
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  return streak;
};

export default function HomeScreen() {
  const { theme } = React.useContext(ThemeContext);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [lastResetDate, setLastResetDate] = useState<string>(new Date().toDateString());
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [streak, setStreak] = useState<number>(0);
  const [quote, setQuote] = useState(getRandomQuote());
  const [lastQuoteDate, setLastQuoteDate] = useState<string | null>(null);
  const isFocused = useIsFocused();
  const router = useRouter();

  useEffect(() => {
    const updateQuote = async () => {
      console.log('Updating quote');
      const today = new Date().toDateString();
      const storedDate = await AsyncStorage.getItem('@lastQuoteDate');
      if (storedDate !== today) {
        console.log('Setting new quote...');
        setQuote(getRandomQuote());
        setLastQuoteDate(today);
        await AsyncStorage.setItem('@lastQuoteDate', today);
      } else {
        console.log('Quote already updated today');
      }
    };
    updateQuote();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      console.log('Loading data');
      try {
        const storedHabits = await AsyncStorage.getItem('@habits');
        const storedDate = await AsyncStorage.getItem('@lastResetDate');
        const storedMarkedDates = await AsyncStorage.getItem('@markedDates');
        console.log('Stored habits:', storedHabits);
        console.log('Stored last reset date:', storedDate);
        console.log('Stored marked dates:', storedMarkedDates);
        if (storedHabits) setHabits(JSON.parse(storedHabits));
        if (storedDate) setLastResetDate(storedDate);
        if (storedMarkedDates) {
          const parsedDates = JSON.parse(storedMarkedDates);
          setMarkedDates(parsedDates);
          setStreak(calculateStreak(parsedDates));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    if (isFocused) loadData();
  }, [isFocused]);

  useEffect(() => {
    const checkDate = async () => {
      console.log('Checking date');
      const today = new Date().toDateString();
      if (lastResetDate !== today) {
        console.log('Resetting habits for new day...');
        const resetHabits = habits.map((habit) => ({ ...habit, completed: false }));
        setHabits(resetHabits);
        setLastResetDate(today);
        await AsyncStorage.setItem('@habits', JSON.stringify(resetHabits));
        await AsyncStorage.setItem('@lastResetDate', today);
      }
    };
    checkDate();
  }, [habits, lastResetDate]);

  const toggleCompletion = async (index: number) => {
    console.log('Toggling completion for habit at index:', index);
    const updatedHabits = [...habits];
    updatedHabits[index].completed = !updatedHabits[index].completed;
    setHabits(updatedHabits);
    await AsyncStorage.setItem('@habits', JSON.stringify(updatedHabits));

    const allCompleted = updatedHabits.every((habit) => habit.completed);
    const today = new Date().toISOString().split('T')[0];
    const updatedMarkedDates = { ...markedDates };

    if (allCompleted) {
      updatedMarkedDates[today] = { selected: true, marked: true, selectedColor: '#4CAF50' };
    } else {
      updatedMarkedDates[today] = { selected: true, marked: true, selectedColor: '#F44336' };
    }

    setMarkedDates(updatedMarkedDates);
    await AsyncStorage.setItem('@markedDates', JSON.stringify(updatedMarkedDates));
    setStreak(calculateStreak(updatedMarkedDates));
  };

  // Define gradient colors for light and dark themes
  const gradientColors = theme === 'light'
    ? ['#f5f7fa', '#e4e9f0', '#d9e1e8'] // Light theme gradient
    : ['#1a1d21', '#2f3439', '#3d4450']; // Dark theme gradient

  console.log('Rendering HomeScreen with quote:', quote);
  return (
    <ErrorBoundary>
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.content}>
            <View style={[styles.quoteContainer, { backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)', borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' }]}>
              <FontAwesome name="lightbulb-o" size={24} color={themes[theme].highlight} style={styles.quoteIcon} />
              <Text style={[styles.quoteText, { color: themes[theme].text }]}>"{quote.quote}"</Text>
              <Text style={[styles.authorText, { color: theme === 'light' ? '#666666' : '#D3D3D3' }]}>— {quote.author}</Text>
            </View>
            <View style={[styles.calendarContainer, { backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)', borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 215, 0, 0.1)' }]}>
              <Calendar
                markedDates={markedDates}
                markingType="custom"
                style={styles.calendar}
                theme={{
                  calendarBackground: 'transparent',
                  textSectionTitleColor: themes[theme].text,
                  todayTextColor: themes[theme].highlight,
                  selectedDayBackgroundColor: '#4CAF50',
                  arrowColor: themes[theme].text,
                  monthTextColor: themes[theme].text,
                  textDisabledColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                  dayTextColor: themes[theme].text,
                  textDayFontWeight: '400',
                  dotColor: '#4CAF50',
                  markedDotColor: themes[theme].highlight,
                  dotSize: 6,
                  markedDotSize: 8,
                }}
              />
            </View>
            <View style={[styles.streakContainer, { backgroundColor: theme === 'light' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)', borderColor: '#4CAF50' }]}>
              <FontAwesome name="fire" size={18} color="#4CAF50" style={styles.streakIcon} />
              <Text style={[styles.streakText, { color: '#4CAF50' }]}>Current Streak: {streak} days</Text>
            </View>
            <Text style={[styles.title, { color: themes[theme].text }]}>Today's Habits</Text>
            {habits.length === 0 ? (
              <Text style={[styles.noHabitsText, { color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' }]}>
                Add habits in the Habit tab to get started!
              </Text>
            ) : (
              habits.map((habit, index) => (
                <Pressable
                  key={`${habit.name}-${index}`}
                  onPress={() => toggleCompletion(index)}
                  style={({ pressed }) => [
                    styles.habitItem,
                    habit.completed && styles.habitItemCompleted,
                    pressed && styles.habitItemPressed,
                    { backgroundColor: themes[theme].background },
                  ]}
                >
                  <Text
                    style={[
                      styles.habitText,
                      habit.completed && styles.completedHabitText,
                      { color: themes[theme].text },
                    ]}
                  >
                    {habit.name}
                  </Text>
                  <FontAwesome
                    name={habit.completed ? 'check-circle' : 'circle-o'}
                    size={24}
                    color={habit.completed ? '#4CAF50' : theme === 'light' ? '#666666' : '#757575'}
                  />
                </Pressable>
              ))
            )}

          </View>
        </ScrollView>
      </LinearGradient>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
  },
  contentContainer: {
    padding: 20,
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
  },
  quoteContainer: {
    marginBottom: 25,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
    elevation: 5,
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: 10,
  },
  quoteText: {
    fontSize: 26,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 10,
  },
  authorText: {
    fontSize: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  calendarContainer: {
    borderRadius: 15,
    padding: 10,
    marginBottom: 25,
    borderWidth: 1,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  calendar: {
    borderRadius: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 1,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 6,
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  habitItemCompleted: {
    backgroundColor: '#E8F5E9',
  },
  habitItemPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  habitText: {
    fontSize: 20,
    flex: 1,
    fontWeight: '500',
  },
  completedHabitText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  noHabitsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  streakContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 15,
    borderWidth: 2,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
    elevation: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  streakIcon: {
    marginRight: 8,
  },
  streakText: {
    fontSize: 22,
    fontWeight: '700',
  },
});