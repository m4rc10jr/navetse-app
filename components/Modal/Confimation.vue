<template>
  <modal v-model="model" :width="width" @close="$emit('abort')">
    <v-toolbar-title slot="header">Tem Certeza?</v-toolbar-title>

    <v-card-text class="py-2">
      <slot v-if="isRoot || isAdmin">
        <p class="mb-0">Tem certeza que deseja prosseguir com esta ação?</p>
      </slot>

      <v-row v-if="isCommonUser">
        <column md="12">
          <input-text
            label="Código de Autorização"
            placeholder="Solicite ao administrador da empresa"
            v-model.trim="form.token"
            @input="$v.form.token.$touch"
            :errors="watchErrorMessages('token')"
          />
        </column>
      </v-row>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <v-btn depressed color="error" @click="$emit('abort')"> Cancelar </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        @click="confirm"
        :disabled="$v.form.$invalid"
        depressed
      >
        Ok
      </v-btn>
    </v-card-actions>
  </modal>
</template>

<script>
import { maxLength, minLength, requiredIf } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import validate from '../../mixins/validate'

export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },

    width: {
      type: [String, Number],
      default: '25vw',
    },

    action: {
      type: String,
      default: 'delete',
    },
  },

  mixins: [validate],

  data: () => ({
    form: {
      token: null,
    },
  }),

  validations() {
    return {
      form: {
        token: {
          required: requiredIf((vm) => this.isCommonUser),
          minLength: minLength(6),
          maxLength: maxLength(6),
        },
      },
    }
  },

  computed: {
    model: {
      get() {
        return this.value
      },

      set(value) {
        this.$emit('input', value)
      },
    },

    isCommonUser() {
      return !this.isAdmin && !this.isRoot
    },

    ...mapGetters('account', ['isAdmin', 'isRoot']),
  },

  methods: {
    confirm() {
      if (this.isRoot || this.isAdmin) {
        return this.$emit('confirmed')
      }

      this.$emit('confirmed', this.form.token)
    },
  },
}
</script>

<style lang="scss" scoped></style>
