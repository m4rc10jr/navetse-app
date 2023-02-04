<template>
  <v-row class="system-info" :class="{ mobile: $vuetify.breakpoint.smAndDown }">
    <v-col cols="9" class="d-flex pt-0">
      <input-text label="ID Sistema" :value="row.id" disabled class="small" />

      <input-text label="Criado Em" :value="row.created_at" disabled />

      <input-text
        label="Criado Por"
        :value="createBy"
        disabled
        v-if="createBy"
      />

      <input-text label="Última Atualização" :value="row.updated_at" disabled />
    </v-col>

    <slot></slot>
  </v-row>
</template>

<script>
import { capitalize, take } from 'lodash'
export default {
  name: 'RowInfo',
  props: {
    row: {
      type: Object,
      required: true,
    },
  },

  computed: {
    createBy() {
      if (!this.row?.user?.name) return false

      let newValue = String(this.row?.user?.name)

      return newValue
        ? take(newValue.split(' ').map(capitalize), 2).join(' ')
        : '---'
    },

    updateBy() {
      return this.row?.updated?.name ?? '---'
    },
  },
}
</script>

<style lang="scss" scoped>
div.row.system-info {
  justify-content: start;
  margin-top: 0.5rem;

  div {
    // justify-content: space-between;

    > * {
      margin-top: 0;
      box-sizing: border-box;
      max-width: 180px;
    }

    .v-input.small {
      max-width: 100px;
    }

    .v-input {
      margin-left: 1rem;

      &:first-child {
        margin-left: 0;
      }
    }
  }

  &.mobile {
    div {
      flex: 1;
      max-width: 100% !important;
      flex-direction: column;

      margin-left: 0;
      margin-top: 1.5rem;

      > * {
        max-width: 100%;
      }

      &:first-child {
        margin-top: 0;
      }

      &:last-child {
        margin-bottom: 1rem;
      }
    }
  }
}
</style>
