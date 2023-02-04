import { clone, cloneDeep } from "lodash"
import validate from "./validate"


let messages = {
  update: {
    success: 'Registro atualizado com sucesso',
    error: 'Erro ao atualizar registro',
  },
  create: {
    success: 'Registro criado com sucesso',
    error: 'Erro ao criar registro',
  }
}

export default {
  mixins: [validate],

  data: () => ({
    form: {},
    base: {},
    rules: {},
    endpoint: '/api',
    messages: {},
    item: {},
    original: {}
  }),

  watch: {
    '$v.form.$invalid'(value) {
      this.$emit('valid', !value)
    },

    item: {
      deep: true,
      handler(value) {
        if (Object.entries(value).length === 0) {
          this.reset()
          return
        }
        this.form = { ...value }
        this.$v.form.$reset()
      }
    },

    form: {
      deep: true,
      handler(value) {
        this.updateContext(value)
      }
    }
  },

  validations() {
    return {
      form: this.rules
    }
  },

  computed: {
    isNew() {
      return !this.item?.id && this.$route.params?.id === "create";
    },

    id() {
      return this.item?.id ?? null;
    },

    isMobile() {
      return this.$vuetify.breakpoint.smAndDown
    },

    errorMessage() {
      return this.$store.getters['request/message']
    },

    page() {
      return String(this.$route.path).match(/^\/(.+)\/(\d{1,})$/);
    },

    prevPage() {
      return this.page[1]
    },

    loading() {
      return this.$store.getters['request/loading']
    },
  },

  methods: {
    /**
     * Redefinir o formulário
     *
     * @returns {void}
     */
    reset() {
      this.form = clone({ ...this.base, ...this.item })
      this.$v.form.$reset()
      this.$store.commit('context/flush')
    },

    /**
     * Cancelar edição/cadastro.
     *
     * @returns {void}
     */
    cancel() {
      this.$emit('cancel', this.original);
      this.$v.form.$reset();
      this.$store.commit('context/flush')
      if (typeof this.cancelled === "function") {
        this.cancelled();
      }
    },

    /**
     * Obtem caminho da requisição.
     *
     * @returns {string}
     */
    getEndpoint() {
      const check = String(this.endpoint).match(/\?.*$/)
      let baseEndpoint = this.endpoint;
      let queryString = '';

      if(check && check.index > 0) {
        baseEndpoint = baseEndpoint.substr(0, check.index)
        queryString = check[0]
      }

      return `${baseEndpoint}/:id`.replace(':id', this.item?.id ?? '') + queryString
    },

    /**
     * Obtem metodo de requisição.
     *
     * @returns {string}
     */
    getMethod() {
      return this.item.id ? '$put' : '$post'
    },

    /**
     * Carregar registro.
     *
     * @param {*} id
     * @para {*} params
     */
    async load(id, params = {}) {
      typeof this.beforeLoad === "function" && this.beforeLoad();

      const response = await this.$axios.$get(`${this.endpoint}/${id}`, { params })

      let data = {...response};

      this.original = cloneDeep({...data})

      if (typeof this.afterLoad === "function") {
        data = {...this.afterLoad(data)};
      }

      this.$set(this, 'item', cloneDeep({...data}))
      this.$store.commit('context/set', {item: cloneDeep({...data})})
      this.reset()
    },

    /**
     * Cadastrar ou atualizar registro.
     *
     * @param {*} form
     * @returns {Promise<void>}
     */
    async save(form) {
      this.$v.form.$touch()

      if (this.$v.form.$invalid) {
        this.$notify.error('Verifique os campos preenchidos e tente novamente...', {
          description: Object.values(this.scopeErrors).map(h => h[0]).filter(h => h),
          timeout: 1500
        })

        return
      }

      try {
        let data = { ...form };

        if (typeof this.validate === "function") {
          await this.validate(data)
        }

        if (typeof this.beforeSave === "function") {
          data = this.beforeSave(data);
          // data = beforeSave instanceof FormData ? beforeSave : {...beforeSave};
        }

        const result = await this.$axios[this.getMethod()](this.getEndpoint(), data)

        if (typeof this.afterSave === "function") {
          this.afterSave(result, !this.item?.id)
        }

        this.$emit('saved', { result, created: !this.item?.id })

        this.$notify.success(this.messages[this.isNew ? 'create' : 'update'].success, {
          description: [],
          timeout: 1000,
          onComplete: () => this.cancel()
        })
      } catch (e) {
        const message = this.errorMessage

        this.$notify.error(
          `${this.messages[this.isNew ? 'create' : 'update'].error}`,
          {
            description: e instanceof Error ? (typeof e.message === "object" ? e.message : [e.message]) : message,
          }
        )
      }
    },

    /**
     * @param {*} id
     * @param {*} data
     */
    toggleDeleteComponent(id, data) {
      let handler = {
        restore: () => {
          this.form.inactive_at = null;
        },

        delete: () => {
          this.form.inactive_at = new Date();
        }
      };

      this.$notify.success('Operação bem sucedida!', {
        onComplete: () => handler[data.action]()
      })
    },

    /**
     * @returns {void}
     */
    updateContext(item = {}) {
      this.$store.commit('context/set', {
        api: {endpoint: this.endpoint},
        item: cloneDeep({...this.base, ...item}),
        route: {
          params: this.$route.params,
          path: this.$route.path
        }
      })
    },

    /**
     * @param {*} data
     * @returns
     */
    prepareFormData(data) {
      const payload = new FormData()

      const handler = (input, key = null) => {
        if (!input) return payload

        for (const [k, v] of Object.entries(input)) {
          if(v instanceof Blob) {
            payload.append(`${key}[${k}]`, v)
            continue;
          }

          if (typeof v === 'object') {
            handler(v, key ? `${key}[${k}]` : k)
            continue
          }

          payload.append(key ? `${key}[${k}]` : k, v)
        }

        return payload
      }

      return handler(data)
    }
  },

  created() {
    this.messages = {
      ...messages,
      ...this.messages
    }

    this.original = cloneDeep({ ...this.base })

    this.reset()
  },

  mounted() {
    this.updateContext()
  },

  beforeDestroy() {
    this.$off('update:errors')
  },
}
