import Conf from 'conf'

interface ConfigSchema {
  apiKey: string
}

const conf = new Conf<ConfigSchema>({
  projectName: 'claudecash',
  defaults: {
    apiKey: '',
  },
})

// Hardcoded — never stored in Conf so old cached values don't override
export const API_URL = 'https://claudecash.co'

export function getApiKey(): string | null {
  const key = conf.get('apiKey')
  return key || null
}

export function setApiKey(key: string): void {
  conf.set('apiKey', key)
}

/** @deprecated use API_URL directly */
export function getApiUrl(): string {
  return API_URL
}
