import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AppLoading from "expo-app-loading";
import React from "react";
import { StyleSheet, View, Platform, Text } from "react-native";
import {
  Bubble,
  GiftedChat,
  SystemMessage,
  Send,
} from "react-native-gifted-chat";

import { NavBar } from "./components/navbar";

import wretch from "wretch";

import { CHAT_GPT_KEY } from "@env";

const styles = StyleSheet.create({
  container: { flex: 1 },
});

const KEY = "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";

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [messages, setMessages] = React.useState([]);

  const user = {
    _id: 1,
    name: "Sender",
  };

  const bot = {
    _id: 2,
    name: "Bot",
  };

  React.useEffect(() => {
    setAppIsReady(true);
    setMessages([]);
  }, []);

  const onSend = (messages = []) => {
    setStep((prev) => prev + 1);
    setMessages((prev: any) => {
      const sentMessages = [{ ...messages[0], sent: true, received: true }];
      return GiftedChat.append(prev, sentMessages, Platform.OS !== "web");
    });

    setIsTyping(true);

    wretch("https://api.openai.com/v1/chat/completions")
      .headers({
        Authorization: `Bearer ${CHAT_GPT_KEY}`,
      })
      .post({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: messages[0].text }],
      })
      .json(({ choices }) => {
        botSend(step, choices[0].message.content);
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  const botSend = (step: number, message: string) => {
    setMessages((previousState: any) => {
      return GiftedChat.append(
        previousState,
        [
          {
            _id: step,
            text: message,
            createdAt: new Date(),
            user: bot,
            sent: true,
            received: true,
          },
        ],
        Platform.OS !== "web"
      );
    });
  };

  if (!appIsReady) {
    return <AppLoading />;
  }

  return (
    <View style={styles.container} accessibilityLabel="main" testID="main">
      <NavBar />
      <GiftedChat
        messages={messages}
        user={user}
        scrollToBottom
        onSend={onSend}
        renderChatEmpty={() => (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>{"Simple ChatGPT Bot"}</Text>
            <Text style={{ marginTop: 6 }}>
              {"Hand Crafted With ❤️ By "}
              <Text style={{ fontWeight: "bold" }}>Rizkhal</Text>
            </Text>
          </View>
        )}
        messagesContainerStyle={
          messages?.length == 0 && { transform: [{ scaleY: -1 }] }
        }
        onLongPressAvatar={(user) => alert(JSON.stringify(user))}
        renderSend={(props) => (
          <Send {...props} containerStyle={{ justifyContent: "center" }}>
            <MaterialIcons
              size={30}
              color={"grey"}
              name={"send"}
              style={{ marginRight: 8 }}
            />
          </Send>
        )}
        renderSystemMessage={(props) => (
          <SystemMessage
            {...props}
            containerStyle={{
              marginBottom: 15,
            }}
            textStyle={{
              fontSize: 14,
            }}
          />
        )}
        renderBubble={(props) => <Bubble {...props} />}
        keyboardShouldPersistTaps="never"
        quickReplyStyle={{ borderRadius: 2 }}
        quickReplyTextStyle={{
          fontWeight: "200",
        }}
        inverted={Platform.OS !== "web"}
        timeTextStyle={{ left: { color: "red" }, right: { color: "yellow" } }}
        isTyping={isTyping}
        infiniteScroll
      />
    </View>
  );
}
