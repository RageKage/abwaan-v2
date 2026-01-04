import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/features/auth/auth.store'
import { useProfileStore } from '@/features/profile/profile.store'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/features/auth/LoginPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/features/home/HomePage.vue'),
  },
  {
    path: '/collections',
    name: 'collections',
    component: () => import('@/features/collections/CollectionsPage.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/features/home/AboutPage.vue'),
  },
  {
    path: '/contribute',
    name: 'submission-create',
    component: () => import('@/features/submissions/SubmissionCreatePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/s/:id',
    name: 'submission-detail',
    component: () => import('@/features/submissions/SubmissionDetailPage.vue'),
  },
  {
    path: '/onboarding/username',
    name: 'onboarding-username',
    component: () => import('@/features/onboarding/UsernameOnboardingPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/features/profile/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/p/:uid',
    name: 'public-profile',
    component: () => import('@/features/profile/PublicProfilePage.vue'),
  },
  {
    path: '/roadmap',
    name: 'roadmap',
    component: () => import('@/features/home/RoadmapPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/features/home/NotFoundPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const profileStore = useProfileStore()
  await authStore.waitForAuthReady()
  const isAuthed = Boolean(authStore.user)
  const isOnboardingRoute = to.path === '/onboarding/username'
  const isAuthRoute = to.path.startsWith('/login')

  if (to.meta.requiresAuth && !isAuthed) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && isAuthed) {
    return { path: '/' }
  }

  if (isAuthed && !isOnboardingRoute && !isAuthRoute) {
    profileStore.start(authStore.user!.uid)
    await profileStore.waitForProfile()
    if (!profileStore.profile || profileStore.profile.username === null) {
      return { path: '/onboarding/username' }
    }
  }

  return true
})

export default router
