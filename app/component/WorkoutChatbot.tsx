import React, { useState } from "react";
import {
  View,
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
      const response = await fetch("http://138.47.138.205:5000/chat", {
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
    <View style={{ flex: 1 }}>
      {/* Floating Button */}
      <TouchableOpacity style={styles.chatButton} onPress={() => setChatVisible(!chatVisible)}>
        <Feather name="message-circle" size={28} color="white" />
      </TouchableOpacity>

      {/* Chat Popup Box */}
      {chatVisible && (
        <KeyboardAvoidingView
          style={styles.popupContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}
        >
          <View style={styles.chatBox}>
            <ScrollView
              contentContainerStyle={styles.chatMessages}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((msg, index) => (
                <Text key={index} style={msg.role === "user" ? styles.userMsg : styles.botMsg}>
                  {msg.content}
                </Text>
              ))}
              {loading && <ActivityIndicator color="white" />}
            </ScrollView>

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
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    position: "absolute",
    bottom: 60,
    right: 20,
    backgroundColor: "#ffa500",
    padding: 16,
    borderRadius: 50,
    elevation: 5,
    zIndex: 99,
  },
  popupContainer: {
    position: "absolute",
    bottom: 150,
    right: 20,
    width: 300,
    height: 400,
    backgroundColor: "transparent",
    zIndex: 100,
  },
  chatBox: {
    flex: 1,
    backgroundColor: "#1e1e2d",
    borderRadius: 20,
    padding: 10,
    overflow: "hidden",
  },
  chatMessages: {
    flexGrow: 1,
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
    marginTop: 5,
  },
  chatInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
  },
});

export default WorkoutChatbot;
