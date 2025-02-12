import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Habit = {
    name: string;
    completed: boolean;
};

type Props = {
    label: string;
};

export default function HabitBuilder({ label }: Props) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [text, setText] = useState('');
    const [habitList, setHabitList] = useState<Habit[]>([]);

    // Loads habit
    useEffect(() => {
        const loadHabits = async () => {
            try {
                const storedHabits = await AsyncStorage.getItem('@habits');
                if (storedHabits !== null) {
                    setHabitList(JSON.parse(storedHabits));
                }
            } catch (error) {
                console.error('Error loading habits:', error);
            }
        };
        loadHabits();
    }, []);

    // Saves habit
    useEffect(() => {
        const saveHabits = async () => {
            try {
                await AsyncStorage.setItem('@habits', JSON.stringify(habitList));
            } catch (error) {
                console.error('Error saving habits:', error);
            }
        };
        saveHabits();
    }, [habitList]);

    // Adds habit
    const addHandler = () => {
        if (text.trim() !== '') {
            const newHabit: Habit = { name: text, completed: false };
            setHabitList([...habitList, newHabit]);
            setText('');
            setShowConfirmation(false);
        }
    };

    // Removes habit
    const removeHandler = (habitToRemove: string) => {
        const updatedList = habitList.filter((item) => item.name !== habitToRemove);
        setHabitList(updatedList);
    };

    return (
        <View style={styles.centerAll}>
            <View style={[styles.text, { color: '#fff' }]}>
                <Text style={styles.h1}>Habit List</Text>
                {habitList.map((item, index) => (
                    <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.h2}>{item.name}</Text>
                        <Pressable onPress={() => removeHandler(item.name)}>
                            <FontAwesome
                                name="minus"
                                size={18}
                                color="#fff"
                                style={styles.buttonIcon}
                            />
                        </Pressable>
                    </View>
                ))}
            </View>
            <View style={[styles.buttonContainer, { borderWidth: 4, borderColor: "#ffd33d", borderRadius: 18 }]}>
                <Modal
                    visible={showConfirmation}
                    transparent
                    onRequestClose={() => setShowConfirmation(false)}
                    animationType="slide"
                >
                    <View style={styles.centeredView}>
                        <View style={styles.confirmationModal}>
                            <View style={styles.confirmationTitle}>
                                <Text style={styles.text}>Add Habit</Text>
                            </View>
                            <View style={styles.confirmationBody}>
                                <Text style={styles.text}>What habit do you want to add?</Text>
                                <TextInput
                                    style={{ height: 40, padding: 5, borderWidth: 1, margin: 10 }}
                                    placeholder="Enter new habit here"
                                    onChangeText={setText}
                                    value={text}
                                />
                            </View>
                            <View style={[{ flexDirection: "row" }, styles.bottomConfirmation]}>
                                <View style={styles.cancelButton}>
                                    <Pressable
                                        onPress={() => setShowConfirmation(false)}
                                        style={styles.cancelButton}
                                    >
                                        <Text style={styles.text}>Cancel</Text>
                                    </Pressable>
                                </View>
                                <View style={styles.confirmationButton}>
                                    <Pressable
                                        onPress={addHandler}
                                        style={styles.confirmationButton}
                                    >
                                        <Text style={styles.text}>Add</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Pressable
                    style={[styles.button, { backgroundColor: "#fff" }]}
                    onPress={() => setShowConfirmation(true)}
                >
                    <FontAwesome
                        name="plus"
                        size={18}
                        color="#25292e"
                        style={styles.buttonIcon}
                    />
                    <Text style={[styles.buttonLabel, { color: "#25292e" }]}>
                        {label}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    text: {
        color: "#000000",
        fontSize: 20,
        margin: 10,
        textAlign: "center",
    },
    h1: {
        color: "#FFFFFF",
        fontSize: 40,
        margin: 10,
        textAlign: "center",
    },
    h2: {
        color: "#FFFFFF",
        fontSize: 20,
        margin: 10,
        textAlign: "center",
    },
    buttonContainer: {
        width: 320,
        height: 68,
        marginHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        padding: 3,
    },
    button: {
        borderRadius: 10,
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    buttonLabel: {
        color: "#fff",
        fontSize: 16,
    },
    buttonIcon: {
        paddingRight: 8,
    },
    confirmationModal: {
        width: 300,
        height: 300,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 20,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#00000099",
    },
    centerAll: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    confirmationTitle: {
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ff0",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    confirmationBody: {
        height: 200,
        justifyContent: "center",
        alignItems: "center",
    },
    bottomConfirmation: {
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ff0",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    confirmationButton: {
        alignItems: "center",
        justifyContent: "center",
        width: "50%"
    },
    cancelButton: {
        alignItems: "center",
        justifyContent: "center",
        width: "50%"
    },
});