<script lang="ts">
import { type User, systemUser } from "@/shared/model/User";
import { useUserStore } from "@/shared/stores/user";

export default {
  props: {
    user: {
      type: Object,
      validator(value) {
        if (value == null) {
          return false;
        } else {
          const user = value as User;
          return typeof user.name === "string" && typeof user.avatar === "string" && typeof user.avatarColor === "string";
        }
      }
    },
    sent: Boolean
  },
  setup() {
    const userStore = useUserStore();
    return {
      userStore,
    };
  },
  data() {
    return {
      validatedUser: this.user as User,
      currentUser: null as User | null,
      systemUser
    };
  },
  async created() {
    this.currentUser = await this.userStore.getCurrentUser();
  }
};
</script>
<template>
  <div v-if="currentUser !== null" class="q-message-avatar row flex-center" :class="sent ? 'q-message-avatar--sent' : 'q-message-avatar--received'" :style="{ backgroundColor: validatedUser.avatarColor, color: 'white' }">
    <span v-if="validatedUser.name === currentUser.name" class="custom-avatar">{{validatedUser.avatar}}</span>
    <img v-if="validatedUser.name === systemUser.name" src="@/assets/robot.svg" class="q-message-avatar" />
  </div>
</template>
