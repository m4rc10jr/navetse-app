<template>
  <page>
    <breadcrumb slot="header" title="Agendamentos" />

    <v-card dense>
      <v-card-text>
        <!-- calendar -->
        <v-sheet height="64">
          <v-toolbar flat>
            <v-btn
              outlined
              class="mr-4"
              color="grey darken-1"
              @click="setToday"
            >
              Hoje
            </v-btn>

            <v-btn fab text small color="grey darken-2" @click="prev">
              <v-icon small> mdi-chevron-left </v-icon>
            </v-btn>
            <v-btn fab text small color="grey darken-2" @click="next">
              <v-icon small> mdi-chevron-right </v-icon>
            </v-btn>
            <v-toolbar-title v-if="$refs.calendar">
              <span class="ml-1">{{ $refs.calendar.title }}</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom right>
              <template v-slot:activator="{ on, attrs }">
                <v-btn outlined color="grey darken-2" v-bind="attrs" v-on="on">
                  <span>{{ typeToLabel[type] }}</span>
                  <v-icon right> mdi-menu-down </v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="type = 'day'">
                  <v-list-item-title>Dia</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = 'week'">
                  <v-list-item-title>Semana</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = 'month'">
                  <v-list-item-title>Mes</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-toolbar>
        </v-sheet>

        <v-sheet height="480px" style="overflow: auto">
          <v-calendar
            ref="calendar"
            v-model="focus"
            color="primary"
            :events="events"
            :event-color="getEventColor"
            :event-overlap-mode="mode"
            event-overlap-threshold="30"
            :type="type"
            @click:event="showEvent"
            @click:more="viewDay"
            @click:date="viewDay"
            @click:day="addEvent"
            @click:time="addEvent"
            @change="updateRange"
          >
          </v-calendar>
          <v-menu
            v-model="dialog.open"
            :close-on-content-click="false"
            :activator="dialog.element"
            offset-x
            max-width="480px"
            transition="scale-transition"
          >
            <v-card min-width="320px" max-width="480px" dense tile>
              <v-toolbar flat dense>
                <v-toolbar-title style="font-size: 16px">
                  {{ dialog.event.title }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn depressed icon @click="dialog.open = false">
                  <custom-icon>close</custom-icon>
                </v-btn>
              </v-toolbar>
              <v-divider></v-divider>
              <v-card-text>
                <p>
                  {{
                    dialog.event.description ||
                    'Nenhuma descrição para o evento...'
                  }}
                </p>
                <div class="d-flex flex-column">
                  <span>
                    <b>Envolvidos</b>
                    <span>{{ dialog.event.envolvidos }}</span>
                  </span>
                  <span
                    ><b>Inicio</b>:
                    {{
                      dialog.event.start | formatDate('DD/MM/YYYY HH:mm a')
                    }}</span
                  >
                  <span
                    ><b>Fim</b>:
                    {{
                      dialog.event.end | formatDate('DD/MM/YYYY HH:mm a')
                    }}</span
                  >
                </div>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  depressed
                  route
                  block
                  color="primary"
                  :to="`/schedules/${dialog.event.id}`"
                >
                  <custom-icon>more</custom-icon>
                  <span class="ml-1">Mais Detalhes</span>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-sheet>
        <!-- calendar -->
      </v-card-text>
    </v-card>

    <button-add :redirect="`/schedules/create?date=${new Date().getTime()}`" />
  </page>
</template>

<script>
export default {
  name: 'ScheduleIndex',

  layout: 'dashboard',

  data: () => ({
    focus: '',
    type: 'month',
    typeToLabel: {
      month: 'Mês',
      week: 'Semana',
      day: 'Dia',
    },
    dialog: {
      open: false,
      element: null,
      event: {},
    },
    events: [],
    colors: ['grey darken-2'],
    mode: 'column',
  }),

  mounted() {
    this.$refs.calendar.checkChange()
  },

  methods: {
    viewDay({ date }) {
      this.focus = date
      this.type = 'day'
    },

    getEventColor(event) {
      return event.color
    },

    setToday() {
      this.focus = ''
    },

    prev() {
      this.$refs.calendar.prev()
    },

    next() {
      this.$refs.calendar.next()
    },

    dialogUpdate(event = {}, target) {
      const open = () => {
        this.dialog.element = target
        this.dialog.event = event

        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            this.dialog.open = true
          })
        )
      }

      open()
    },

    showEvent({ nativeEvent, event }) {
      this.dialogUpdate(event, nativeEvent.target)

      nativeEvent.stopPropagation()
    },

    addEvent({ nativeEvent, date, time = null }) {
      const t = time
        ? time
        : this.$helper.moment().add(1, 'minute').format('HH:mm')
      const value = this.$helper.moment(`${date}\T${t}`)

      if (value.isBefore(this.$helper.moment())) {
        this.$notify.info('Não é possível adicionar eventos no passado...')
        return
      }

      this.$router.push('schedules/create?date=' + value.format('x'))

      nativeEvent.stopPropagation()
    },

    async updateRange({ start, end }) {
      const events = []

      const response = await this.$axios.$get('/api/schedules', {
        'whereBetween[date]': `${start},${end}`,
      })

      for (let item of response) {
        const [start, end] = [
          this.$helper.moment(`${item.date}\T${item.start_time}`),
          this.$helper.moment(`${item.date}\T${item.end_time}`),
        ]

        const event = {
          id: item.id,
          title: item.title,
          description: item.description,
          color: item.is_confirmed ? 'primary' : 'grey darken-1',
          start: start.format('YYYY-MM-DD HH:mm'),
          end: end.format('YYYY-MM-DD HH:mm'),
          client: item.entity,
          name: item.entity?.name,
          envolvidos: [item.entity?.name, item.user.name].join(', '),
        }

        events.push(event)
      }

      this.events = events
    },
  },
}
</script>

<style lang="scss" scoped></style>
