import Vue from 'vue'
import axios from 'axios'
import * as config from '@/lib/config'
import {LOCAL_STORAGE_PREFIX} from '@/lib/constants'

const request = axios.create({
  baseURL: config.get('kafka.rest.proxy.api')
})

const state = {
  topics: {}
}

const getters = {
}

const actions = {
  async fetchAll ({commit, state}) {
    const {data: topics} = await request.get('/topics')
    commit('set', topics)

    for (let topic of topics) {
      const format = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}-${topic}`)

      if (!format) {
        continue
      }

      commit('format', {
        topic,
        format
      })
    }
  },
  async fetch ({commit, state}, topic) {
    const {data: info} = await request.get(`/topics/${topic}`)

    commit('append', {
      topic,
      info: info
    })
  }
}

const mutations = {
  set (state, topics) {
    for (let topic of topics) {
      if (state.topics[topic]) {
        continue
      }

      Vue.set(state.topics, topic, {})
    }
  },
  append (state, {topic, info}) {
    if (!state.topics[topic]) {
      Vue.set(state.topics, topic, {})
    }

    // Let's loop over the given info to not override
    // info set by the store (ex. format)
    for (let item in info) {
      Vue.set(state.topics[topic], item, info[item])
    }
  },
  format (state, {topic, format}) {
    if (!state.topics[topic]) {
      Vue.set(state.topics, topic, {})
    }

    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}-${topic}`, format)
    Vue.set(state.topics[topic], 'format', format)
  },
  revokeFormat (state, topic) {
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}-${topic}`)
    Vue.delete(state.topics[topic], 'format')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
