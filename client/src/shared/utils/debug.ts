export const isDev = import.meta.env.DEV

export const debugLog = (label: string, data: unknown) => {
  if (!isDev) return
  console.log(label, data)
}
