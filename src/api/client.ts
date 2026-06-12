import type { ApiError } from "@/types/files"
import { config } from "@/config/config"

const API_BASE_URL =
  config.API_BASE_URL?.replace(/\/$/, "") ?? defaultApiBaseUrl()

const DEFAULT_TIMEOUT_MS = 15000

export class ApiClientError extends Error {
  status: number
  validationErrors: Record<string, string>

  constructor(
    message: string,
    status: number,
    validationErrors: Record<string, string> = {}
  ) {
    super(message)
    this.name = "ApiClientError"
    this.status = status
    this.validationErrors = validationErrors
  }
}

type RequestOptions = RequestInit & {
  parseAs?: "json" | "blob" | "void"
  timeoutMs?: number
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    parseAs = "json",
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers,
    signal,
    ...init
  } = options

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)
  const { signal: combinedSignal, cleanup: cleanupSignals } = mergeSignals(signal, controller.signal)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      signal: combinedSignal,
    })

    if (!response.ok) {
      throw await toApiClientError(response)
    }

    if (parseAs === "blob") {
      return (await response.blob()) as T
    }

    if (parseAs === "void") {
      return undefined as T
    }

    const json = await response.json()
    if (
      json &&
      typeof json === "object" &&
      "success" in json &&
      "data" in json
    ) {
      return json.data as T
    }
    return json as T
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiClientError(
        "The request took too long. Please try again.",
        408
      )
    }

    throw new ApiClientError("Unable to reach the server right now.", 0)
  } finally {
    window.clearTimeout(timeoutId)
    cleanupSignals()
  }
}

async function toApiClientError(response: Response) {
  try {
    const body = (await response.json()) as ApiError & {
      validationErrors?: Record<string, string>
    }

    return new ApiClientError(
      body.message ?? body.error ?? `Request failed (${response.status})`,
      response.status,
      body.validationErrors ?? {}
    )
  } catch {
    return new ApiClientError(
      `Request failed (${response.status})`,
      response.status
    )
  }
}

function mergeSignals(
  primary?: AbortSignal | null,
  secondary?: AbortSignal | null
): { signal: AbortSignal | undefined; cleanup: () => void } {
  if (!primary && !secondary) {
    return { signal: undefined, cleanup: () => {} }
  }

  if (!primary) {
    return { signal: secondary ?? undefined, cleanup: () => {} }
  }

  if (!secondary) {
    return { signal: primary, cleanup: () => {} }
  }

  const controller = new AbortController()

  const abort = () => controller.abort()
  primary.addEventListener("abort", abort, { once: true })
  secondary.addEventListener("abort", abort, { once: true })

  const cleanup = () => {
    primary.removeEventListener("abort", abort)
    secondary.removeEventListener("abort", abort)
  }

  return { signal: controller.signal, cleanup }
}

export function getPublicBaseUrl() {
  return config.PUBLIC_BASE_URL?.replace(/\/$/, "") ?? window.location.origin
}

function defaultApiBaseUrl() {
  const { protocol, hostname } = window.location
  return `${protocol}//${hostname}:8081`
}
