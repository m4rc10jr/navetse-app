<template>
  <page>
    <breadcrumb slot="header" :title="title" />

    <v-card :disabled="loading">
      <v-card-text>
        <v-slide-y-transition>
          <row-info :row="form" v-if="!isNew && !loading" key="system_info" />
        </v-slide-y-transition>

        <v-row :class="{ 'mt-4': isNew }" class="mb-1">
          <column md="6">
            <v-text-field
              label="Titulo"
              dense
              v-model.trim="form.title"
              @input="$v.form.title.$touch"
              :error-messages="watchErrorMessages('title')"
              outlined
            />
          </column>

          <column md="2">
            <input-date
              label="Data"
              v-model="form.date"
              @input="$v.form.date.$touch()"
              :error-messages="watchErrorMessages('date')"
            />
          </column>

          <column md="2">
            <input-time
              label="Hora Início"
              v-model="form.start_time"
              @input="updateEndTime"
              :error-messages="watchErrorMessages('start_time')"
            />
          </column>

          <column md="2">
            <input-time
              label="Hora Fim"
              v-model="form.end_time"
              @input="$v.form.end_time.$touch"
              :error-messages="watchErrorMessages('end_time')"
            />
          </column>
        </v-row>

        <v-row>
          <column cols md="3">
            <select-client
              load-data
              v-model="form.entity_id"
              @change="updateClient"
              :valid="$v.form.entity_id.$dirty"
              :error-messages="watchErrorMessages('entity_id')"
              ref="client"
              v-if="loaded"
            />
          </column>

          <column md="3">
            <v-text-field
              :value="form.phone | mask(['(##) #####-####', '(##) ####-####'])"
              outlined
              dense
              label="Whatsapp do envolvido"
              disabled
            />
          </column>

          <column md="3" class="pt-0">
            <v-switch
              label="Enviar notificação via whatsapp"
              v-model="form.notify"
              class="switch-label-column"
              dense
              :disabled="!mainCompany.has_notification"
            />
          </column>

          <column md="3" class="pt-0">
            <v-switch
              v-model="form.is_confirmed"
              label="Houve Efetivação da Agenda?"
              class="switch-label-column"
              dense
            />
          </column>
        </v-row>

        <v-row>
          <v-col md="12">
            <v-textarea
              outlined
              label="Observações"
              v-model.trim="form.description"
              hide-details
              dense
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <button-delete
          :id="form.id"
          endpoint="/api/schedules"
          @completed="toggleDeleteComponent"
          :restore="!!form.inactive_at"
          v-if="!isNew"
          form-action
        />
        <v-spacer></v-spacer>
        <v-btn depressed @click="reset">Cancelar</v-btn>
        <v-btn color="primary darken-1" depressed @click="save(form)"
          >Salvar</v-btn
        >
      </v-card-actions>
    </v-card>
  </page>
</template>

<script>
import { mapGetters } from 'vuex'
import { gt, lt } from '~/plugins/rules'
import validate from '~/mixins/validate'
import { required, minLength } from 'vuelidate/lib/validators'
import { cloneDeep } from 'lodash'

export default {
  name: 'Schedule',

  mixins: [validate],

  layout: 'dashboard',

  data: () => ({
    form: {
      date: null,
    },

    loaded: false,

    base: {
      id: null,
      title: null,
      description: null,
      entity_id: null,
      date: null,
      start_time: '00:00',
      end_time: '01:00',
      phone: null,
      notify: false,
      is_confirmed: false,
    },

    schedule: {},

    original: {},

    invalidDate: false,
  }),

  computed: {
    title() {
      return this.isNew ? 'Adicionar Agendamento' : 'Editar Agendamento'
    },

    isNew() {
      return this.$route.params.id === 'create'
    },

    userInfo() {
      if (this.isNew) {
        return this.user.name
      }

      if (Object.entries(this.schedule).length <= 0) return '---'

      return this.schedule.user.name
    },

    fullDate() {
      if (!this.form.date) return false

      const [start, end] = [
        this.$helper.moment(`${this.form.date}\T${this.form.start_time}`),
        this.$helper.moment(`${this.form.date}\T${this.form.end_time}`),
      ]

      return [start, end]
    },

    scheduleValid() {
      if (!this.fullDate) return false

      return this.$helper.moment().isSameOrBefore(this.fullDate[0])
    },

    ...mapGetters({
      user: 'account/data',
      loading: 'request/loading',
      getErrorMessage: 'request/message',
      mainCompany: 'account/companyInUse',
    }),
  },

  validations: {
    form: {
      title: {
        required,
        minLength: minLength(3),
      },
      date: {
        required,
      },
      entity_id: {
        required,
      },
      start_time: {
        required,
        lt: lt('end_time' /*(a, b) => console.log('start', { a, b }) */),
      },
      end_time: {
        required,
        gt: gt('start_time' /*(a, b) => console.log({ a, b })*/),
      },
    },
  },

  methods: {
    async fetch() {
      const schedule = await this.$axios.$get(
        `/api/schedules/${this.$route.params.id}`,
        {
          params: {
            'scope[withTrashed]': Date.now(),
          },
        }
      )

      const { entity, user } = schedule

      this.form = {
        id: schedule.id,
        user,
        entity_id: entity.id,
        title: schedule.title,
        description: schedule.description,
        date: schedule.date,
        notify: schedule.notify,
        is_confirmed: schedule.is_confirmed,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        date: schedule.date,
        phone: entity.phone,
        inactive_at: schedule.inactive_at,
        created_at: schedule.created_at,
        updated_at: schedule.updated_at,
      }

      this.base = { ...this.form }
      this.original = cloneDeep({ ...this.form })
      this.schedule = schedule
    },

    /**
     * Montar dados.
     *
     * @returns {void}
     */
    refresh() {
      const date = this.$route.query.date
        ? this.$helper.moment(Number(this.$route.query.date))
        : this.$helper.moment()

      const start_time = this.$helper.formatDate(date, 'HH:mm')

      const end_time = this.$helper.formatDate(
        this.$helper.moment(date).add(1, 'h'),
        'HH:mm'
      )

      this.form = {
        ...this.base,
        start_time,
        end_time,
        date: date.format('YYYY-MM-DD'),
      }

      if (this.$refs.client && this.isNew) {
        this.$refs.client.$emit('reset')
      }

      this.original = cloneDeep({ ...this.form })
    },

    /**
     * Redefinir.
     *
     * @returns {void}
     */
    reset() {
      this.form = cloneDeep(this.original)
      this.$v.form.$reset()
      this.$router.push('/schedules')
    },

    /**
     * Atualiza telefone do envolvido.
     *
     * @param {*} item
     */
    updateClient(item) {
      Object.assign(this.form, {
        entity_id: item.id,
        phone: item.phone,
      })
    },

    /**
     * Enviar dados.
     *
     * @param {*} item
     */
    async save(item) {
      this.$v.form.$touch()

      if (this.$v.form.$invalid) {
        this.$notify.error('Preencha os campos obrigatórios.')
        return
      }

      if (this.isNew && !this.scheduleValid) {
        this.$notify.error('Confira a data e horário do agendamento.')
        return
      }

      item.confirmed_at = item.is_confirmed
      item.date = this.$helper.moment(item.date).format('YYYY-MM-DD')

      item.start_time = this.fullDate[0].format('HH:mm')
      item.end_time = this.fullDate[1].format('HH:mm')

      delete item.is_confirmed

      const endpoint = this.isNew
        ? '/api/schedules'
        : `/api/schedules/${item.id}`
      const method = this.isNew ? '$post' : '$put'

      try {
        await this.$axios[method](endpoint, item)

        this.$notify.success('Agendamento salvo com sucesso', {
          onComplete: () => this.$router.push('/schedules'),
        })
      } catch (e) {
        this.$notify.error(this.getErrorMessage)
      }
    },

    /**
     * @param {*} id
     * @param {*} data
     */
    toggleDeleteComponent(id, data = { action: '' }) {
      let handler = {
        restore: () => {
          this.form.inactive_at = null
          this.$notify.success('Registro restaurado com sucesso.', {
            timeout: 1000,
          })
        },

        delete: () => {
          this.form.inactive_at = new Date()
          this.$notify.success('Registro removido com sucesso.', {
            timeout: 1000,
          })
        },
      }

      handler[data.action]()
    },

    updateEndTime(value) {
      this.$v.form.start_time.$touch()
      let [, hour, minute] = value.match(/(\d{2}):(\d{2})/)
      let updateHour = Number(hour) + 1
      let newEndTime = `${updateHour}:${minute}`

      this.form.end_time = newEndTime
      this.$v.form.end_time.$touch()
    },
  },

  async mounted() {
    this.refresh()

    if (this.$route.params.id !== 'create') {
      await this.fetch()
    }

    this.loaded = true
  },
}
</script>

<style lang="scss"></style>
