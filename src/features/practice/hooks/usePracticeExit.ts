import { useEffect, useState } from "react";
import { BackHandler, Platform } from "react-native";
import { useApplication } from "../../../context/ApplicationContext";
import { Copy } from "../../../i18n/en";

export function usePracticeExit({ copy, completed, answeredCount, totalQuestions, onBack, isExam }: {
  copy: Copy; completed: boolean; answeredCount: number; totalQuestions: number; onBack: () => void; isExam: boolean;
}) {
  const { track } = useApplication();
  const [dialogVisible, setDialogVisible] = useState(false);
  const title = isExam ? copy.game.examExitTitle : copy.game.exitConfirmTitle;
  const message = isExam ? copy.game.examExitMessage : copy.game.exitConfirmMessage;
  const trackAbandon = () => track("session_abandoned", {
    questionsAnswered: answeredCount,
    questionsTotal: totalQuestions,
  });
  const requestExit = () => {
    if (completed) {
      onBack();
      return;
    }
    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n${message}`)) {
        trackAbandon();
        onBack();
      }
    } else {
      setDialogVisible(true);
    }
  };
  const confirmExit = () => {
    setDialogVisible(false);
    trackAbandon();
    onBack();
  };
  const cancelExit = () => setDialogVisible(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      requestExit();
      return true;
    });
    return () => subscription.remove();
  }, [requestExit]);

  return { dialogVisible, title, message, requestExit, confirmExit, cancelExit };
}
