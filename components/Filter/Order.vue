<template>
  <div style="width: 100%">
    <v-row class="ma-0" :class="{ 'flex-column': isMobile, 'mb-2': !isMobile }">
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
    </v-row>

    <v-row class="ma-0" :class="{ 'flex-column': isMobile }">
      <v-col
        md="3"
        v-if="hasSale"
        class="pt-0"
        :class="{ 'mb-0 mt-1': isMobile, 'mb-3': !isMobile }"
      >
        <select-default label="Status" v-model="model.status" :items="status" />
      </v-col>
    </v-row>
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

    isMobile() {
      return this.$vuetify.breakpoint.smAndDown
    },
  },
}
</script>

<style lang="scss" scoped></style>
