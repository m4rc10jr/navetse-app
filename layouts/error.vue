<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card flat color="transparent" v-if="typeof error === 'object'">
          <v-card-title class="d-flex flex-column">
            <h1 style="font-size: 64px">{{ statusCode }}</h1>
            <v-divider dark class="py-2"></v-divider>
            <p class="headline">{{ statusText }}</p>
          </v-card-title>
          <v-card-text>
            <ul v-if="error.errors && error.errors.length > 0">
              <li v-for="(message, index) in error.errors" :key="index">
                {{ message }}
              </li>
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary darken-1" depressed @click="goto">
              <v-icon>mdi-chevron-left</v-icon>
              <span>Voltar</span>
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'EmptyLayout',

  layout: 'empty',

  props: {
    error: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred',
    }
  },

  head() {
    const title = this.statusCode === 404 ? this.pageNotFound : this.otherError

    return {
      title,
    }
  },

  computed: {
    statusCode() {
      return this.response?.status ?? this.error?.statusCode ?? 500
    },

    statusText() {
      let messages = {
        400: () => 'Pedido fraco, tente novamente.',
        401: () => 'Requer autenticação.',
        403: () => 'Requer permissões.',
        404: () => 'Recurso não localizado.',
        500: () => 'Falhou ao comunicar-se com o servidor',
      }

      return messages[this.statusCode]
        ? messages[this.statusCode]()
        : 'Opsss, erro não identificado'
    },

    ...mapGetters({
      response: 'request/response',
      message: 'request/message',
      route: 'context/route',
    }),
  },

  methods: {
    goto() {
      return this.statusCode === 404
        ? this.$router.push(this.route?.path ?? '/')
        : this.$router.go(-1)
    },
  },
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
