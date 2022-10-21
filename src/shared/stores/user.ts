import { defineStore } from "pinia";
import { type User, systemUser } from "../model/User";

export const useUserStore = defineStore("user", {
  state: () => ({
    currentUser: null as User | null,
    systemUser,
  }),
  actions: {
    async getCurrentUser(): Promise<User> {
      if (this.currentUser === null) {
        this.currentUser = {
          name: "John Doe",
          avatar: "J",
          avatarColor: "blue",
        };
      }
      return this.currentUser;
    },
  },
});
