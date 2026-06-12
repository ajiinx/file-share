export type ExpiryOption = "TEN_MINUTES" | "ONE_HOUR" | "TWENTY_FOUR_HOURS"

export type FileUploadResponse = {
  token: string
  alias: string | null
  name: string
  contentType: string
  sizeBytes: number
  expiryTime: string
  maxViews: number
  currentViews: number
  passwordProtected: boolean
  shareUrl: string
  previewUrl: string
  downloadUrl: string
  qrCodeUrl: string
}

export type FileMetadataResponse = {
  token: string
  alias: string | null
  name: string | null
  contentType: string | null
  sizeBytes: number
  expiryTime: string
  maxViews: number
  currentViews: number
  remainingViews: number
  passwordProtected: boolean
  passwordVerified: boolean
  available: boolean
  shareUrl: string
  previewUrl: string | null
  downloadUrl: string | null
  qrCodeUrl: string
}

export type ApiError = {
  message?: string
  error?: string
}
