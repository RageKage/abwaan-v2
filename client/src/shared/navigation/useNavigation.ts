export type NavRoute = {
  label: string
  to: string
}

export type UserRouteAction = 'profile' | 'logout'

export type UserRoute = {
  label: string
  action: UserRouteAction
}

export const mainRoutes: NavRoute[] = [
  { label: 'Collections', to: '/collections' },
  { label: 'Contribute', to: '/contribute' },
]

export const userDropdownRoutes: UserRoute[] = [
  { label: 'Profile', action: 'profile' },
  { label: 'Logout', action: 'logout' },
]
