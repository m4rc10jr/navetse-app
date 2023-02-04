<template>
  <v-card flat>
    <v-card-title class="justify-center">
      <h2 class="heading-3">Área Restrita</h2>
    </v-card-title>

    <v-card-text>
      <v-text-field
        label="E-mail"
        outlined
        dense
        :error-messages="usernameError"
        v-model.trim="$v.credentials.username.$model"
      />

      <v-text-field
        label="Senha"
        type="password"
        dense
        outlined
        :error-messages="passwordError"
        placeholder="******"
        v-model.trim="$v.credentials.password.$model"
      />
    </v-card-text>

    <v-card-actions>
      <v-btn nuxt to="/password/forgot" text>Recuperar Senha?</v-btn>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        :loading="isLoading"
        depressed
        :disabled="isLoading || $v.credentials.$invalid"
        @click.stop="login(credentials)"
        >Acessar</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { required, minLength, email } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'

export default {
  layout: 'default',

  name: 'Login',

  data: () => ({
    credentials: {
      username: '',
      password: '',
    },
  }),

  watch: {
    credentials: {
      deep: true,
      handler(input) {
        for (let [key, value] of Object.entries(input)) {
          if (!value) {
            this.$v.credentials[key].$reset()
          }
        }
      },
    },
  },

  validations: {
    credentials: {
      username: {
        required,
        email,
      },
      password: {
        required,
        minLength: minLength(6),
      },
    },
  },

  computed: {
    usernameError() {
      const input = this.$v.credentials.username
      const errors = []

      if (!input.$dirty) return errors

      !input.required && errors.push('e-mail requerido')
      !input.email && errors.push('informe um e-mail válido')

      return errors
    },

    passwordError() {
      const input = this.$v.credentials.password
      const errors = []

      if (!input.$dirty) return errors

      !input.required && errors.push('requer senha')
      !input.minLength && errors.push('a senha requer 6 caracteres')

      return errors
    },

    ...mapGetters({
      requestError: 'request/message',
      isLoading: 'request/loading',
    }),
  },

  middleware({ store, redirect }) {
    if (store.getters['account/guest']) {
      redirect('/')
    }
  },

  methods: {
    async login(credentials) {
      try {
        await this.$store.dispatch('account/login', credentials)
      } catch (e) {
        this.$notify.error(this.requestError || 'Não foi possivel conectar.')
      }
    },
  },
}
</script>
