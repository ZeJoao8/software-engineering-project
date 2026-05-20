import { sendMessage } from "../../services/ChatService";

jest.mock("../../repositories/MessageRepository", () => ({
  send: jest.fn(),
}));

jest.mock("../../infra/firebase", () => ({
  generateId: jest.fn(() => "msg-generated-id"),
}));

import * as MessageRepo from "../../repositories/MessageRepository";

beforeEach(() => jest.clearAllMocks());

describe("ChatService.sendMessage", () => {
  test("sends the message with trimmed text", async () => {
    MessageRepo.send.mockResolvedValueOnce();
    const result = await sendMessage("ride-1", "user-1", "  Hello!  ");
    expect(result).toEqual({ ok: true });
    expect(MessageRepo.send).toHaveBeenCalledWith(
      expect.objectContaining({
        rideId: "ride-1",
        senderId: "user-1",
        text: "Hello!",
      })
    );
  });

  test("does not call the repo when text is empty", async () => {
    const result = await sendMessage("ride-1", "user-1", "");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/empty/i);
    expect(MessageRepo.send).not.toHaveBeenCalled();
  });

  test("does not call the repo when text is only whitespace", async () => {
    const result = await sendMessage("ride-1", "user-1", "   ");
    expect(result.ok).toBe(false);
    expect(MessageRepo.send).not.toHaveBeenCalled();
  });

  test("returns error when repo throws", async () => {
    MessageRepo.send.mockRejectedValueOnce(new Error("Firebase down"));
    const result = await sendMessage("ride-1", "user-1", "Hello!");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/try again/i);
  });
});
