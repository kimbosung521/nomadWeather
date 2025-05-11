import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";
import { theme } from "./colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
const MODE_KEY = "@mode";
const STORAGE_KEY = "@toDos";
export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [mode, setMode] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const travel = () => {
    setWorking(false);
    setMode(false);
    saveMode(false);
  };
  const work = () => {
    setWorking(true);
    setMode(true);
    saveMode(true);
  };
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if (s) {
      setToDos(JSON.parse(s));
    }
  };
  const saveMode = async (toMode) => {
    await AsyncStorage.setItem(MODE_KEY, JSON.stringify(toMode));
  };
  const loadMode = async () => {
    const m = await AsyncStorage.getItem(MODE_KEY);
    if (m) {
      const parsed = JSON.parse(m);
      setWorking(parsed);
      setMode(parsed);
    }
  };
  const startText = (key) => {
    setEditingId(key);
    setEditingText(toDos[key].text);
  };
  const saveEdit = async () => {
    if (!editingText.trim()) return;
    const updated = { ...toDos };
    updated[editingId].text = editingText;
    setToDos(updated);
    saveToDos(updated);
    setEditingId(null);
    setEditingText("");
  };

  useEffect(() => {
    loadToDos();
    loadMode();
  }, []);
  const addToDo = async () => {
    if (text === " ") {
      return;
    }
    const newToDOs = { ...toDos, [Date.now()]: { text, working, done: false } };
    setToDos(newToDOs);
    await saveToDos(newToDOs);
    setText("");
  };
  const completed = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].done = !newToDos[key].done;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  const deleteToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this TO Do");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        await saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: async () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            await saveToDos(newToDos);
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.Header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              fontSize: 38,
              fontWeight: "600",
              color: working ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              fontSize: 38,
              fontWeight: "600",
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        returnKeyType="done"
        onChangeText={onChangeText}
        value={text}
        placeholder={working ? "ADD a To DO" : "Where do yout want to go?"}
        style={styles.input}
      ></TextInput>
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              {editingId === key ? (
                <TextInput
                  value={editingText}
                  onChangeText={setEditingText}
                  onSubmitEditing={saveEdit}
                  returnKeyType="done"
                  style={styles.text}
                  autoFocus
                />
              ) : (
                <Text style={styles.toDoText}>{toDos[key].text}</Text>
              )}

              <View style={styles.texticon}>
                {editingId === key ? (
                  <TouchableOpacity onPress={saveEdit}>
                    <AntDesign name="check" size={24} color="white" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => startText(key)}>
                    <AntDesign name="edit" size={20} color="white" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => {
                    completed(key);
                  }}
                >
                  <Text>
                    <AntDesign
                      name={toDos[key].done ? "checkcircle" : "checkcircleo"}
                      size={24}
                      color={toDos[key].done ? "green" : "black"}
                    />
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <View>
                    <Text>
                      <Fontisto name="trash" size={18} color={theme.grey} />
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  Header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },

  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  texticon: {
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 20,
  },
  text: {
    backgroundColor: "white",
    width: "70%",
    borderRadius: 10,
    fontSize: 16,
  },
});
