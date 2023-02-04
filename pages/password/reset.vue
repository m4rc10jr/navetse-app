<template>
  <v-card flat>
    <v-card-title class="justify-center">
      <h2 class="heading-2">Informar Senha</h2>
    </v-card-title>

    <v-card-text>
      <v-text-field
        label="Senha"
        outlined
        :error-messages="watchErrorMessages('password')"
        v-model.trim="$v.form.password.$model"
      />

      <v-text-field
        label="Repetir Senha"
        outlined
        :error-messages="watchErrorMessages('password_confirmation')"
        v-model.trim="$v.form.password_confirmation.$model"
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
        @click.stop="send(form)"
        >Enviar</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { required, minLength, sameAs } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import validate from '~/mixins/validate'
export default {
  layout: 'default',

  mixins: [validate],

  name: 'PasswordRequest',

  data: () => ({
    form: {
      password: '',
      password_confirmation: '',
    },
  }),

  validations: {
    form: {
      password: {
        required,
        minLenght: minLength(6),
      },
      password_confirmation: {
        sameAsPassword: sameAs('password'),
      },
    },
  },

  computed: {
    ...mapGetters({
      requestError: 'getErrorMessage',
      loading: 'request/loading',
    }),
  },

  async middleware({ store, redirect, route, $axios, $notify }) {
    if (store.getters['guest']) {
      redirect('/')
    }

    const { token = null } = route.query

    if (!token) {
      redirect('/password/forgot')
    }

    try {
      const data = $axios.$get(`/password/check?token=${token}`)

      if (data.expired) {
        $notify.error('A solicitação expirou, solicite novamente!', {
          onComplete: () => redirect('/password/forgot'),
        })

        return
      }
    } catch (e) {
      const errors = e.response.data.errors.filter((h) => h)
      $notify.error(
        errors.length > 0 ? errors[0] : 'Não existe uma solicitação em aberto.',
        {
          onComplete: () => redirect('/login'),
        }
      )
    }
  },

  methods: {
    async send(form) {
      try {
        form.token = this.$route.query.token

        const data = await this.$axios.$post(`password/reset`, form)

        this.$notify.info(data.message, {
          onComplete: () => this.$router.push('/login'),
        })
      } catch (e) {
        this.$notify.error(this.requestError)
      }
    },
  },
}
</script>
