// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { auth, getCurrentUser } from '@/plugins/firebase'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        meta: { requiresAuth: true },
        component: () => import('@/views/Home.vue'),
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
        component: () => import('@/views/Auth/Login.vue'),
      },
    ],
  },
  {
    path: '/set-password',
    component: () => import('@/layouts/Blank.vue'),
    children: [
      {
        path: '',
        name: 'Set Password',
        component: () => import('@/views/Auth/SetPassword.vue'),
      },
    ],
  },
  {
    path: '/sign-in-with-link',
    component: () => import('@/layouts/Blank.vue'),
    children: [
      {
        path: '',
        name: 'Sign In With Link',
        component: () => import('@/views/Auth/SignInWithLink.vue'),
      },
    ],
  },
  {
    path: '/no-access',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'No Access',
        component: () => import('@/views/NoAccess.vue'),
      },
    ],
  },
  {
    path: '/mails',
    meta: { requiresAuth: true },
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Mails',
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
    meta: { requiresAuth: true },
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
    path: '/docs',
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true },
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
    path: '/orga',
    meta: { requiresAuth: true },
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Verwaltung',
        component: () => import('@/views/orga/Index.vue'),
      },
      {
        path: 'members',
        children: [
          {
            path: '',
            name: 'Mitglieder',
            component: () => import('@/views/orga/members/Index.vue'),
          },
          {
            path: ':id',
            name: 'Mitglied',
            children: [
              {
                path: '',
                name: 'Mitglied ansehen',
                component: () => import('@/views/orga/members/member/View.vue'),
              },
              {
                path: 'edit',
                name: 'Mitglied bearbeiten',
                component: () => import('@/views/orga/members/member/Edit.vue'),
              },
            ],
          },
          {
            path: 'categories',
            name: 'Kategorien bearbeiten',
            component: () => import('@/views/orga/members/categories/Edit.vue'),
          },
        ]
      },
      {
        path: 'groups',
        children: [
          {
            path: '',
            name: 'Gruppen',
            component: () => import('@/views/orga/groups/Index.vue'),
          }
        ]
      },
    ],
  },
  {
    path: '/notifications',
    meta: { requiresAuth: true },
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Benachrichtigungen',
        component: () => import('@/views/Notifications.vue'),
      },
    ],
  },
  {
    path: '/settings',
    meta: { requiresAuth: true },
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
    path: '/account',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Account',
        meta: { requiresAuth: true },
        component: () => import('@/views/Auth/Account.vue'),
      },
    ],
  },
  {
    path: '/admin',
    meta: { requiresAuth: true, requiresAdminOrStaFue: true },
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Admin',
        component: () => import('@/views/admin/Index.vue'),
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            name: 'Nutzer',
            component: () => import('@/views/admin/users/All.vue'),
          },
          {
            path: 'states',
            name: 'Nutzerstati',
            component: () => import('@/views/admin/users/UserStates.vue'),
          }
        ]
      }
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    return {
      top: 0,
      behavior: 'smooth'
    }
  },
})

router.beforeResolve(async (to) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const requiresAdminOrStaFue = to.matched.some(record => record.meta.requiresAdminOrStaFue)
  if (requiresAuth && !await getCurrentUser()) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }
  const isAdmin = await auth.currentUser?.getIdTokenResult()
    .then((idTokenResult) => {
      return idTokenResult.claims.role === 'admin'
    })
    .catch((error) => {
      console.error(error)
      throw error
    })
  const isAdminOrStaFue = await auth.currentUser?.getIdTokenResult()
    .then((idTokenResult) => {
      return ['admin', 'stafue'].includes(idTokenResult.claims.role)
    })
    .catch((error) => {
      console.error(error)
      throw error
    })

  if (requiresAdmin && !isAdmin || requiresAdminOrStaFue && !isAdminOrStaFue) {
    return { name: 'No Access' }
  }
})

export default router
