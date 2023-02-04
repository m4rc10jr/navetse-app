<template>
  <v-btn @click.stop="print" color="primary darken-1" dark outlined>
    <custom-icon>picture_as_pdf</custom-icon>
    <span class="ml-1">Imprimir</span>
    <div class="container print" :id="id" style="display: none">
      <!-- BEGIN -->
      <div class="content container-fluid" v-if="order">
        <header>
          <div class="row" style="width: 100%">
            <div class="col col-md-3 d-flex">
              <div class="logo">
                <img src="~/static/logo.png" />
              </div>
            </div>

            <div
              class="col col-md-6"
              v-if="complements && complements.entity && complements.employee"
            >
              <div class="row">
                <div class="col col-md-12">
                  <address class="d-flex flex-column">
                    <span>
                      <b>Envolvido: </b>
                      <span>{{ complements.entity.name }}</span>
                    </span>

                    <span>
                      <b>Telefone: </b>
                      <span v-if="complements.entity.phone">{{
                        complements.entity.phone
                          | mask('(##) #####-####', '(##) ####-####')
                      }}</span>
                      <i v-else>não informado</i>
                    </span>
                    <br />

                    <span v-if="complements.employee.name">
                      <b>Responsável: </b>
                      <span>{{ complements.employee.name }}</span>
                    </span>

                    <span
                      ><b>Data</b>:
                      {{ order.date | formatDate('DD/MM/YYYY') }}</span
                    >

                    <span v-if="type === 'input'">
                      <b>Mês de Competência: </b>
                      <span>{{
                        order.competence_date | formatDate('MMMM/YYYY')
                      }}</span>
                    </span>
                  </address>
                </div>
              </div>
            </div>

            <div
              class="col col-md-3 d-flex"
              style="justify-content: center; align-items: center"
            >
              <h3>ID #{{ order.id }}</h3>
            </div>
          </div>
        </header>

        <hr />

        <div v-if="type === 'input'">
          <h5>Detalhes</h5>

          <table class="table table-bordered">
            <thead>
              <tr>
                <th width="10%">ID</th>
                <th width="50%">Conta</th>
                <th width="50%">Sub Conta</th>
                <th>Total R$</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, index) in order.details"
                :key="`detail-${index}`"
              >
                <td>{{ item.id }}</td>
                <td>{{ complements.account.title }}</td>
                <td>{{ item.title }}</td>
                <td>{{ item.value | brl }}</td>
              </tr>
            </tbody>
          </table>

          <hr />
        </div>

        <div v-if="type !== 'input'">
          <h5>Detalhamento de Items</h5>
          <table class="table table-bordered">
            <thead>
              <tr>
                <th width="5%">Código</th>
                <th width="40%">Produto</th>
                <th width="5%">Unidade</th>
                <th width="5%">Quantidade</th>
                <th v-if="['sale', 'input'].includes(type)">Data Entrega</th>
                <th>Preço</th>
                <th>Total R$</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in order.items" :key="`item-${index}`">
                <td>{{ item.item_id }}</td>
                <td>{{ item.title }}</td>
                <td>{{ item.unit_title }}</td>
                <td>{{ item.quantity }}</td>
                <td v-if="['sale', 'input'].includes(type)">
                  <span v-if="item.delivery_date">{{
                    item.delivery_date | formatDate('DD/MM/YYYY')
                  }}</span>
                  <i v-else>não entregue</i>
                </td>
                <td>{{ item.cost | brl }}</td>
                <td>{{ item.total | brl }}</td>
              </tr>

              <tr v-if="order.items && !order.items.length">
                <td :colspan="['sale', 'input'].includes(type) ? 7 : 6">
                  <span>Nenhum item foi detalhado.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="['sale', 'input'].includes(type)">
          <h5>Parcelas/Recebimentos</h5>
          <table class="table table-bordered">
            <thead>
              <tr>
                <th width="5%">ID</th>
                <th width="5%">Parcela</th>
                <th width="50%">Recebimentos</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Data recebimento</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(installment, installmentIndex) in order.installments"
                :key="`installment-${installment.id}`"
              >
                <td>{{ installment.id }}</td>
                <td>{{ installmentIndex + 1 }}</td>
                <td>
                  <span
                    class="payment"
                    :class="{
                      paid: payment.payment_date,
                      penging: !payment.payment_date,
                    }"
                    v-for="(payment, paymentIndex) in installment.payments"
                    :key="`payment-${paymentIndex}`"
                  >
                    {{ paymentIndex + 1 }}x - {{ payment.value }} ({{
                      payment.payment_date | formatDate('DD/MM/YYYY')
                    }})
                  </span>
                  <i v-if="!installment.payments.length">sem pagamentos</i>
                </td>
                <td>{{ installment.status || '--' }}</td>
                <td>{{ installment.value | brl }}</td>
                <td>
                  <span v-if="installment.receipt_date">
                    {{ installment.receipt_date | formatDate('DD/MM/YYYY') }}
                  </span>
                  <span v-else>--</span>
                </td>
              </tr>

              <tr v-if="order.installments && !order.installments.length">
                <td colspan="6">
                  <span>Nenhum parcelamento foi configurado.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h5>Observações</h5>
          <p>{{ order.description || 'sem observações' }}</p>
        </div>

        <hr />

        <table class="table table-bordered" v-if="type !== 'input'">
          <thead>
            <tr>
              <th>
                <div class="d-flex justify-content-between">
                  <span style="font-weight: 300">Total dos Produtos</span>
                  <span class="fixed">
                    <span v-if="order.value">{{ order.value | brl }}</span>
                    <span v-else>R$ --</span>
                  </span>
                </div>
              </th>
              <th>
                <div class="d-flex justify-content-between">
                  <span style="font-weight: 300">Descontos</span>
                  <span class="fixed">
                    <span v-if="order.discount">{{
                      order.discount | brl
                    }}</span>
                    <span v-else>R$ --</span>
                  </span>
                </div>
              </th>
              <th>
                <div class="d-flex justify-content-between">
                  <span style="font-weight: 300">Acrécimos</span>
                  <span class="fixed">
                    <span v-if="order.addition">{{
                      order.addition | brl
                    }}</span>
                    <span v-else>R$ --</span>
                  </span>
                </div>
              </th>
              <th>
                <div class="d-flex justify-content-between">
                  <span style="font-weight: 300">Total do Pedido</span>
                  <span class="fixed">
                    <span v-if="order.total">{{ order.total | brl }}</span>
                    <span v-else>R$ --</span>
                  </span>
                </div>
              </th>
            </tr>
          </thead>
        </table>
      </div>
      <!-- END -->
    </div>
  </v-btn>
</template>

<script>
import { randomBytes } from 'crypto'
import { capitalize, take } from 'lodash'

export default {
  props: {
    data: Object,
    complements: {
      type: Object,
      default: () => ({}),
    },
    type: String,
  },

  computed: {
    id() {
      return 'print_' + randomBytes(8).toString('hex')
    },

    createBy() {
      if (!this.data?.user?.name) return false

      let newValue = String(this.data?.user?.name)

      return newValue
        ? take(newValue.split(' ').map(capitalize), 2).join(' ')
        : '---'
    },

    order() {
      return { ...this.data }
    },
  },

  methods: {
    open() {
      let windowRef = null

      windowRef = window.open(
        '',
        '',
        'fullscreen=no,titlebar=no,scrollbars=no,width=1000,height=660'
      )

      if (!windowRef.opener) {
        windowRef.opener = self
      }

      windowRef.focus()

      return windowRef
    },

    applyStyles(win) {
      const styles = [
        'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.2/css/bootstrap.min.css',
      ]

      styles.forEach((style) => {
        let link = win.document.createElement('link')

        link.setAttribute('rel', 'stylesheet')
        link.setAttribute('type', 'text/css')
        link.setAttribute('href', style)

        win.document.getElementsByTagName('head')[0].appendChild(link)
      })
    },

    async print() {
      var divContents = document.getElementById(this.id).innerHTML

      var a = this.open()

      a.document.write(`
        <html>
          <head>
            <title>NAVETSE</title>
            <style>
            .content {
                /* height: 100vh; */
                margin: 0 auto;
                background: white;
                padding: 1rem;
            }

            hr,.line {
                width: 100%;
                height: 1px;
                margin: 1rem 0;
                border: 1px solid #000;
            }

            hr.vertical {
                height: auto;
                width: 1px;
                margin: 0 1rem;
            }

            .content > header {
                display: flex;
                flex: 1 0 0%;
                min-height: 100px;
            }

            .logo {
                display: flex;
                align-items: center;
                justify-content: center;

            }

            .logo img {
                width: 200px;
                height: auto;
            }

            header .info {
                flex: 1;
                margin-top: 10px;
            }
            span { font-size: 16px; font-weight: 300; }
            span.fixed {font-weight: 600; }

            span.payment { padding: .1rem; font-size: 12px; font-weight: 500; }
            span.payment.pending { background-color: #f9f9f9; color: #333; border: 1px solid #f9f9f9;}
            span.payment.paid { background: #2ecc71; color: white; border: 1px solid #2ecc71;}
            </style>
          </head>
          <body>${divContents}</body>
        </html>
      `)

      this.applyStyles(a)

      setTimeout(() => {
        a.document.close()
        a.focus()
        a.print()
        setTimeout(() => a.close(), 100)
      }, 1000)
    },
  },
}
</script>
