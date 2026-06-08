export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = import.meta.server ? config.wpApiInternal : config.public.wpApi

  const fixImageUrl = (url: string | null): string | null => {
    if (!url) return url
    // Заменяем admin.kirmefhram.ru на kirmefhram.ru для картинок
    return url.replace('admin.kirmefhram.ru', 'kirmefhram.ru')
  }

  const apiFetch = async <T = any>(
    endpoint: string,
    options: {
      params?: Record<string, any>
      method?: string
      body?: any
    } = {}
  ): Promise<T> => {
    try {
      const { params, method, body } = options
      return await $fetch<T>(`${baseURL}/wp-json/wp/v2${endpoint}`, {
        method: method || 'GET',
        params,
        body,
      })
    } catch (error: any) {
      console.error(`Ошибка API ${endpoint}:`, error?.message || error)
      throw error
    }
  }

  return { apiFetch, baseURL, fixImageUrl }
}