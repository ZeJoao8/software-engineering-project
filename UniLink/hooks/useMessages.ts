import { useEffect, useState } from "react";
import { subscribeByRide } from "../repositories/MessageRepository";
import type { Message } from "../domain/entities/Message";

export function useMessages(rideId: string | null): Message[] {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!rideId) return;
    const unsub = subscribeByRide(rideId, msgs => setMessages(msgs), () => {});
    return () => unsub();
  }, [rideId]);

  return messages;
}
