<template>
  <input-text
    v-model="model"
    :label="label"
    :placeholder="placeholder"
    :errors="errors"
    :options="baseOptions"
    @errors="$emit('errors')"
    @click:append="update"
  >
  </input-text>
</template>

<script>
export default {
  name: 'InputPassword',

  components: {
    InputText: () => import('./Text.vue'),
  },

  props: {
    value: String,

    label: {
      type: String,
      required: true,
    },

    placeholder: {
      type: String,
      default: '******',
    },

    errors: {
      type: Array,
      default: () => [],
    },

    options: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      show: false,
      customOptions: {
        type: 'password',
        appendIcon: 'mdi-eye-off',
      },
    }
  },

  computed: {
    baseOptions() {
      return { ...this.customOptions, ...this.options }
    },

    model: {
      get() {
        if (typeof this.value === 'undefined') {
          return ''
        }

        return String(this.value)
      },

      set(value) {
        this.$emit('input', value)
      },
    },
  },

  methods: {
    update() {
      this.show = !this.show
      this.customOptions.appendIcon = this.show ? 'mdi-eye' : 'mdi-eye-off'
      this.customOptions.type = this.show ? 'text' : 'password'
    },
  },
}
</script>

<style lang="scss" scoped></style>
