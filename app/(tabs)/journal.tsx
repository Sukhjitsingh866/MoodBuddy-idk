import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList, ScrollView } from "react-native";
import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker'; // Replace react-datepicker
import fs from "fs";
import Jdata from '@/assets/journaldata.json';
// import RNFS from 'react-native-fs';

const initialRecord = [
  {
    id: 1,
    date: "1/1/2000",
    Q1: "none",
    Q2: "none",
    userDesc: "none",
  }
];
const dataTesttoJson = JSON.stringify(initialRecord);

const testRecord = Jdata.JtestData;
// var path = RNFS.DocumentDirectoryPath + '/quotes.json';

// RNFS.writeFile(path, dataTesttoJson, 'utf8')
//   .then((success) => {
//     console.log('FILE WRITTEN!');
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });

export default function Journal() {
  const [currentQues, setCurrentQues] = useState(0);
  const [pickedOption, setPickedOption] = useState([]);
  const [finishQues, setFinishQues] = useState(false);
  const [startQues, setStartQues] = useState(false);
  const [inputDate, setInputDate] = useState(false);
  const [UserType, setUserType] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [records, setRecords] = useState(testRecord);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const jQues = [
    {
      question: "How are you today?",
      options: ["good", "bad", "neutral"],
    },
    {
      question: "From a scale from 1 (not fun) to 3 (fun), how much fun did you have today?",
      options: ["1", "2", "3"],
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
    const newRecord = {
      id: records.length + 1,
      date: selectedDate.toLocaleDateString(),
      Q1: pickedOption[0],
      Q2: pickedOption[1],
      userDesc: userInput,
    };
    setRecords([...records, newRecord]);
    setFinishQues(true);
  };

  const handleDeleteRecord = (id) => {
    setRecords(records.filter((record) => record.id !== id));
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

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleEnd=()=>{
    setFinishQues(true)
    setUserType(true)
    setStartQues(true)
    setInputDate(true)
  }

  const handleDatatoJSONfile=()=>{
    fs.writeFile("journaldata.json", dataTesttoJson, (error) => {
      // throwing the error
      // in case of a writing problem
      if (error) {
        // logging the error
        console.error(error);
    
        throw error;
      }
    
      console.log("data.json written correctly");
    });
  }
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
                <TouchableOpacity onPress={() => handleDeleteRecord(item.id)} style={styles.deleteButton}>
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
                </View>
              ) : (
                <View style={styles.container}>
                  {inputDate ? (
                    <View>
                      <Text style={styles.text}>Select a Date</Text>
                      {showDatePicker && (
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display="default"
                          onChange={handleDateChange}
                        />
                      )}
                      <Text style={styles.text}>Date: {selectedDate.toLocaleDateString()}</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.button}>
                        <Text>Pick Date</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setStartQues(true)} style={styles.button}>
                        <Text>Submit</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.startText}>My Journal</Text>
                      <TouchableOpacity onPress={() => setInputDate(true)} style={styles.button}>
                        <Text>Start</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleEnd()} style={styles.button}>
                        <Text>Journal Entries</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDatatoJSONfile()} style={styles.button}>
                        <Text>Enter into Json file</Text>
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
    backgroundColor: "#DDDDDD",
    padding: 10,
    margin: 10,
    borderRadius: 5,
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