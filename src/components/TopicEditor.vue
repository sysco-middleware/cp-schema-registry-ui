<template>
  <div ref="editor">
    <slot></slot>
  </div>
</template>

<script>
import Ace from 'brace'
import 'brace/mode/json'

export default {
  props: ['content'],
  data () {
    return {
      editor: null
    }
  },
  mounted () {
    this.editor = Ace.edit(this.$refs.editor)
    this.editor.setOptions({
      showPrintMargin: false,
      tabSize: 2,
      useSoftTabs: true,
      mode: 'ace/mode/json'
    })

    if (this.content) {
      this.setValue(this.content)
    }

    this.editor.session.on('change', () => {
      try {
        const content = this.editor.session.getValue()
        const json = JSON.parse(content)
        this.$emit('update:content', json)
      } catch (err) {}
    })
  },
  watch: {
    content () {
      this.setValue(this.content)
    }
  },
  methods: {
    setValue (content) {
      content = this.prettyJSON(content)
      this.editor.session.setValue(content)
    },
    prettyJSON (json) {
      return JSON.stringify(json, null, '\t')
    }
  }
}
</script>
