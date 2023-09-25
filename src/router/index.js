// Composables
import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '@/plugins/supabase'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/layouts/Blank.vue'),
    children: [
      {
        path: '',
        name: 'Anmelden',
        component: () => import('@/views/Login.vue'),
      },
    ],
  },
  {
    path: '/register',
    component: () => import('@/layouts/Blank.vue'),
    children: [
      {
        path: '',
        name: 'Registrieren',
        component: () => import('@/views/Register.vue'),
      },
    ],
  },
  {
    path: '/mails',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Mail',
        component: () => import('@/views/mails/Index.vue'),
      },
      {
        path: 'compose',
        name: 'Mail verfassen',
        component: () => import('@/views/mails/Compose.vue'),
      },
      {
        path: 'edit',
        name: 'Mail bearbeiten',
        redirect: '/mails',
        children: [
          {
            path: ':id',
            name: 'Mail bearbeiten',
            component: () => import('@/views/mails/Edit.vue')
          }
        ]
      },
    ],
  },
  {
    path: '/calendar',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: 'alles',
        name: 'Kalender',
        component: () => import('@/views/calendar/Calendar.vue'),
      },
      {
        path: 'heim',
        name: 'Heimbelegung',
        component: () => import('@/views/calendar/Heimbelegung.vue'),
      },
      {
        path: 'fahrten-lager',
        name: 'Fahrten & Lager',
        component: () => import('@/views/calendar/FahrtenUndLager.vue'),
      },
    ],
  },
  {
    path: '/docs',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Dokumente & Vorlagen',
        component: () => import('@/views/docs/Docs.vue'),
      },
    ],
  },
  {
    path: '/todos',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Aufgaben',
        component: () => import('@/views/ToDos.vue'),
      },
    ],
  },
  {
    path: '/members',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Mitgliederverwaltung',
        component: () => import('@/views/members/Main.vue'),
      },
      {
        path: 'member',
        name: 'REDIRECT',
        redirect: '/members',
        children: [
          {
            path: ':id',
            name: 'Mitglied',
            children: [
              {
                path: '',
                name: 'Mitglied ansehen',
                component: () => import('@/views/members/member/View.vue'),
              },
              {
                path: 'edit',
                name: 'Mitglied bearbeiten',
                component: () => import('@/views/members/member/Edit.vue'),
              },
            ],
          },
        ]
      },
    ],
  },
  {
    path: '/settings',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Einstellungen',
        component: () => import('@/views/Settings.vue'),
      },
    ],
  },

]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error(error)
  }
  if (!session && (to.path !== '/login' && to.path !== '/register')) {
    return {
      path: '/login',
      query: {
        // we keep the current path in the query so we can
        // redirect to it after login with
        // `router.push(route.query.redirect || '/')`
        redirect: to.fullPath,
      }
    }
  }
})

export default router
