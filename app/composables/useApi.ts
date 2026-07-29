export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = import.meta.server ? config.wpApiInternal : config.public.wpApi

  const apiFetch = async <T = any>(
    endpoint: string,
    options: {
      params?: Record<string, any>
      method?: string
      body?: any
      timeout?: number
      retry?: number
    } = {}
  ): Promise<T | null> => {
    try {
      const { params, method, body, timeout = 5000, retry = 1 } = options
      return await $fetch<T>(`${baseURL}/wp-json/wp/v2${endpoint}`, {
        method: method || 'GET',
        params,
        body,
        timeout,
        retry,
        retryDelay: 300,
      })
    } catch (error: any) {
      // Логируем отдельно таймауты — это обычно означает,
      // что WP-бэкенд тормозит или недоступен
      const isTimeout = error?.name === 'FetchError' && /timeout/i.test(error?.message || '')
      console.error(
        `Ошибка API ${endpoint}${isTimeout ? ' (TIMEOUT)' : ''}:`,
        error?.message || error
      )
      return null
    }
  }

  // Обёртка над $fetch.raw с теми же гарантиями (timeout/retry),
  // нужна там, где важны заголовки пагинации (x-wp-totalpages и т.п.)
  const apiFetchRaw = async (
    endpoint: string,
    options: {
      params?: Record<string, any>
      timeout?: number
      retry?: number
    } = {}
  ) => {
    const { params, timeout = 5000, retry = 1 } = options
    try {
      return await $fetch.raw(`${baseURL}/wp-json/wp/v2${endpoint}`, {
        params,
        timeout,
        retry,
        retryDelay: 300,
      })
    } catch (error: any) {
      console.error(`Ошибка API (raw) ${endpoint}:`, error?.message || error)
      return null
    }
  }

  return { apiFetch, apiFetchRaw, baseURL }
}