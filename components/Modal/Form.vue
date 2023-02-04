<template>
  <v-card :disabled="$store.getters['request/loading']" flat>
    <v-card-text>
      <slot></slot>
      <v-row v-if="form.id">
        <v-col cols md="6" xs="12">
          <input-text
            label="Data do Cadastro"
            :value="form.created_at"
            disabled
          />
        </v-col>

        <v-col cols md="6" xs="12">
          <input-text
            label="Ultima Atualização"
            :value="form.updated_at"
            disabled
          />
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn outlined @click="$emit('cancel')" v-text="'Cancelar'" />

      <v-btn
        color="primary"
        :loading="$store.getters['request/loading']"
        depressed
        @click="$emit('save')"
        v-text="'Salvar'"
        :disabled="invalid"
      />
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'ModalForm',

  props: {
    form: {
      type: Object,
      default: () => ({}),
    },

    invalid: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
