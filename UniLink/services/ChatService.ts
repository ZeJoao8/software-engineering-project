import * as MessageRepo from "../repositories/MessageRepository";
import { generateId } from "../infra/firebase";
import { createNotification } from "./NotificationService";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function sendMessage(
  rideId: string,
  senderId: string,
  text: string,
  notify?: { senderName: string; recipientIds: string[]; rideRoute: string }
): Promise<Result> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Message cannot be empty." };

  try {
    await MessageRepo.send({
      id: generateId("chat_messages"),
      rideId,
      senderId,
      text: trimmed,
      createdAt: new Date().toISOString(),
    });
  } catch {
    return { ok: false, error: "Could not send the message. Please try again." };
  }

  if (notify) {
    const preview = trimmed.length > 60 ? trimmed.slice(0, 57) + "…" : trimmed;
    for (const uid of notify.recipientIds) {
      void createNotification({
        userId: uid,
        type: "chat_message",
        title: `${notify.senderName}: ${preview}`,
        body: notify.rideRoute,
        rideId,
      });
    }
  }

  return { ok: true };
}
