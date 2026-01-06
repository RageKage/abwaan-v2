export type NavRoute = {
  label: string
  to: string
}

export type UserRouteAction = 'profile' | 'admin' | 'logout'

export type UserRoute = {
  label: string
  action: UserRouteAction
}

export const mainRoutes: NavRoute[] = [
  { label: 'Archive', to: '/collections' },
  { label: 'Contribute', to: '/contribute' },
]

export const getUserDropdownRoutes = (isAdmin: boolean): UserRoute[] => {
  const routes: UserRoute[] = [{ label: 'Profile', action: 'profile' }]
  if (isAdmin) {
    routes.unshift({ label: 'Admin', action: 'admin' })
  }
  routes.push({ label: 'Logout', action: 'logout' })
  return routes
}
