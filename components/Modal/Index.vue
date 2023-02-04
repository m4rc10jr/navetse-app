<template>
  <v-dialog
    v-model="open"
    transition="slide-y-transition"
    :width="getWidth"
    persistent
  >
    <v-card flat>
      <v-toolbar flat dense>
        <slot name="header">
          <v-toolbar-title v-text="isNew ? 'Adicionar' : 'Editar'" />
        </slot>
        <v-spacer></v-spacer>
        <v-btn icon text @click="close" small class="pa-1">
          <custom-icon>close</custom-icon>
        </v-btn>
      </v-toolbar>
      <v-divider></v-divider>
      <slot></slot>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Modal',

  props: {
    value: {
      type: Boolean,
      default: false,
    },

    width: {
      type: String | Number,
      default: '640',
    },
  },

  computed: {
    open: {
      get() {
        return this.value
      },

      set(value) {
        if (!value) {
          this.close()
        }

        this.$emit('input', value)
      },
    },

    isNew() {
      return !this.item?.id
    },

    isMobile() {
      return this.$vuetify.breakpoint.xs
    },

    getWidth() {
      return this.isMobile ? '100vw' : this.width
    },

    ...mapGetters('context', ['item']),
  },

  methods: {
    close() {
      this.$emit('close')
    },
  },

  created() {
    document.addEventListener('keyup', (e) => {
      return {
        [e.code]: () => null,
        Escape: () => this.close(),
      }[e.code]()
    })
  },
}
</script>

<style lang="scss" scoped></style>
