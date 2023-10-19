// Composables
import { createRouter, createWebHistory } from 'vue-router'
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
        component: () => import('@/views/auth/Login.vue'),
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
        component: () => import('@/views/auth/Register.vue'),
      },
    ],
  },
  {
    path: '/confirm-registration',
    component: () => import('@/layouts/Blank.vue'),
    children: [
      {
        path: '',
        name: 'Registrierung bestätigen',
        component: () => import('@/views/auth/ConfirmRegistration.vue'),
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
        name: 'REDIRECT-mails',
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
      {
        path: 'intern',
        name: 'Interne Termine',
        component: () => import('@/views/calendar/Intern.vue'),
      },
    ],
  },
  {
    path: '/lostnfound',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Fundsachen',
        component: () => import('@/views/lostnfound/Index.vue'),
      },
      {
        path: 'create',
        name: 'Fundstück erstellen',
        component: () => import('@/views/lostnfound/Create.vue')
      },
      {
        path: ':id',
        name: 'Fundstück',
        children: [
          {
            path: '',
            name: 'Fundstück ansehen',
            component: () => import('@/views/lostnfound/View.vue')
          },
          {
            path: 'edit',
            name: 'Fundstück bearbeiten',
            component: () => import('@/views/lostnfound/Edit.vue')
          },
        ]
      }
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
        name: 'REDIRECT-members',
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
      {
        path: 'categories',
        name: 'Kategorien bearbeiten',
        component: () => import('@/views/members/categories/Edit.vue'),
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
  {
    path: '/admin',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Admin',
        component: () => import('@/views/admin/Index.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeResolve(async (to) => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error(error)
  }
  if( session !== null && session?.user?.user_metadata?.status !== "verified" ) {
    // await supabase.auth.signOut()
    return true
    // return {
      // path: '/confirm-registration'
    // }
  }
  if (
    ( !session &&
      ( to.path !== '/login' &&
        to.path !== '/register' &&
        to.path !== '/confirm-registration')
    )
  ) {
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
