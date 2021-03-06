import Vue from 'vue'
import Vuex from 'vuex'

import mutations from './mutations'
import getters from './getters'
import actions from './actions'
import state from './state'

import producer from './modules/producer'
import messages from './modules/messages'
import clusters from './modules/clusters'
import schemas from './modules/schemas'
import config from './modules/config'
import topics from './modules/topics'
import user from './modules/user'

Vue.use(Vuex)

export default new Vuex.Store({
  mutations,
  getters,
  actions,
  state,
  modules: {
    producer,
    messages,
    clusters,
    schemas,
    config,
    topics,
    user
  }
})
