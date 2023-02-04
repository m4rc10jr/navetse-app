<template>
  <div>
    <modal-confirmation
      v-model="menu"
      :action="action"
      @confirmed="confirm"
      @abort="cancel"
    >
      <p v-text="description"></p>
    </modal-confirmation>

    <v-tooltip bottom :disabled="formAction">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          depressed
          dark
          v-on="on"
          v-bind="{ ...attrs, ...buttonProps }"
          @click.stop="menu = true"
        >
          <v-slide-x-reverse-transition duration="200">
            <div
              class="d-flex align-center"
              :key="`restore-${id}`"
              v-if="action === 'restore'"
            >
              <custom-icon>restore_from_trash</custom-icon>
              <span class="hidden-sm-and-down" v-show="formAction"
                >Restaurar</span
              >
            </div>

            <div class="d-flex align-center" :key="`delete-${id}`" v-else>
              <custom-icon>delete</custom-icon>
              <span class="hidden-sm-and-down" v-show="formAction"
                >Remover</span
              >
            </div>
          </v-slide-x-reverse-transition>
        </v-btn>
      </template>
      <span>{{ action === 'restore' ? 'Restaurar' : 'Remover' }}</span>
    </v-tooltip>
  </div>
</template>

<script>
import { trim } from 'lodash'
import { mapGetters } from 'vuex'
export default {
  name: 'ButtonDelete',

  props: {
    endpoint: {
      type: String,
      required: true,
    },

    id: Number | null,

    table: {
      type: Boolean,
      default: false,
    },

    list: {
      type: Boolean,
      default: false,
    },

    formAction: {
      type: Boolean,
      default: false,
    },

    restore: {
      type: Boolean,
      default: false,
    },
  },

  components: {
    ModalConfirmation: () => import('../Modal/Confimation'),
  },

  data: () => ({
    menu: false,
    loading: false,
  }),

  computed: {
    buttonProps() {
      const display = this.formAction ? 'formAction' : 'default'

      return {
        default: () => ({
          icon: true,
          small: true,
          color: 'grey darken-2',
        }),
        formAction: () => ({
          icon: false,
          small: false,
          color: this.action === 'delete' ? 'error' : 'info darken-1',
        }),
      }[display]()
    },

    action() {
      return this.restore ? 'restore' : 'delete'
    },

    method() {
      return this.restore ? '$patch' : '$delete'
    },

    hasApiCollection() {
      return this.endpoint.includes('collection')
    },

    url() {
      return this.restore
        ? `/api/${this.model}/${this.id}/restore`
        : this.hasApiCollection
        ? `/api/${this.model}/${this.id}`
        : `${this.endpoint}/${this.id}`
    },

    model() {
      const model = trim(this.endpoint, '/').split('/')

      return model.length <= 2 ? model[1] : model[2]
    },

    description() {
      return this.restore
        ? 'Tem certeza que deseja restaurar esse registro?'
        : 'Tem certeza que deseja remover esse registro?'
    },
  },

  methods: {
    async confirm(code = null) {
      if (!this.id) {
        this.$notify.error('Não foi possível excluir o registro.')
        this.cancel()
        return
      }

      try {
        const params = {
          restore: () => ({
            model: this.model,
          }),

          delete: () => ({}),
        }

        code && this.$axios.setHeader('token', code)

        await this.$axios[this.method](this.url, params[this.action]())

        this.$emit('completed', this.id, {
          model: this.model,
          action: this.action,
        })
      } catch (e) {
        this.$toast.error(e.response.data.message)
      } finally {
        this.menu = false
      }
    },

    cancel() {
      this.$emit('canceled', this.id, {
        model: this.model,
        action: this.action,
      })

      this.menu = false
    },
  },
}
</script>

<style lang="scss" scoped></style>
