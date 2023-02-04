<template>
  <div style="width: 100%">
    <v-layout row class="ma-2 mx-1">
      <v-col md="3">
        <input-date
          label="Data Operação"
          v-model="model.date"
          :default-date="false"
        />
      </v-col>

      <v-col md="5">
        <select-dynamic
          label="Envolvido"
          :item-text="(h) => h.name"
          endpoint="/api/entities"
          :api-options="{ limit: 25, select: 'id,name' }"
          v-model="model.entity"
        />
      </v-col>

      <v-col md="4">
        <select-dynamic
          label="Item"
          endpoint="/api/items"
          :api-options="{ limit: 25, select: 'id,code,title' }"
          item-text="title"
          v-model="model.item"
        />
      </v-col>
    </v-layout>

    <v-layout row class="mt-0 mx-1">
      <v-col md="3" v-if="hasSale" class="pt-0 mb-3">
        <select-default label="Status" v-model="model.status" :items="status" />
      </v-col>
    </v-layout>
  </div>
</template>

<script>
export default {
  name: 'FilterOrder',

  props: {
    value: Object,

    status: {
      type: Array,
      default: () => [],
    },

    hasSale: {
      type: Boolean,
      default: false,
    },
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
  },
}
</script>

<style lang="scss" scoped></style>
