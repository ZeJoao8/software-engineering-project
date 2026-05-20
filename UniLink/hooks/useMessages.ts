import { useEffect, useState } from "react";

import {
  syncMessagesForRide,
  stopMessagesSync,
  getMessages,
  subscribeToMessageChanges,
} from "../store/messageStore";
import type { Message } from "../domain/entities/Message";

export function useMessages(rideId: string | null): Message[] {
  const [messages, setMessages] = useState<Message[]>(() => getMessages());

  useEffect(() => {
    if (!rideId) {
      stopMessagesSync();
      setMessages([]);
      return;
    }

    syncMessagesForRide(rideId);
    setMessages(getMessages());
    return subscribeToMessageChanges(() => setMessages(getMessages()));
  }, [rideId]);

  return messages;
}
