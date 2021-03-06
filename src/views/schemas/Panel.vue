<template>
  <div class="panel" v-if="selected">
    <div class="panel-header bg-primary text-white">
      <div class="columns f-middle">
        <div class="column col-6">
          <div class="panel-title h5 mt-10">Schema: {{subject}}</div>
          <div class="panel-subtitle">ID: {{selected.id}}</div>
        </div>
        <div class="column col-2 d-flex f-end">
          <button class="btn btn-error text-capitalize" @click="deleteSubject()"><i class="icon icon-delete"></i> delete</button>
        </div>
        <div class="column">
          <div class="form-group">
            <select class="form-select text-dark" v-model="version" :disabled="versions.length <= 1">
              <option v-for="version of versions" :key="version" :value="version">v{{version}}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <Tabs name="schema-panel" remember>
      <Tab name="Insight">
        <Tabs nav="panel-nav" body="panel-body" name="schema" remember>
          <Tab name="Schema">
            <SchemaEditor :content.sync="schema" @change="compatible = false" />

            <div class="columns mt-2">
              <div class="column" v-show="!compatible">
                <button class="btn btn-block" @click="checkCompatibility()">Validate</button>
              </div>
              <div class="column" v-show="compatible">
                <button class="btn btn-block btn-primary" @click="newSchemaVersion()">Update</button>
              </div>
            </div>
          </Tab>
          <Tab name="Info">
            <Info :schema="schema" />
          </Tab>
          <Tab name="Config">
            <Config :config.sync="config" ref="config" />

            <div class="columns mt-2">
              <div class="column">
                <button class="btn btn-block btn-primary" @click="setConfig()">Update</button>
              </div>
            </div>
          </Tab>
          <Tab name="Diff" :show="showDiff">
            <div class="columns mb-2">
              <div class="column">
                <div class="form-group">
                  <select class="form-select select-sm" v-model="compareLeftVersion">
                    <option v-for="version of versions" :key="version" :value="version">v{{version}}</option>
                  </select>
                </div>
              </div>

              <div class="column">
                <div class="divider-vert"></div>
              </div>

              <div class="column">
                <div class="form-group">
                  <select class="form-select select-sm" v-model="compareRightVersion">
                    <option v-for="version of versions" :key="version" :value="version">v{{version}}</option>
                  </select>
                </div>
              </div>
            </div>

            <SchemaDiffEditor
              :left="compareLeftSchema"
              :right="compareRightSchema"
              class="relative" />
          </Tab>
        </Tabs>
      </Tab>
      <Tab name="Changelog">
        <Tabs nav="panel-nav" body="panel-body" name="changelog" remember>
          <Tab name="Commits">

          </Tab>
          <Tab name="Contributers">

          </Tab>
          <Tab name="Contributers">

          </Tab>
        </Tabs>
      </Tab>
    </Tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import Tab from '@/components/Tab.vue'
import Tabs from '@/components/Tabs.vue'
import SchemaEditor from '@/components/SchemaEditor.vue'
import SchemaDiffEditor from '@/components/SchemaDiffEditor.vue'
import Info from '@/views/schemas/Info.vue'
import Config from '@/views/schemas/Config.vue'

export default {
  components: {
    Tab,
    Tabs,
    SchemaEditor,
    SchemaDiffEditor,
    Info,
    Config
  },
  computed: {
    ...mapState('schemas', [
      'subjects',
      'configs'
    ]),
    /**
     * Return the active schema
     * @return {Object} Active schema
     */
    schemas () {
      const {subject} = this.$route.params
      return this.subjects[subject] || {}
    },
    /**
     * Return all available versions in the active schemas
     * @return {Array} Array containing all schema versions
     */
    versions () {
      return Object.keys(this.schemas || {})
    },
    /**
     * Returns boolean for if to show the diff tab
     * @return {Boolean} show diff tab or not
     */
    showDiff () {
      return this.versions.length > 1
    },
    /**
     * Returns the latest version found in the schemas versions
     * @return {Number} The latest schema version
     */
    latest () {
      return this.versions.length > 0 ? Math.max(...this.versions) : null
    },
    /**
     * Returns the selected schema if no schema is found is a null returned
     * @return {Object|Null} The selected schema if found
     */
    selected () {
      return this.version && this.schemas ? this.schemas[this.version] : null
    },
    compareLeftSchema () {
      const subject = this.schemas[this.compareLeftVersion]
      return subject ? subject.schema : {}
    },
    compareRightSchema () {
      const subject = this.schemas[this.compareRightVersion] || {}
      return subject.schema || {}
    }
  },
  watch: {
    selected () {
      if (!this.selected || !this.selected.schema) {
        return
      }

      this.schema = this.selected.schema
      this.config = this.configs[this.subject]
    },
    async versions () {
      await this.$store.dispatch('schemas/fetchAllVersions', this.subject)
    }
  },
  data () {
    const {subject} = this.$route.params
    return {
      subject,
      version: 0,
      schema: {},
      config: {},
      compareLeftVersion: 0,
      compareRightVersion: 0,
      compatible: false
    }
  },
  async created () {
    await this.$store.dispatch('schemas/fetchVersions', this.subject)
    await this.$store.dispatch('schemas/fetchConfig', this.subject)

    this.version = this.latest

    this.compareLeftVersion = this.versions.length > 1 ? this.latest - 1 : 0
    this.compareRightVersion = this.latest

    await this.$store.dispatch('schemas/fetchAllVersions', this.subject)
  },
  methods: {
    /**
     * Check the compatibility of the current schema.
     * If the schema is incompatible will a notification be thrown.
     */
    async checkCompatibility () {
      try {
        await this.$store.dispatch('schemas/checkCompatibilityLatest', {
          subject: this.subject,
          schema: this.schema
        })

        this.$notify({
          message: 'The schema is valid.',
          type: 'success'
        })

        this.compatible = true
      } catch (error) {
        this.$notify({
          message: String(error),
          type: 'error'
        })
      }
    },
    async setConfig () {
      await this.$store.dispatch('schemas/setConfig', {
        subject: this.subject,
        config: this.config
      })

      this.$refs.config.updateUsedCompatibility()
    },
    async newSchemaVersion () {
      await this.$store.dispatch('schemas/newSchemaVersion', {
        subject: this.subject,
        schema: this.schema
      })

      this.version = this.latest
    },
    /**
     * Delete the active subject from the store
     */
    async deleteSubject () {
      const confirmed = confirm(`are you sure that you want to delete: ${this.subject}`)

      if (!confirmed) {
        return
      }

      await this.$store.dispatch('schemas/deleteSubject', this.subject)
      this.$router.push({name: 'schemas'})
    }
  }
}
</script>
