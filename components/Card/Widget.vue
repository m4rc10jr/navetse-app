<template>
  <v-col :cols="col">
    <v-card dense>
      <v-card-text>
        <h1 class="headline-2">{{ total }}</h1>
        <span class="subtitle-1 mt-3">{{ label }}</span>
        <canvas :id="uniqueId"></canvas>
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script>
import { Chart, registerables } from 'chart.js'
import { randomBytes } from 'crypto'
import { groupBy, sum, sumBy } from 'lodash'

export default {
  name: 'CardWidget',

  props: {
    label: String,

    rows: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({
    uniqueId: null,
    chart: null,
  }),

  computed: {
    col() {
      return ['xs', 'sm'].includes(this.$vuetify.breakpoint.name) ? 12 : 4
    },

    total() {
      return this.rows.reduce((a, b) => a + b.quantity, 0)
    },
  },

  watch: {
    rows: {
      deep: true,
      handler(values) {
        this.update()
      },
    },
  },

  methods: {
    getRandomInt(min, max) {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min)) + min
    },

    update() {
      const canvas = document.getElementById(this.uniqueId).getContext('2d')

      const data = {}

      for (let [key, value] of Object.entries(
        groupBy(this.rows, (h) => h.monthYear)
      )) {
        data[key] = sumBy(value, 'quantity')
      }

      const entries = Object.entries(data)

      if (entries.length === 1) {
        for (let [k, v] of entries) {
          const old = this.$helper
            .moment(k, 'MMM/YYYY')
            .subtract(1, 'month')
            .format('MMM/YYYY')

          delete data[k]

          data[old] = 0
          data[k] = v
        }
      }

      let chart = Chart.getChart(canvas)
      let dataProps = {
        labels: Object.keys(data),

        datasets: [
          {
            label: this.label,
            data: Object.values(data),
            fill: false,
            borderColor: '#218c74',
            tension: 0.1,
            lineTension: 0,
          },
        ],
      }

      if (!chart) {
        chart = new Chart(canvas, {
          type: 'line',
          data: dataProps,
          options: {
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        })
      }
      chart.data.datasets = dataProps.datasets
      chart.data.labels = dataProps.labels
      chart.update()
    },
  },

  created() {
    this.uniqueId = `card-widget-` + randomBytes(8).toString('hex')

    Chart.register(...registerables)
  },

  mounted() {
    this.update()
  },
}
</script>

<style></style>
