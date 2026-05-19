import * as MessageRepo from "../repositories/MessageRepository";
import type { Message } from "../domain/entities/Message";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export async function sendMessage(
  message: Message,
  currentUserId: string
): Promise<Result> {
  if (message.senderId !== currentUserId)
    return { ok: false, error: "Sender mismatch." };

  try {
    await MessageRepo.send(message);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not send the message. Please try again." };
  }
}
