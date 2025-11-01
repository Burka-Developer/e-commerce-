interface ApplePayPaymentRequest {
  countryCode: string
  currencyCode: string
  supportedNetworks: string[]
  merchantCapabilities: string[]
  total: { label: string; amount: string }
}

interface ApplePaySessionStatic {
  STATUS_SUCCESS: number
  STATUS_FAILURE: number
}

declare var ApplePaySession: {
  new (version: number, request: ApplePayPaymentRequest): any
  canMakePayments?: () => boolean
  STATUS_SUCCESS: number
  STATUS_FAILURE: number
}

declare global {
  interface Window {
    ApplePaySession?: typeof ApplePaySession
  }
}

export {}
