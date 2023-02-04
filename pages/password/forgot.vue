<template>
  <v-card flat>
    <v-card-title class="justify-center">
      <h2 class="heading-2">Recuperar Senha</h2>
    </v-card-title>

    <v-card-text>
      <v-text-field
        label="E-mail"
        outlined
        :error-messages="watchErrorMessages('email')"
        v-model.trim="$v.form.email.$model"
      />
    </v-card-text>

    <v-card-actions>
      <v-btn text nuxt to="/login" outlined>
        <custom-icon>chevron_left</custom-icon>
        <span>Login</span>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        :loading="loading"
        depressed
        :disabled="loading || $v.form.$invalid"
        @click.stop="request(form)"
        >Enviar</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import validate from '~/mixins/validate'
export default {
  layout: 'default',

  mixins: [validate],

  name: 'PasswordRequest',

  data: () => ({
    form: {
      email: '',
    },
  }),

  validations: {
    form: {
      email: {
        required,
        email,
      },
    },
  },

  computed: {
    ...mapGetters({
      loading: 'request/loading',
    }),
  },

  middleware({ store, redirect }) {
    if (store.getters['guest']) {
      redirect('/')
    }
  },

  methods: {
    async request(form) {
      try {
        const data = await this.$axios.$post('password/forgot', form)

        this.$notify.info(data.message, {
          onComplete: () => this.$router.push('/login'),
        })
      } catch (e) {
        const { response } = e

        const messages = {
          412: () => response.data.message,
          422: () => response.data.errors.join('<br>'),
        }

        const message = messages[response.status]
          ? messages[response.status]()
          : 'Não foi possivel executar a ação...'

        this.$notify.error(message)
      }
    },
  },
}
</script>
