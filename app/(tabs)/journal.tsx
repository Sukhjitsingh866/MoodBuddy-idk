import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList, ScrollView, Dimensions } from "react-native";
import React, { useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatePickerInput } from 'react-native-paper-dates';
import { BarChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../utils/ThemeContext';
import { themes } from '../utils/theme';
import { useRouter } from "expo-router";

type TestRecord = {
  id: number;
  date: string;
  Q1: string;
  Q2: string;
  userDesc: string;
  username: string;
};

export default function Journal() {
  const { theme } = useContext(ThemeContext);
  const [currentQues, setCurrentQues] = useState(0);
  const [pickedOption, setPickedOption] = useState([]);
  const [finishQues, setFinishQues] = useState(false);
  const [startQues, setStartQues] = useState(false);
  const [inputDate, setInputDate] = useState(false);
  const [UserType, setUserType] = useState(false);
  const [StatsPage, setStatsPage] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [chartData2, setChartData2] = useState({ labels: [], datasets: [{ data: [] }] });
  const [currentUsername, setCurrentUsername] = useState("");
  const router = useRouter();

  const jQues = [
    {
      question: "How are you today?",
      options: ["fantastic", "good", "neutral", "bad", "horrible"],
    },
    {
      question: "From a scale from 1 (not fun) to 5 (fun), how much fun did you have today?",
      options: ["1", "2", "3", "4", "5"],
    },
  ];

  const handleResponse = (selectedOption) => {
    setPickedOption([...pickedOption, selectedOption]);
    const nextQues = currentQues + 1;
    if (nextQues < jQues.length) {
      setCurrentQues(nextQues);
    } else {
      setUserType(true);
    }
  };

  const handleComplete = () => {
    addData();
    setFinishQues(true);
  };

  const handleRestart = () => {
    setCurrentQues(0);
    setStartQues(false);
    setFinishQues(false);
    setInputDate(false);
    setUserType(false);
    setUserInput("");
    setPickedOption([]);
  };

  const handleEnd = () => {
    setFinishQues(true);
    setUserType(true);
    setStartQues(true);
    setInputDate(true);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load current user
        const username = await AsyncStorage.getItem("currentUser");
        if (username) {
          setCurrentUsername(username);
        }

        // Load journal entries
        const storedData = await AsyncStorage.getItem('storedJson');
        if (storedData !== null) {
          const allRecords = JSON.parse(storedData);
          // Filter records for current user
          setRecords(allRecords.filter(record => record.username === username));
        }
      } catch (e) {
        console.error('Failed to load data', e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const storeData = async () => {
      try {
        // Load all records to preserve other users' data
        const storedData = await AsyncStorage.getItem('storedJson');
        const allRecords = storedData ? JSON.parse(storedData) : [];
        // Update only current user's records
        const otherRecords = allRecords.filter(record => record.username !== currentUsername);
        await AsyncStorage.setItem('storedJson', JSON.stringify([...otherRecords, ...records]));
      } catch (e) {
        console.error('Failed to save data', e);
      }
    };
    if (currentUsername) {
      storeData();
    }
  }, [records, currentUsername]);

  const addData = () => {
    const newRecord = {
      id: records.length + 1,
      date: selectedDate.toLocaleDateString(),
      Q1: pickedOption[0],
      Q2: pickedOption[1],
      userDesc: userInput,
      username: currentUsername,
    };
    setRecords([...records, newRecord]);
  };

  const removeData = (id) => {
    setRecords(records.filter((record) => record.id !== id));
  };

  useEffect(() => {
    const updateChartData = () => {
      const feelings = ["fantastic", "good", "neutral", "bad", "horrible"];
      const feelingCounts = feelings.map(feeling => 
        records.filter(record => record.Q1 === feeling).length
      );
      const newData = {
        labels: feelings,
        datasets: [{
          data: feelingCounts
        }]
      };
      setChartData(newData);
    };
    
    if (records.length > 0) {
      updateChartData();
    } else {
      setChartData({
        labels: ["fantastic", "good", "neutral", "bad", "horrible"],
        datasets: [{ data: [0, 0, 0, 0, 0] }]
      });
    }
  }, [records]);

  useEffect(() => {
    const updateChartData = () => {
      const funnumber = ["1", "2", "3", "4", "5"];
      const funnumberCounts = funnumber.map(funnumber => 
        records.filter(record => record.Q2 === funnumber).length
      );
      const newData2 = {
        labels: funnumber,
        datasets: [{
          data: funnumberCounts
        }]
      };
      setChartData2(newData2);
    };
    
    if (records.length > 0) {
      updateChartData();
    } else {
      setChartData2({
        labels: ["1", "2", "3", "4", "5"],
        datasets: [{ data: [0, 0, 0, 0, 0] }]
      });
    }
  }, [records]);

  const gradientColors = theme === 'light'
    ? ['#f5f7fa', '#e4e9f0', '#d9e1e8']
    : ['#1a1d21', '#2f3439', '#3d4450'];

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        {finishQues ? (
          <View>
            <FlatList
              data={records}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.recordItem}>
                  <Text style={[styles.text, { color: themes[theme].text }]}>
                    {item.date}: You felt {item.Q1} and rated it as {item.Q2} for fun. You typed: {item.userDesc}
                  </Text>
                  <TouchableOpacity onPress={() => removeData(item.id)} style={[styles.deleteButton, { backgroundColor: '#F44336' }]}>
                    <Text style={[styles.buttonText, { color: '#ffffff' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            <TouchableOpacity onPress={handleRestart} style={[styles.button, { backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(37, 41, 46, 0.8)', borderColor: themes[theme].highlight }]}>
              <Text style={[styles.buttonText, { color: themes[theme].text }]}>Restart</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.innerContainer}>
            {UserType ? (
              <View>
                <Text style={[styles.text, { color: themes[theme].text }]}>What made you feel this way?</Text>
                <TextInput
                  style={[styles.userType, { color: themes[theme].text, borderColor: themes[theme].text, backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(37, 41, 46, 0.8)' }]}
                  onChangeText={setUserInput}
                  value={userInput}
                  multiline
                />
                <TouchableOpacity onPress={handleComplete} style={[styles.button, { backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(37, 41, 46, 0.8)', borderColor: themes[theme].highlight }]}>
                  <Text style={[styles.buttonText, { color: themes[theme].text }]}>Enter</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setUserType(false)} style={[styles.button, { backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(37, 41, 46, 0.8)', borderColor: themes[theme].highlight }]}>
                  <Text style={[styles.buttonText, { color: themes[theme].text }]}>Back</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.innerContainer}>
                {startQues ? (
                  <View>
                    <Text style={[styles.questionContainer, { color: themes[theme].text }]}>{jQues[currentQues]?.question}</Text>
                    {jQues[currentQues]?.options.map((item, index) => (
                      <TouchableOpacity key={index} onPress={() => handleResponse(item)} style={[styles.optionContainer, { borderColor: themes[theme].text, backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(37, 41, 46, 0.8)' }]}>
                        <Text style={[styles.optionStyle, { color: themes[theme].text }]}>{item}</Text>
                      </TouchableOpacity>
                    ))}             
                    <TouchableOpacity onPress={() => setStartQues(false)} style={[styles.button, { backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(37, 41, 46, 0.8)', borderColor: themes[theme].highlight }]}>
                      <Text style={[styles.buttonText, { color: themes[theme].text }]}>Back</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.innerContainer}>
                    {inputDate ? (
                      <View>
                        <DatePickerInput
                          locale="en"
                          label="Pick a date"
                          value={selectedDate}
                          onChange={(d) => setSelectedDate(d)}
                          inputMode="start"
                          style={[styles.datePicker, { backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(37, 41, 46, 0.8)', color: themes[theme].text }]}
                          inputProps={{
                            style: { color: themes[theme].text },
                          }}
                        />
                        <TouchableOpacity onPress={() => setStartQues(true)} style={[styles.button, { backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(37, 41, 46, 0.8)', borderColor: themes[theme].highlight }]}>
                          <Text style={[styles.buttonText, { color: themes[theme].text }]}>Submit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setInputDate(false)} style={[styles.button, { backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(37, 41, 46, 0.8)', borderColor: themes[theme].highlight }]}>
                          <Text style={[styles.buttonText, { color: themes[theme].text }]}>Back</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.container}>
                        {StatsPage ? (
                          <View>
                            <Text style={[styles.buttonText, { color: themes[theme].text }]}>Overall rating of how you felt</Text>
                            <BarChart
                              data={chartData}
                              width={Dimensions.get('window').width - 40}
                              height={220}
                              yAxisLabel=""
                              yAxisSuffix=""
                              chartConfig={{
                                backgroundColor: '#25282d',
                                backgroundGradientFrom: '#25282d',
                                backgroundGradientTo: '#25282d',
                                decimalPlaces: 0,
                                color: () => `rgba(0, 255, 0, 1)`,
                                fillShadowGradient: '#00FF00',
                                fillShadowGradientTo: '#00FF00',
                                fillShadowGradientOpacity: 1,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                propsForBackgroundLines: {
                                  strokeWidth: 0,
                                },
                                formatYLabel: (value) => Math.round(value).toString(),
                                barPercentage: 1,
                              }}
                              fromZero={true}
                            />
                            <Text style={[styles.buttonText, { color: themes[theme].text }]}>Overall fun rating</Text>
                            <BarChart
                              data={chartData2}
                              width={Dimensions.get('window').width - 40}
                              height={220}
                              yAxisLabel=""
                              yAxisSuffix=""
                              chartConfig={{
                                backgroundColor: '#25282d',
                                backgroundGradientFrom: '#25282d',
                                backgroundGradientTo: '#25282d',
                                decimalPlaces: 0,
                                color: () => `rgba(0, 255, 0, 1)`,
                                fillShadowGradient: '#00FF00',
                                fillShadowGradientTo: '#00FF00',
                                fillShadowGradientOpacity: 1,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                propsForBackgroundLines: {
                                  strokeWidth: 0,
                                },
                                formatYLabel: (value) => Math.round(value).toString(),
                                barPercentage: 1,
                              }}
                              fromZero={true}
                            />
                            <TouchableOpacity onPress={() => setStatsPage(false)} style={styles.button}>
                              <Text style={[styles.buttonText, { color: themes[theme].text }]}>Back</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View>
                            <Text style={[styles.startText, { color: themes[theme].text }]}>My Journal</Text>
                            <TouchableOpacity onPress={() => setInputDate(true)} style={[styles.button, { backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(37, 41, 46, 0.8)', borderColor: themes[theme].highlight }]}>
                              <Text style={[styles.buttonText, { color: themes[theme].text }]}>Start</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleEnd()} style={[styles.button, { backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(37, 41, 46, 0.8)', borderColor: themes[theme].highlight }]}>
                              <Text style={[styles.buttonText, { color: themes[theme].text }]}>Journal Entries</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setStatsPage(true)} style={[styles.button, { backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(37, 41, 46, 0.8)', borderColor: themes[theme].highlight }]}>
                              <Text style={[styles.buttonText, { color: themes[theme].text }]}>My Stats</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    padding: 10,
  },
  startText: {
    fontSize: 32,
    padding: 10,
  },
  userType: {
    borderWidth: 1,
    width: 300,
    height: 100,
    padding: 10,
    marginBottom: 10,
  },
  questionContainer: {
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  optionContainer: {
    borderWidth: 1,
    margin: 5,
    padding: 10,
    borderRadius: 5,
  },
  optionStyle: {},
  button: {
    alignItems: "center",
    padding: 10,
    margin: 10,
    borderWidth: 4,
    borderRadius: 18,
    width: 150,
  },
  buttonText: {},
  deleteButton: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  recordItem: {
    marginBottom: 10,
  },
  datePicker: {
    marginVertical: 10,
  },
});