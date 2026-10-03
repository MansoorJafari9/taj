import { ApiError } from '~/services/api/client'

export function useApiError() {
  const { t } = useI18n()

  function getMessage(error: unknown): string {
    if (error instanceof ApiError && error.userMessage) {
      return error.userMessage
    }
    return t('errors.generic')
  }

  return { getMessage }
}
