import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList, ScrollView, Dimensions } from "react-native";
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DatePickerInput} from 'react-native-paper-dates';
import {BarChart } from 'react-native-chart-kit';

type TestRecord = {
  id: number;
  date: string;
  Q1: string;
  Q2: string;
  userDesc: string;
};

export default function Journal() {
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
  const [chartData, setChartData] = useState({labels: [],datasets: [{ data: [] }]});
  const [chartData2, setChartData2] = useState({labels: [],datasets: [{ data: [] }]});

  const jQues = [
    {
      question: "How are you today?",
      options: ["fantastic","good", "neutral", "bad", "horrible"],
    },
    {
      question: "From a scale from 1 (not fun) to 5 (fun), how much fun did you have today?",
      options: ["1", "2", "3","4","5"],
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
        const storedData = await AsyncStorage.getItem('storedJson');
        if (storedData !== null) {
          setRecords(JSON.parse(storedData));
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
        await AsyncStorage.setItem('storedJson', JSON.stringify(records));
      } catch (e) {
        console.error('Failed to save data', e);
      }
    };
    storeData();
  }, [records]);

  const addData = () => {
    const newRecord = {
      id: records.length + 1,
      date: selectedDate.toLocaleDateString(),
      Q1: pickedOption[0],
      Q2: pickedOption[1],
      userDesc: userInput,
    };
    setRecords([...records, newRecord]);
  };

  const removeData = (id) => {
    setRecords(records.filter((record) => record.id !== id));
  };

  useEffect(() => {
    const updateChartData = () => {
      // Define the possible feelings
      const feelings = ["fantastic", "good", "neutral", "bad", "horrible"];
      
      // Count occurrences of each feeling
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
      // Default data if no records exist
      setChartData({
        labels: ["fantastic", "good", "neutral", "bad", "horrible"],
        datasets: [{ data: [0, 0, 0, 0, 0] }]
      });
    }
  }, [records]);
  useEffect(() => {
    const updateChartData = () => {
      // Define the possible feelings
      const funnumber = ["1", "2", "3","4","5"];
      
      // Count occurrences of each feeling
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
      // Default data if no records exist
      setChartData2({
        labels: ["1", "2", "3","4","5"],
        datasets: [{ data: [0, 0, 0, 0, 0] }]
      });
    }
  }, [records]);

  return (
    <View style={styles.container}>
      {finishQues ? (
        <ScrollView>
          <FlatList
            data={records}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.recordItem}>
                <Text style={styles.text}>
                  {item.date}: You felt {item.Q1} and rated it as {item.Q2} for fun. You typed: {item.userDesc}
                </Text>
                <TouchableOpacity onPress={() => removeData(item.id)} style={styles.deleteButton}>
                  <Text>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity onPress={handleRestart} style={styles.button}>
            <Text>Restart</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.container}>
          {UserType ? (
            <View>
              <Text style={styles.text}>What made you feel this way?</Text>
              <TextInput
                style={styles.userType}
                onChangeText={setUserInput}
                value={userInput}
                multiline
              />
              <TouchableOpacity onPress={handleComplete} style={styles.button}>
                <Text>Enter</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setUserType(false)} style={styles.button}>
                <Text>Back</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.container}>
              {startQues ? (
                <View>
                  <Text style={styles.questionContainer}>{jQues[currentQues]?.question}</Text>
                  {jQues[currentQues]?.options.map((item, index) => (
                    <TouchableOpacity key={index} onPress={() => handleResponse(item)} style={styles.optionContainer}>
                      <Text style={styles.optionStyle}>{item}</Text>
                    </TouchableOpacity>
                  ))}             
                  <TouchableOpacity onPress={() => setStartQues(false)} style={styles.button}>
                    <Text>Back</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.container}>
                  {inputDate ? (
                    <View>
                      <DatePickerInput locale="en" label="Pick a date" value={selectedDate} onChange={(d)=>setSelectedDate(d)} inputMode="start" />
                      <TouchableOpacity onPress={() => setStartQues(true)} style={styles.button}>
                        <Text>Submit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setInputDate(false)} style={styles.button}>
                        <Text>Back</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                      <View style={styles.container}>
                      {StatsPage ? (
                        <View>
                        <Text style={styles.text}>Overall rating of how you felt</Text>
                        <BarChart
                          data={chartData}
                          width={500}
                          height={220}
                          chartConfig={{
                            backgroundColor: '#25282d',
                            backgroundGradientFrom: '#25282d',
                            backgroundGradientTo: '#25282d',
                            backgroundGradientFromOpacity: 0,
                            backgroundGradientToOpacity: 0,
                            decimalPlaces: 0,
                            color: () => `rgba(0, 255, 0, 1)`,
                            fillShadowGradient: '#00FF00',
                            fillShadowGradientTo: '#00FF00',
                            fillShadowGradientOpacity: 1, 
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, 
                            propsForBackgroundLines: {
                              strokeWidth: "0",
                            },
                          }}
                        />
                      <Text style={styles.text}>Overall fun rating</Text>
                      <BarChart
                        data={chartData2}
                        width={500}
                        height={220}
                        chartConfig={{
                          backgroundColor: '#25282d',
                          backgroundGradientFrom: '#25282d',
                          backgroundGradientTo: '#25282d',
                          backgroundGradientFromOpacity: 0,
                          backgroundGradientToOpacity: 0,
                          decimalPlaces: 0,
                          color: () => `rgba(0, 255, 0, 1)`,
                          fillShadowGradient: '#00FF00',
                          fillShadowGradientTo: '#00FF00',
                          fillShadowGradientOpacity: 1, 
                          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, 
                          propsForBackgroundLines: {
                            strokeWidth: "0",
                          },
                        }}
                      />
                          <TouchableOpacity onPress={() => setStatsPage(false)} style={styles.button}>
                            <Text>Back</Text>
                          </TouchableOpacity>
                        </View>
                      ):(
                      <View>
                        <Text style={styles.startText}>My Journal</Text>
                        <TouchableOpacity onPress={() => setInputDate(true)} style={styles.button}>
                          <Text>Start</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleEnd()} style={styles.button}>
                          <Text>Journal Entries</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setStatsPage(true)} style={styles.button}>
                          <Text>My Stats</Text>
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
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25292e",
    padding: 20,
  },
  text: {
    color: "white",
    padding: 10,
  },
  startText: {
    color: "white",
    fontSize: 32,
    padding: 10,
  },
  userType: {
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    width: 300,
    height: 100,
    padding: 10,
    marginBottom: 10,
  },
  questionContainer: {
    color: "white",
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  optionContainer: {
    borderColor: "white",
    borderWidth: 1,
    margin: 5,
    padding: 10,
    borderRadius: 5,
  },
  optionStyle: {
    color: "white",
  },
  button: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    margin: 10,
    borderWidth: 4, 
    borderColor: "#ffd33d", 
    borderRadius: 18,
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 10,
    margin: 5,
    borderRadius: 5,
    
  },
  recordItem: {
    marginBottom: 10,
  },
});