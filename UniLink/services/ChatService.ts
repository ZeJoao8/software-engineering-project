import * as MessageRepo from "../repositories/MessageRepository";
import { generateId } from "../infra/firebase";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function sendMessage(
  rideId: string,
  senderId: string,
  text: string
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
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not send the message. Please try again." };
  }
}
