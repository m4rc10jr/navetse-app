<template>
  <page>
    <breadcrumb title="Perfil" slot="header" />

    <v-card dense>
      <v-card-text>
        <v-row v-if="!form.root" class="mt-1">
          <v-col cols md="3" class="pt-4">
            <input-text
              label="Empresa"
              :value="form.company.name"
              disabled
              outlined
            />
          </v-col>

          <v-col cols md="3" class="pt-0">
            <div class="d-flex flex-column">
              <span style="font-size: 12px">Modulo de Vendas</span>
              <span style="margin-top: 0.5rem">
                <v-chip
                  outlined
                  small
                  :color="form.company.has_sales ? 'green' : 'error'"
                  :dark="form.company.has_sales"
                  >{{
                    form.company.has_sales ? 'Habilitado' : 'Desativado'
                  }}</v-chip
                >
              </span>
            </div>
          </v-col>

          <v-col cols md="3" class="pt-0">
            <div class="d-flex flex-column">
              <span style="font-size: 12px">Modulo de Notificação</span>
              <span style="margin-top: 0.5rem">
                <v-chip
                  outlined
                  small
                  :color="form.company.has_notification ? 'green' : 'error'"
                  :dark="form.company.has_notification"
                >
                  {{
                    form.company.has_notification ? 'Habilitado' : 'Desativado'
                  }}
                </v-chip>
              </span>
            </div>
          </v-col>
        </v-row>
        <v-divider class="mt-3" v-if="!form.root" />
        <v-row class="mt-1">
          <v-col cols md="3">
            <input-text
              label="Nome"
              v-model.trim="form.name"
              @input="$v.form.name.$touch"
              :error-messages="watchErrorMessages('name')"
              placeholder="Seu nome"
            />
          </v-col>

          <v-col cols md="3">
            <v-text-field
              label="E-mail"
              placeholder="example@gmail.com"
              v-model="form.email"
              readonly
              outlined
              dense
              hide-details
              type="email"
            />
          </v-col>

          <v-col cols md="3">
            <input-password
              label="Senha"
              v-model.trim="form.password"
              @input="$v.form.password.$touch"
              :error-messages="watchErrorMessages('password')"
            />
          </v-col>

          <v-col cols md="3">
            <input-password
              label="Repetir Senha"
              v-model.trim="form.password_confirmation"
              @input="$v.form.password_confirmation.$touch"
              :error-messages="watchErrorMessages('password_confirmation')"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols md="3" class="pt-4">
            <input-text
              label="Cadastrado Em"
              :value="form.created_at"
              disabled
            />
          </v-col>

          <v-col cols md="3" class="pt-4">
            <input-text
              label="Atualizado Em"
              :value="form.updated_at"
              disabled
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-btn depressed @click="$router.push('/')">
          <custom-icon>chevron_left</custom-icon>
          <span class="ml-1">Voltar</span>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="$v.form.$invalid"
          depressed
          @click="save(form)"
          >Salvar</v-btn
        >
      </v-card-actions>
    </v-card>
  </page>
</template>

<script>
import { required, minLength, sameAs } from 'vuelidate/lib/validators'
import { mapActions, mapGetters } from 'vuex'
import validate from '~/mixins/validate'

export default {
  layout: 'dashboard',

  name: 'Profile',

  data: () => ({
    form: {
      password: '',
      password_confirmation: '',
    },
  }),

  mixins: [validate],

  computed: {
    ...mapGetters({
      loading: 'request/loading',
      account: 'account/data',
      requestError: 'getErrorMessage',
    }),
  },

  validations: {
    form: {
      name: {
        required,
        minLength: minLength(6),
      },
      password: {
        minLength: minLength(6),
      },
      password_confirmation: {
        sameAs: sameAs('password'),
      },
    },
  },

  methods: {
    ...mapActions({
      save: 'account/save',
    }),
  },

  created() {
    this.form = {
      ...this.form,
      ...this.account,
    }
  },
}
</script>

<style lang="scss" scoped></style>
