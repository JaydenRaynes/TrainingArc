// WorkoutChatbot.tsx
import React, { useState } from "react";
import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { theme } from "../utils/theme";

const WorkoutChatbot = () => {
  const [chatVisible, setChatVisible] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! I'm your AI workout assistant. How can I help today?" },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const newMessages = [...messages, { role: "user", content: chatInput }];
    setMessages(newMessages);
    setChatInput("");
    setLoading(true);

    try {
      const response = await fetch("http://192.168.1.208:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Oops! Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity style={styles.chatButton} onPress={() => setChatVisible(true)}>
        <Feather name="message-circle" size={28} color="white" />
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal visible={chatVisible} animationType="slide" transparent>
        <View style={styles.chatContainer}>
          <View style={styles.chatBox}>
            <ScrollView contentContainerStyle={styles.chatMessages}>
              {messages.map((msg, index) => (
                <Text key={index} style={msg.role === "user" ? styles.userMsg : styles.botMsg}>
                  {msg.content}
                </Text>
              ))}
              {loading && <ActivityIndicator color="white" />}
            </ScrollView>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
              <View style={styles.chatInputArea}>
                <TextInput
                  style={styles.chatInput}
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Ask a workout question..."
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity onPress={sendMessage} disabled={loading || !chatInput.trim()}>
                  <Feather name="send" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => setChatVisible(false)}>
                <Text style={{ color: "white", textAlign: "center", marginTop: 10 }}>Close</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    position: "absolute",
    bottom: 120,
    right: 20,
    backgroundColor: "#ffa500",
    padding: 16,
    borderRadius: 50,
    elevation: 5,
    zIndex: 99,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  chatBox: {
    backgroundColor: "#1e1e2d",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "65%",
  },
  chatMessages: {
    paddingBottom: 10,
  },
  userMsg: {
    color: "#fff",
    alignSelf: "flex-end",
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  botMsg: {
    color: "#fff",
    alignSelf: "flex-start",
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  chatInputArea: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  chatInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
  },
});

export default WorkoutChatbot;
