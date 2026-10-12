export function dayIndex(count: number, date = new Date()) {
  if (count <= 0) return 0
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
  return ((day % count) + count) % count
}

export function publicUrl(file: string) {
  return `${import.meta.env.BASE_URL}${file.replace(/^\//, '')}`
}

export function wallpaperSrc(file: string) {
  return publicUrl(`wallpapers/${encodeURIComponent(file)}`)
}
