<template>
  <v-card flat :disabled="$store.getters['request/loading']">
    <v-toolbar dense flat>
      <v-toolbar-title style="font-size: 16px">Logo</v-toolbar-title>
      <v-spacer></v-spacer>
      <nav-items v-slot="{ mobile }">
        <v-btn
          :icon="mobile"
          small
          outlined
          @click="fetch"
          :disabled="$route.params.id === 'create'"
        >
          <custom-icon>refresh</custom-icon>
          <span class="hidden-xs-only">Atualizar</span>
        </v-btn>
        <v-divider dark inset class="mx-1"></v-divider>
        <v-btn
          :icon="mobile"
          small
          outlined
          :disabled="mutableLogo != ''"
          @click="viewAll"
        >
          <custom-icon>preview</custom-icon>
          <span class="hidden-xs-only">Visualizar</span>
        </v-btn>
      </nav-items>
    </v-toolbar>

    <v-card-text>
      <v-layout row id="drop-area">
        <v-col md="3" cols="12" v-if="mutableLogo">
          <v-hover v-slot="{ hover }" ref="file-logo">
            <v-sheet
              elevation="1"
              height="244px"
              width="244px"
              color="grey lighten-4"
              style="position: relative"
            >
              <v-expand-transition>
                <div
                  v-if="hover"
                  class="d-flex transition-fast-in-fast-out primary v-card--reveal align-center justify-center"
                  style="
                    height: 100%;
                    position: absolute;
                    bottom: 0;
                    z-index: 1;
                    height: 244px;
                    width: 244px;
                    opacity: 0.9;
                  "
                >
                  <div class="d-flex">
                    <v-btn icon @click="remove()">
                      <custom-icon size="24px" color="white"
                        >delete</custom-icon
                      >
                    </v-btn>
                    <v-divider dark vertical class="mx-2"></v-divider>
                    <v-btn icon @click.prevent="view()">
                      <custom-icon size="24px" color="white"
                        >preview</custom-icon
                      >
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <!-- <v-img
                :src="
                 logo
                "
                :lazy-src="item.files[0].url"
                width="100%"
                height="244px"
                v-if="!String(item.id).includes('pending_')"
              /> -->

              <img
                style="object-fit: scale-down"
                :src="mutableLogo"
                :lazy-src="mutableLogo"
                width="244px"
                height="244px"
              />
            </v-sheet>
          </v-hover>
        </v-col>

        <!-- begin: default -->
        <v-col md="3" cols="12" class="selectFiles" v-if="!mutableLogo">
          <input
            type="file"
            ref="attachments"
            style="display: none"
            @change="({ target }) => processFiles(target.files)"
            accept=".jpg,.jpeg,.png"
          />
          <v-sheet
            elevation="1"
            height="244px"
            width="244px"
            color="grey lighten-4"
            class="d-flex justify-center align-center"
            @click="$refs.attachments.click()"
          >
            <v-layout column align-center>
              <custom-icon size="64px" color="#333">upload</custom-icon>
              <span>Selecionar Arquivo</span>
            </v-layout>
          </v-sheet>
        </v-col>
        <!-- end: default -->
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
import 'image-preview-vue/lib/imagepreviewvue.css'
import imagePreview from 'image-preview-vue'
import { uniqueId } from 'lodash'
import { mapGetters } from 'vuex'

export default {
  name: 'UploaderLogo',

  props: {
    logo: {
      type: String,
      default: () => '',
    },
  },

  data: () => ({
    mutableLogo: '',
  }),
  created() {
    this.mutableLogo = this.logo
    console.log('messages', this.mutableLogo)
  },
  computed: {
    logoComputed() {
      return this.logo
    },

    endpoint() {
      return (id = null) => {
        if (!this.item?.id) return false
        return `company/attachments`
      }
    },

    ...mapGetters('context', ['api', 'item']),
  },

  methods: {
    async processFiles(files) {
      let dataForm = new FormData()
      for (let file of files) {
        dataForm.append(`file`, file)
      }
      if (!dataForm.get('file')) {
        return
      }
      let res = await this.$axios.$post(`/api/companies/logo`, dataForm)
      this.mutableLogo = process.env.API_URL + '/storage/' + res.url
      this.$emit('send', this.mutableLogo)
    },

    async remove() {
      this.mutableLogo = ''
      this.$emit('send', this.mutableLogo)
    },

    view() {
      try {
        this.previewImages([this.mutableLogo])
      } catch (e) {
        console.warn('open file error: ', e)
      }
    },

    viewAll() {
      // console.debug(this.files)
      this.previewImages([this.mutableLogo])
    },

    processDropFiles() {
      const dropArea = document.getElementById('drop-area')

      if (!dropArea) return

      dropArea.addEventListener('dragover', (event) => {
        event.stopPropagation()
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
      })

      dropArea.addEventListener('drop', (event) => {
        event.stopPropagation()
        event.preventDefault()
        this.processFiles(event.dataTransfer.files)
      })
    },

    previewImages(images = []) {
      imagePreview({
        initIndex: 0,
        images,
        isEnableBlurBackground: false,
        isEnableLoopToggle: true,
        initViewMode: 'contain',
        containScale: 1,
        shirnkAndEnlargeDeltaRatio: 0.2,
        wheelScrollDeltaRatio: 0.2,
        isEnableImagePageIndicator: true,
        maskBackgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 4000,
        isEnableDownloadImage: true,
        onClose: () => [],
      })
    },

    async fetch() {
      // const { id } = this.$route.params
      // const response = await this.$axios.$get(`/api/inputs/${id}/logo`)
      // this.cloneItems = [...response]
      // this.fakeFiles = []
    },

    /**
     * Separar apenas aquivos que serão enviados para o servidor.
     *
     * @returns {any[]}
     */
    async prepareUpload() {
      const form = new FormData()
      const files = []

      const createBlob = async (base64) => {
        const response = await fetch(base64)
        return await response.blob()
      }

      for (const item of this.fakeFiles) {
        const blob = await createBlob(item.files[0])
        form.append('attachments[]', blob)
        files.push(blob)
      }

      if (this.item?.id) {
        const newFiles = await this.$axios.$post(this.endpoint(), form)
        this.cloneItems = [...newFiles]
        this.fakeFiles = []
        return
      }

      this.$emit('send', files)
    },
  },

  mounted() {
    this.processDropFiles()
  },
}
</script>

<style lang="scss">
.selectFiles {
  &:hover {
    cursor: pointer;
  }
}
</style>
