<template>
  <v-card-actions>
    <button-delete
      :endpoint="api.endpoint"
      :id="item.id"
      :restore="isInactived"
      @completed="toggleDeleteComponent"
      form-action
      v-if="!isNew"
    />

    <v-spacer></v-spacer>
    <v-btn color="error" depressed @click="$emit('cancel')">Cancelar</v-btn>

    <v-btn
      color="primary"
      :loading="loading"
      depressed
      :disabled="invalid"
      @click="$emit('save')"
      >Salvar</v-btn
    >
  </v-card-actions>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    invalid: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    isInactived() {
      return !!this.item.inactive_at
    },

    isNew() {
      return !this.item.id
    },
    ...mapGetters({
      api: 'context/api',
      item: 'context/item',
      loading: 'request/loading',
    }),
  },

  methods: {
    /**
     * @param {*} id
     * @param {*} data
     */
    toggleDeleteComponent(id, data) {
      let handler = {
        restore: () => {
          this.form.inactive_at = null
        },

        delete: () => {
          this.form.inactive_at = new Date()
        },
      }

      this.$notify.success('Operação bem sucedida!', {
        onComplete: () => handler[data.action](),
      })
    },
  },
}
</script>

<style lang="scss" scoped></style>
