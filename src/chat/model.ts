import type { User } from "@/shared/model/User";

export type Message = {
  sessionId: number,
  id: number,
  sendTime: Date,
  user: User,
  text: string,
};

export type Input = {
  timeout: Date,
};

export type End = {
  endTime: Date,
}
