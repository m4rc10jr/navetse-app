<template>
  <v-app light>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="clipped"
      app
      color="primary"
      dark
    >
      <v-list>
        <utils-show :condition="!clipped">
          <v-list-item>
            <v-list-item-content class="justify-center my-1 logo">
              <div
                style="
                  max-width: 170px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-direction: column;
                "
              >
                <!-- <div class="logo-img"> -->
                <!-- <img v-if="!mainCompany.logo" src="~/static/logo.png" /> -->
                <img
                  v-if="mainCompany.logo && !isRoot"
                  :src="mainCompany.logo"
                />
                <h1 class="heading">NAVETSE</h1>
                <!-- </div> -->
              </div>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
        </utils-show>

        <v-list-item v-if="(user.company && user.company.is_main) || false">
          <v-list-item-content>
            <layout-swich-account />
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          router
          exact
          :to="item.to"
          v-for="(item, i) in filterOnlyItems"
          :key="`simple-item-${i}`"
        >
          <v-list-item-action>
            <custom-icon>{{ item.icon }}</custom-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-group
          v-for="item in filterHasSubitems"
          :key="item.title"
          v-model="item.active"
          :class="{ isClipped: clipped }"
        >
          <template v-slot:prependIcon>
            <custom-icon>{{ item.icon }}</custom-icon>
          </template>

          <template
            v-slot:activator
            v-bind="
              item.childrens.length > 0
                ? {}
                : {
                    router: true,
                    exact: true,
                    to: item.to,
                  }
            "
          >
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            v-for="child in item.childrens"
            :key="child.title"
            exact
            router
            :to="child.to"
          >
            <v-list-item-action>
              <custom-icon>{{ child.icon }}</custom-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title v-text="child.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app flat fixed>
      <v-app-bar-nav-icon @click="clipped = !clipped" v-if="!isMobile">
        <v-slide-x-reverse-transition mode="out-in" duration="200">
          <custom-icon key="variant_inactive" v-if="!clipped"
            >chevron_left</custom-icon
          >
          <custom-icon key="variant_active" v-else>chevron_right</custom-icon>
        </v-slide-x-reverse-transition>
      </v-app-bar-nav-icon>

      <v-app-bar-nav-icon
        color="#333"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-spacer></v-spacer>

      <span class="mr-1" v-html="welcome"></span>

      <!-- begin: menu -->
      <v-menu offset-y min-width="200px">
        <template v-slot:activator="{ on, attrs }">
          <span v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </span>
        </template>
        <v-list>
          <v-list-item key="0" nuxt to="/profile">
            <v-list-item-content>Meus Dados</v-list-item-content>
            <v-list-item-action>
              <v-icon right>mdi-account</v-icon>
            </v-list-item-action>
          </v-list-item>
          <v-list-item key="1" @click="logout">
            <v-list-item-content>Sair</v-list-item-content>
            <v-list-item-action>
              <v-icon right>mdi-logout</v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-menu>
      <!-- end: menu -->
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <Nuxt />
        <Notify />
        <layout-loading />
      </v-container>
    </v-main>

    <layout-footer />
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',

  middleware: 'auth',

  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: true,

      items: [
        {
          icon: 'home',
          title: 'Homepage',
          to: '/#',
          childrens: false,
          can: '*',
        },
        {
          icon: 'apartment',
          title: 'Minha Empresa',
          to: '/company',
          childrens: false,
          can: 'company-admin',
        },
        {
          icon: 'apartment',
          title: 'Empresas',
          to: '/companies',
          can: 'root',
          childrens: false,
        },
        {
          icon: 'manage_accounts',
          title: 'Usuários',
          to: '/admin/users',
          can: 'root',
        },
        {
          icon: 'currency_exchange',
          title: 'Lançamentos',
          to: '/inputs',
          childrens: false,
          can: 'company,company-admin',
        },
        {
          icon: 'sell',
          title: 'Vendas',
          to: '/sales',
          childrens: false,
          can: 'company,company-admin',
        },
        {
          icon: 'calculate',
          title: 'Orçamentos',
          to: '/budgets',
          childrens: false,
          can: 'company,company-admin',
        },
        {
          icon: 'category',
          title: 'Ordem de Produção',
          to: '/production-orders',
          childrens: false,
          can: 'company,company-admin',
        },
        {
          icon: 'schedule',
          title: 'Agendamentos',
          to: '/schedules',
          childrens: false,
          can: 'company,company-admin',
        },
        {
          icon: 'inventory',
          title: 'Entrada de Estoque',
          to: '/stocks',
          childrens: false,
          can: 'company,company-admin',
        },
        {
          icon: 'badge',
          title: 'Funcionários',
          to: '/employees',
          childrens: false,
          can: 'company,company-admin',
        },
        {
          icon: 'admin_panel_settings',
          title: 'Autorizar Acesso',
          to: '/records/authorization',
          can: 'company-admin',
        },
        {
          icon: 'pie_chart',
          title: 'Relatórios',
          to: '/reports',
          childrens: false,
          can: 'report,company,company-admin',
        },
        {
          icon: 'payments',
          title: 'Tipos de Pagamento',
          to: '/admin/type-payments',
          can: 'root',
        },
        {
          icon: 'account_balance',
          title: 'Contas',
          to: '/admin/accounts',
          can: 'root',
        },
        {
          icon: 'account_balance_wallet',
          title: 'Sub Contas',
          to: '/admin/sub-accounts',
          can: 'root',
        },
        {
          icon: 'scale',
          title: 'Unidades',
          to: '/admin/units',
          can: 'root',
        },
        {
          icon: 'settings',
          title: 'Cidades',
          to: '/admin/cities',
          can: 'root',
        },
        {
          icon: 'settings',
          title: 'Estados',
          to: '/admin/states',
          can: 'root',
        },
        {
          icon: 'settings',
          title: 'Cadastros',
          active: false,
          can: 'company,company-admin',
          childrens: [
            {
              icon: 'person',
              title: 'Envolvidos',
              to: '/records/entity',
              can: 'company,company-admin',
            },
            {
              icon: 'shopping_cart',
              title: 'Itens de Venda',
              to: '/records/item',
              can: 'company,company-admin',
            },
            {
              icon: 'workspaces',
              title: 'Departamentos',
              to: '/records/department',
              can: 'company,company-admin',
            },
            {
              icon: 'score',
              title: 'Metas',
              to: '/records/goal',
              can: 'company,company-admin',
            },
          ],
        },
      ],
    }
  },

  watch: {
    clipped(value) {
      this.drawer = true
    },
  },

  computed: {
    filterMenuAuthorized() {
      const items = [...this.items]

      const extract = (items) => {
        const newItems = []

        for (let item of items) {
          if (this.$authorize(item.can) && !item.childrens) {
            newItems.push(item)
            continue
          }

          let parentItem = { ...item }

          if (item.childrens) {
            parentItem.childrens = extract(parentItem.childrens)

            newItems.push(parentItem)
          }
        }

        return newItems.filter(
          (h) =>
            (typeof h.childrens === 'object' && h.childrens.length > 0) ||
            !h.childrens
        )
      }

      return extract(items)
    },

    filterOnlyItems() {
      return [...this.filterMenuAuthorized.filter((h) => !h.childrens)]
    },

    filterHasSubitems() {
      return [...this.filterMenuAuthorized.filter((h) => h.childrens)]
    },

    miniVariant: {
      get() {
        return this.$store.getters.layout.drawerMinimized
      },

      set(value) {
        this.$store.commit('layout/update_drawer', value)
      },
    },

    isMobile() {
      return this.$vuetify.breakpoint.xs
    },

    welcome() {
      if (!this.user?.name) return

      const [firtName] = this.user.name.split(' ')

      return (
        `Olá, ` +
        (this.isRoot
          ? `<b>${firtName}</b>`
          : `${firtName} <b>(${this.company.name})</b>`)
      )
    },
    ...mapGetters({
      user: 'account/data',
      company: 'account/company',
      isRoot: 'account/isRoot',
      loading: 'request/loading',
      mainCompany: 'account/companyInUse',
    }),
  },

  methods: {
    logout() {
      this.$store.dispatch('account/logout')
    },

    openSupportPage() {
      this.$refs.supportPage.click()
    },
  },
}
</script>

<style lang="scss">
@import '~/assets/custom.scss';
@import '~/assets/form.scss';
.logo img {
  object-fit: scale-down;
  width: 100%;
  max-height: 100px;
}
.logo {
  h1 {
    text-shadow: rgba(0, 0, 0, 0.5) 2px 2px;
  }
}
</style>
