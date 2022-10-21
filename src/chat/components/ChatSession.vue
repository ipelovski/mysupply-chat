<script lang="ts">
import type { User } from "@/shared/model/User";
import { useUserStore } from "@/shared/stores/user";
import type { End, Input, Message } from "../model";
import {
  useSessionStore,
  useCurrentSessionActionStore,
} from "../stores/session";
import ChatAvatar from "./ChatAvatar.vue";

type ChatMessage = {
  id: number;
  user: {
    name: string;
    avatar: string;
    avatarColor: string;
  };
  text: string[];
};

export default {
  components: {
    ChatAvatar,
  },
  setup() {
    const sessionStore = useSessionStore();
    const actionStore = useCurrentSessionActionStore();
    const userStore = useUserStore();
    return {
      sessionStore: sessionStore,
      actionStore,
      clearTimeoutProgress: -1,
      userStore,
    };
  },
  data() {
    return {
      next: null as Message | Input | End | null,
      timeoutProgress: 0,
      bidTimeout: 0,
      messageInputValue: "",
      currentUser: null as User | null,
    };
  },
  computed: {
    chatMessages(): ChatMessage[] {
      return this.sessionStore.messages.reduce((messages, item, index) => {
        if (index > 0) {
          const previous = messages[messages.length - 1];
          if (item.user.name === previous.user.name) {
            previous.text.push(item.text);
            return messages;
          }
        }
        messages.push({
          id: item.id,
          user: item.user,
          text: [item.text],
        });
        return messages;
      }, [] as ChatMessage[]);
    },
  },
  methods: {
    startTimeout(timeout: Date) {
      clearInterval(this.clearTimeoutProgress);
      this.setFocus();
      let expectedEnd = timeout.getTime();
      this.clearTimeoutProgress = setInterval(() => {
        const now = new Date().getTime();
        this.timeoutProgress =
          (expectedEnd - now) / this.sessionStore.defaultTimeout;
        this.bidTimeout = ((expectedEnd - now) / 1000 + 1) | 0;
        if (this.timeoutProgress <= 0) {
          this.timeoutProgress = 0;
          this.bidTimeout = 0;
          clearInterval(this.clearTimeoutProgress);
        }
      }, 50);
    },
    async sendBid() {
      const bid = this.messageInputValue || 0;
      this.messageInputValue = "";
      this.next = null;
      await this.sessionStore.sendMessage({
        user: this.currentUser!,
        sessionId: this.sessionStore.session!.id,
        text: bid + "€",
      });
    },
    setFocus() {
      // according to the documentation the $refs should be available in mounted, but this one $ref is not
      const interval = setInterval(() => {
        if (this.$refs.messageInput != null) {
          clearInterval(interval);
          (this.$refs.messageInput as HTMLInputElement).focus();
        }
      }, 10);
    },
  },
  async created() {
    this.currentUser = await this.userStore.getCurrentUser();
  },
  async mounted() {
    this.actionStore.$subscribe((mutation, state) => {
      if (state.action !== null && "timeout" in state.action) {
        this.startTimeout(state.action.timeout);
      }
    });
    await this.sessionStore.create();
  },
  unmounted() {
    clearInterval(this.clearTimeoutProgress);
  },
};
</script>
<template>
  <div v-if="currentUser !== null" class="q-pa-md row justify-center">
    <div style="width: 100%; max-width: 640px">
      <q-chat-message
        v-for="message in chatMessages"
        :key="message.id"
        :text="message.text"
        :sent="message.user.name === currentUser.name"
        :bg-color="message.user.avatarColor"
      >
        <template v-slot:avatar>
          <ChatAvatar
            :user="message.user"
            :sent="message.user.name === currentUser.name"
          />
        </template>
      </q-chat-message>
    </div>
  </div>
  <div
    v-if="actionStore.action !== null && 'timeout' in actionStore.action"
    class="client-message"
  >
    <div class="row flex-center">
      <q-linear-progress rounded :value="timeoutProgress" instant-feedback />
    </div>
    <div class="row flex-center">{{ bidTimeout }} seconds</div>
    <div class="row flex-center">
      <span class="input">
        <input
          type="text"
          v-model="messageInputValue"
          @keypress.enter="(event) => sendBid()"
          ref="messageInput"
        />&nbsp;<span>€</span>
      </span>
      <q-btn
        color="primary"
        class="btn"
        unelevated
        label="Send"
        @click="sendBid()"
      />
    </div>
  </div>
</template>
<style scoped>
.client-message .input {
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.24);
  outline: none;
  height: 36px;
  padding: 6px;
}
.client-message .input input {
  border: none;
  outline: none;
  text-align: right;
}
.client-message .btn {
  margin-left: 10px;
}
</style>
