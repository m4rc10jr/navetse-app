<template>
  <div>
    <v-snackbar
      v-model="snackbar"
      v-bind="notification"
      v-if="notification.message"
    >
      <v-icon left large dark v-if="notification.icon">
        {{ notification.icon || 'mdi-information' }}
      </v-icon>

      <span v-if="typeof notification.message === 'string'">{{
        notification.message
      }}</span>

      <span v-else>{{ notification.message.join('\n') }}</span>

      <ul>
        <li v-for="(error, index) in notification.description" :key="index">
          <span v-if="typeof error === 'string'">{{ error }}</span>
          <span v-else>{{ error[0] }}</span>
        </li>
      </ul>

      <ul v-if="typeof message === 'object' && hasError">
        <li v-for="(error, index) in message" :key="index">
          <span v-if="typeof error === 'string'">{{ error }}</span>
          <span v-else>{{ error[0] }}</span>
        </li>
      </ul>
    </v-snackbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Notify',
  computed: {
    snackbar: {
      get() {
        return this.isNotify
      },

      set(value) {
        this.$store.commit('layout/update_notification', { model: value })
      },
    },
    ...mapGetters({
      isNotify: 'layout/isNotify',
      notification: 'layout/notification',
      message: 'request/message',
      hasError: 'request/hasError',
    }),
  },
}
</script>

<style lang="scss" scoped></style>
