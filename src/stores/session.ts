import { defineStore } from "pinia";

export const systemUser: Message["user"] = {
  name: "system",
  avatar: "",
  avatarColor: "orange",
};
const bidTimeout = 15 * 1000;
const winningBidTreshold = 3000;

type State = {
  session: Session | null,
  messages: Message[],
  defaultTimeout: number,
};

export type Session = {
  id: number,
  price: number,
  startTime: Date,
  endTime: Date | null,
};

export type Message = {
  sessionId: number,
  id: number,
  sendTime: Date,
  user: {
    name: string,
    avatar: string,
    avatarColor: string,
  },
  text: string,
};

export type Input = {
  timeout: number,
};

export type End = {
  endTime: Date,
}

export type ClinetMessage = {
  sessionId: number,
  user: Message["user"],
  text: string,
}

enum SessionStep {
  started,
  sayHello,
  sendPrice,
  expectBid,
  checkPrice,
  end
}

const messageTexts = {
  hello: "Hello there!",
  sendPrice(price: number) {
    return `The current price is €${price}. What is your bid?`;
  },
  sendPriceTimeout: "Please hurry up!",
  sendLowerPrice: "Thank you. This is quite far from what we expected. So please enter a more improved offer.",
  end: "Congratulations, you got the deal!"
}

const sessionSteps = new WeakMap<Session, SessionStep>();

export const useSessionStore = defineStore("session", {
  state: (): State => ({
    session: null,
    messages: [],
    defaultTimeout: bidTimeout,
  }),
  actions: {
    async create(): Promise<Session> {
      this.session = {
        id: (Math.random() * 1000) | 0,
        price: 10000,
        startTime: new Date(),
        endTime: null,
      };
      sessionSteps.set(this.session, SessionStep.started);
      return Promise.resolve(this.session);
    },
    async getMessages(sessionId: number): Promise<Message[]> {
      return Promise.resolve(this.messages.filter(message => message.sessionId === sessionId));
    },
    async next(): Promise<Message | Input | End> {
      if (this.session === null) {
        return {
          endTime: new Date(),
        }
      }
      const step = sessionSteps.get(this.session) || SessionStep.started;
      if (step === SessionStep.started) {
        sessionSteps.set(this.session, SessionStep.sayHello);
        const message = {
          sessionId: this.session.id,
          id: this.messages.length,
          sendTime: new Date(),
          user: systemUser,
          text: messageTexts.hello,
        };
        this.messages.push(message);
        return Promise.resolve(message);
      }
      if (step === SessionStep.sayHello) {
        sessionSteps.set(this.session, SessionStep.sendPrice);
        const message = {
          sessionId: this.session.id,
          id: this.messages.length,
          sendTime: new Date(),
          user: systemUser,
          text: messageTexts.sendPrice(this.session.price),
        };
        this.messages.push(message);
        return Promise.resolve(message);
      }
      if (step === SessionStep.sendPrice) {
        sessionSteps.set(this.session, SessionStep.expectBid);
        return Promise.resolve({
          timeout: bidTimeout,
        });
      }
      if (step === SessionStep.expectBid) {
        const lastMessage = this.messages[this.messages.length - 1];
        const currentTime = new Date();
        const timeout = bidTimeout - (currentTime.getTime() - lastMessage.sendTime.getTime());
        if (timeout > 0) {
          return Promise.resolve({
            timeout,
          });
        } else {
          const message = {
            sessionId: this.session.id,
            id: this.messages.length,
            sendTime: new Date(),
            user: systemUser,
            text: messageTexts.sendPriceTimeout,
          };
          this.messages.push(message);
          return Promise.resolve(message);
        }
      }
      if (step === SessionStep.checkPrice) {
        const lastMessage = this.messages[this.messages.length - 1];
        const price = Number.parseInt(lastMessage.text, 10);
        this.session.price = price;
        if (!Number.isNaN(price) && price <= winningBidTreshold && price > 0) {
          sessionSteps.set(this.session, SessionStep.end);
          const message = {
            sessionId: this.session.id,
            id: this.messages.length,
            sendTime: new Date(),
            user: systemUser,
            text: messageTexts.end,
          };
          this.messages.push(message);
          return Promise.resolve(message);
        } else {
          sessionSteps.set(this.session, SessionStep.expectBid);
          const message = {
            sessionId: this.session.id,
            id: this.messages.length,
            sendTime: new Date(),
            user: systemUser,
            text: messageTexts.sendLowerPrice,
          };
          this.messages.push(message);
          return Promise.resolve(message);
        }
      }
      return Promise.resolve({
        endTime: new Date(),
      });
    },
    async sendMessage(clientMessage: ClinetMessage): Promise<void> {
      if (this.session === null) {
        return Promise.reject("No session");
      }
      sessionSteps.set(this.session, SessionStep.checkPrice);
      const message = {
        sessionId: clientMessage.sessionId,
        id: this.messages.length,
        sendTime: new Date(),
        user: clientMessage.user,
        text: clientMessage.text,
      };
      this.messages.push(message);
    }
  },
});
