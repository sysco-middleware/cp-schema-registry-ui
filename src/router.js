import Vue from 'vue'
import Router from 'vue-router'

import Dashboard from './views/Dashboard.vue'

import SchemaDashboard from './views/schemas/Dashboard.vue'
import EmptyPanel from './views/schemas/Empty.vue'
import SchemaPanel from './views/schemas/Panel.vue'
import NewSchemaPanel from './views/schemas/New.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '',
      component: Dashboard,
      children: [
        {
          path: '/schemas',
          component: SchemaDashboard,
          children: [
            {
              path: '',
              name: 'schemas',
              component: EmptyPanel
            },
            {
              name: 'new/schema',
              path: 'new',
              component: NewSchemaPanel
            },
            {
              name: 'schema',
              path: ':subject',
              component: SchemaPanel
            }
          ]
        },
        {
          path: '/topics',
          children: [
            {
              path: '',
              name: 'topics'
            }
          ]
        },
        {
          path: '/topologies',
          children: [
            {
              path: '',
              name: 'topologies'
            }
          ]
        }
      ]
    }
  ]
})
