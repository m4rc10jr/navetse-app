<template>
  <v-menu
    ref="menu"
    v-model="open"
    :close-on-content-click="false"
    :return-value.sync="date"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        :value="forHumans"
        :label="label"
        append-icon="mdi-calendar"
        readonly
        v-bind="attrs"
        v-on="on"
        :error-messages="errorMessages"
        outlined
        hide-details
        @change="$emit('change')"
        dense
      />
    </template>
    <v-date-picker
      v-model="date"
      no-title
      scrollable
      color="primary"
      header-color="primary"
      locale="pt-BR"
    >
      <v-btn text @click="$refs.menu.save(null)"> Redefinir </v-btn>
      <v-spacer></v-spacer>
      <v-btn text color="primary" @click="open = false"> Cancel </v-btn>
      <v-btn text color="primary" @click="$refs.menu.save(date)"> OK </v-btn>
    </v-date-picker>
  </v-menu>
</template>

<script>
export default {
  name: 'InputDate',

  props: {
    value: String,

    label: String,

    errorMessages: {
      type: Array,
      default: () => [],
    },

    defaultDate: {
      type: Boolean,
      default: true,
    },
  },

  data: () => ({
    open: false,
  }),

  computed: {
    date: {
      get() {
        return this.value
      },

      set(value) {
        this.$emit('input', value)
      },
    },

    forHumans() {
      return this.date ? this.$helper.formatDate(this.date, 'DD/MM/YYYY') : null
    },
  },

  methods: {
    prepare(value) {
      let newValue = value

      if (isNaN(new Date(value).valueOf())) {
        newValue = null
      }

      if (this.defaultDate && (!value || value === '0000-00-00')) {
        newValue = this.$helper.moment().format('YYYY-MM-DD')
      }

      return newValue
    },
  },

  created() {
    this.date = this.prepare(this.date)
  },

  mounted() {
    this.date = this.prepare(this.date)
  },
}
</script>
