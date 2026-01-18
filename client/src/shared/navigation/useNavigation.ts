export type NavRoute = {
  label: string
  to: string
}

export type UserRouteAction = 'desk' | 'settings' | 'admin' | 'logout'

export type UserRoute = {
  label: string
  action: UserRouteAction
}

export const mainRoutes: NavRoute[] = [
  { label: 'Archive', to: '/collections' },
  { label: 'Contribute', to: '/contribute' },
]

export const getUserDropdownRoutes = (isAdmin: boolean): UserRoute[] => {
  const routes: UserRoute[] = [
    { label: 'Desk', action: 'desk' },
    { label: 'Settings', action: 'settings' },
  ]
  if (isAdmin) {
    routes.unshift({ label: 'Admin', action: 'admin' })
  }
  routes.push({ label: 'Logout', action: 'logout' })
  return routes
}
