<template>
  <div>
    <v-card dense>
      <alert
        type="error"
        border="left"
        outlined
        color="error lighten-1"
        v-if="error.model"
      >
        Houve um erro, tente novamente...
      </alert>

      <alert
        type="info"
        border="left"
        outlined
        color="info darken-2"
        v-else-if="loaded && items && items.length === 0"
      >
        Não existem registros para serem exibidos.
      </alert>

      <div v-if="pending">
        <v-skeleton-loader
          class="mx-auto"
          max-width="100%"
          color="grey"
          type="list-item-two-line, divider"
          v-for="i in 5"
          :key="i"
        />
      </div>

      <v-list two-line class="dynamic-list" key="list" id="dynamic-list" v-else>
        <v-list-item-group>
          <v-slide-y-transition mode="out-in" group>
            <v-list-item
              v-for="(item, index) in items"
              :key="item.id"
              class="pt-2"
              @click="$emit('edit', item, index)"
            >
              <v-list-item-action>
                <slot name="icon" :item="item" :index="item.id">
                  <v-chip label small outlined color="primary">
                    <span>{{ item.id }}</span>
                  </v-chip>
                </slot>
              </v-list-item-action>

              <v-list-item-content>
                <slot name="item" :item="item" :index="item.id"></slot>
              </v-list-item-content>

              <v-list-item-action>
                <slot
                  name="item.action.before"
                  :item="item"
                  :index="index"
                ></slot>
                <slot
                  name="item.action"
                  class="d-flex"
                  :item="item"
                  :index="index"
                >
                  <button-delete
                    class="mb-1"
                    :endpoint="endpoint"
                    :id="item.id"
                    @completed="removeItem"
                    list
                    :restore="!!item.inactive_at"
                  />
                  <div class="d-flex flex-column align-end mt-1">
                    <small>{{ item.created_at }}</small>
                    <div class="d-flex mt-1 align-center">
                      <custom-icon size="16px">update</custom-icon>
                      <small class="ml-2">{{ item.updated_at }}</small>
                    </div>
                  </div>
                </slot>
                <slot
                  name="item.action.after"
                  :item="item"
                  :index="index"
                ></slot>
              </v-list-item-action>
            </v-list-item>
          </v-slide-y-transition>
        </v-list-item-group>
      </v-list>
    </v-card>

    <v-pagination
      v-model="value.filter.page"
      class="my-4"
      :length="meta.last_page"
      :total-visible="15"
      depressed
      outlined
      color="primary darken-1"
      v-if="meta.last_page > 1"
    />
  </div>
</template>

<script>
import { debounce, omit, pickBy } from 'lodash'
export default {
  name: 'DynamicList',

  props: {
    value: {
      type: Object,
      required: true,
    },

    icon: {
      type: String,
      default: '',
    },
  },

  data: () => ({
    items: [],

    meta: {
      total: 0,
      per_page: 0,
      current_page: 0,
      last_page: 0,
      from: 0,
      to: 0,
    },

    error: {
      model: false,
      message: '',
    },
    pending: false,
    loaded: false,
  }),

  watch: {
    'value.filter': {
      handler(current, old) {
        const changes = pickBy(
          omit(current, 'page', 'search', 'column'),
          (value, key) => value !== old[key]
        )

        if (this.pending) {
          return
        }

        debounce(() => this.fetch(), 200)()
      },
      deep: true,
    },

    'value.filter.page'(current, old) {
      //* ignora pois é a primeira pagina
      if (!old && current === 1) return

      debounce(() => this.fetch(), 200)()
    },
  },

  computed: {
    endpoint() {
      return this.value.endpoint
    },

    isEmpty() {
      return this.items.length === 0
    },

    filter() {
      return this.value.filter
    },

    getFilter() {
      return (key, _default) => this.filter[key] ?? _default
    },

    isSearchText() {
      return String(this.filter.search).length >= 1
    },

    customFilters() {
      return Object.entries(this.getFilter('column', {}))
    },
  },

  methods: {
    async fetch() {
      if (this.pending) {
        return
      }

      this.pending = true
      this.loaded = false

      try {
        const params = new Map([
          ['page', this.getFilter('page', 1)],
          ['paginate', this.getFilter('perPage', 25)],
          [
            `orderBy[${this.getFilter('orderBy', 'id')}]`,
            this.getFilter('orderDirection', 'desc'),
          ],
        ])

        const apply = {
          all: () => null,
          withTrashed: () => params.set('scope[withTrashed]', true),
          onlyTrashed: () => params.set('scope[onlyTrashed]', true),
        }

        //* aplica escopo que oculta ou exibi registros.
        apply[this.filter.with]()

        // const [search] = this.filter.search
        const search = String(this.filter.search).trim()

        if (this.isSearchText) {
          params.set('scope[search][all]', search)
        }

        //* aplicar filtro customizado.
        if (this.customFilters.length > 0) {
          for (const [k, v] of this.customFilters) {
            if (!v) continue

            params.set(`scope[search][${k}]`, v)
          }
        }

        const query = {}

        for (const [k, v] of params.entries()) {
          if (!v) continue

          query[k] = v
        }

        const { data, ...meta } = await this.$axios.$get(this.endpoint, {
          params: query,
        })

        this.items = data
        this.meta = { ...meta.meta }
        this.error.model = false
      } catch (e) {
        console.warn('falhou', e)
        this.error.model = true
        this.error.message = this.$store.getters.getErrorMessage
        this.items = []
      } finally {
        this.loaded = true
        this.pending = false
      }
    },

    removeItem(id, data = {}) {
      let index = this.items.findIndex((h) => h.id === id)

      if (data?.action === 'restore') {
        this.items[index].inactive_at = null
        return
      }

      index > -1 && this.items.splice(index, 1)

      this.$forceUpdate()
    },
  },

  created() {
    this.$bus.$on('dynamic-list:fetch', this.search)

    this.$bus.$on('dynamic-list:sync', (event) => {
      let index = this.items.findIndex((h) => h.id === event.result.id)

      if (index === -1 && event.created) {
        this.items.unshift(event.result)
      }

      if (index > -1) {
        this.items[index] = { ...event.result }
      }

      this.$forceUpdate()
    })

    this.$bus.$on('dynamic-list:remove', this.removeItem)
  },

  beforeDestroy() {
    this.$bus.$off('dynamic-list:fetch')
    this.$bus.$off('dynamic-list:sync')
    this.$bus.$off('dynamic-list:remove')
  },
}
</script>

<style lang="scss" scoped></style>
