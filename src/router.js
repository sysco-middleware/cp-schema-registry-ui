import Vue from 'vue'
import Router from 'vue-router'

import SchemaDashboard from './views/schema/Dashboard.vue'
import EmptyPanel from './views/schema/Empty.vue'
import SchemaPanel from './views/schema/Panel.vue'
import NewSchemaPanel from './views/schema/New.vue'

Vue.use(Router)

export default new Router({
  routes: [
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
    }
  ]
})
