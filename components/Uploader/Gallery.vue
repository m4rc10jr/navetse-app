<template>
  <v-card flat :disabled="$store.getters['request/loading']">
    <v-toolbar dense flat>
      <v-toolbar-title style="font-size: 16px"
        >Anexos ({{ files.length }})</v-toolbar-title
      >
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
          :disabled="files.length === 0"
          @click="viewAll"
        >
          <custom-icon>preview</custom-icon>
          <span class="hidden-xs-only">Visualizar</span>
        </v-btn>
      </nav-items>
    </v-toolbar>

    <v-card-text>
      <v-layout row id="drop-area">
        <v-col md="3" cols="12" v-for="(item, index) in files" :key="index">
          <v-hover v-slot="{ hover }" :ref="`file-${index}`">
            <v-sheet
              elevation="1"
              height="244px"
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
                    width: 100%;
                    opacity: 0.9;
                  "
                >
                  <div class="d-flex">
                    <v-btn icon @click="remove(item)">
                      <custom-icon size="24px" color="white"
                        >delete</custom-icon
                      >
                    </v-btn>
                    <v-divider dark vertical class="mx-2"></v-divider>
                    <v-btn icon @click.prevent="view(item)">
                      <custom-icon size="24px" color="white"
                        >preview</custom-icon
                      >
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <v-img
                :src="
                  item.files.length > 1 ? item.files[1].url : item.files[0].url
                "
                :lazy-src="item.files[0].url"
                width="100%"
                height="244px"
                v-if="!String(item.id).includes('pending_')"
              />

              <v-img
                :src="item.files[0]"
                :lazy-src="item.files[0]"
                width="100%"
                height="244px"
                v-else
              />
            </v-sheet>
          </v-hover>
        </v-col>

        <!-- begin: default -->
        <v-col md="3" cols="12" class="selectFiles">
          <input
            type="file"
            multiple
            ref="attachments"
            style="display: none"
            @change="({ target }) => processFiles(target.files)"
            accept=".jpg,.jpeg,.png"
          />
          <v-sheet
            elevation="1"
            height="244px"
            color="grey lighten-4"
            class="d-flex justify-center align-center"
            @click="$refs.attachments.click()"
          >
            <v-layout column align-center>
              <custom-icon size="64px" color="#333">upload</custom-icon>
              <span>Selecionar Arquivos</span>
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
  name: 'UploaderGallery',

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({
    attachments: [],
    fakeFiles: [],
    cloneItems: [],
  }),

  computed: {
    files() {
      return [...this.cloneItems, ...this.fakeFiles]
    },

    endpoint() {
      return (id = null) => {
        if (!this.item?.id) return false
        return `${this.api.endpoint}/${this.item.id}/attachments:id`.replace(
          ':id',
          id ? `/${id}` : ''
        )
      }
    },

    ...mapGetters('context', ['api', 'item']),
  },

  methods: {
    async processFiles(files) {
      const readFile = (file) => {
        if (file.type && !file.type.startsWith('image/')) {
          console.warn('File is not an image.', file.type, file)
          return
        }

        return new Promise((resolve) => {
          const reader = new FileReader()

          reader.addEventListener('load', (event) => {
            this.fakeFiles.push({
              id: uniqueId('pending_'),
              files: [event.target.result],
            })

            resolve(reader)
          })

          reader.readAsDataURL(file)
        })
      }

      for (let file of files) {
        await readFile(file)
      }

      this.prepareUpload()
    },

    async remove({ id }) {
      if (String(id).includes('pending_')) {
        const index = this.fakeFiles.findIndex((h) => h.id === id)
        this.fakeFiles.splice(index, 1)
        this.prepareUpload()
        return
      }

      const index = this.cloneItems.findIndex((h) => h.id === id)

      try {
        await this.$axios.$delete(this.endpoint(id))
        this.cloneItems.splice(index, 1)
      } catch (e) {
        console.warn('falhou ao remover: ' + e)
      }
    },

    view({ id, files }) {
      try {
        this.previewImages([
          files.map((h) => (h?.url ? h.url : h))[files.length - 1],
        ])
      } catch (e) {
        console.warn('open file error: ', e)
      }
    },

    viewAll() {
      // console.debug(this.files)
      this.previewImages(
        this.files
          .map((h) => h.files[h.files.length - 1])
          .map((h) => (h?.url ? h.url : h))
      )
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
      const { id } = this.$route.params
      const response = await this.$axios.$get(`/api/inputs/${id}/attachments`)

      this.cloneItems = [...response]
      this.fakeFiles = []
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

  created() {
    this.cloneItems = [...this.items]
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
