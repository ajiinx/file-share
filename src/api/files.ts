import { apiRequest, getPublicBaseUrl } from "@/api/client"
import type {
  ExpiryOption,
  FileMetadataResponse,
  FileUploadResponse,
} from "@/types/files"

const PUBLIC_BASE_URL = getPublicBaseUrl()

export type UploadPayload = {
  file: File
  expiry: ExpiryOption
  maxViews: number
  alias?: string
  password?: string
}

export async function uploadFile(payload: UploadPayload) {
  const body = new FormData()
  body.append("file", payload.file)
  body.append("expiry", payload.expiry)
  body.append("maxViews", String(payload.maxViews))

  if (payload.alias?.trim()) {
    body.append("alias", payload.alias.trim())
  }

  if (payload.password?.trim()) {
    body.append("password", payload.password.trim())
  }

  return apiRequest<FileUploadResponse>("/api/files", {
    method: "POST",
    body,
  })
}

export async function getFileMetadata(token: string, password?: string) {
  return apiRequest<FileMetadataResponse>(`/api/files/${token}`, {
    headers: password?.trim()
      ? { "X-File-Password": password.trim() }
      : undefined,
  })
}

export async function fetchFileContent(
  token: string,
  options: { password?: string; download?: boolean }
) {
  return apiRequest<Blob>(
    `/api/files/${token}/content?download=${Boolean(options.download)}`,
    {
      parseAs: "blob",
      headers: options.password?.trim()
        ? { "X-File-Password": options.password.trim() }
        : undefined,
    }
  )
}

export function shareUrlForToken(token: string) {
  return `${PUBLIC_BASE_URL}/${token}`
}
