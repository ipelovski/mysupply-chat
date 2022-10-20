<script lang="ts">
import {systemUser} from "@/stores/session";

const currentUser = "John Doe";

type User = {
  name: string,
  avatar: string,
  avatarColor: string,
};

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
  data() {
    return {
      validatedUser: this.user as User,
      currentUser,
      systemUser
    };
  }
};
</script>
<template>
  <div class="q-message-avatar row flex-center" :class="sent ? 'q-message-avatar--sent' : 'q-message-avatar--received'" :style="{ backgroundColor: validatedUser.avatarColor, color: 'white' }">
    <span v-if="validatedUser.name === currentUser" class="custom-avatar">{{validatedUser.avatar}}</span>
    <img v-if="validatedUser.name === systemUser.name" src="@/assets/robot.svg" class="q-message-avatar" />
  </div>
</template>
