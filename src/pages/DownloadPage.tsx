import {
  Clock3,
  Copy,
  Download,
  Eye,
  FileImage,
  FileUp,
  Image as ImageIcon,
  KeyRound,
  Link2,
  QrCode,
  Loader2,
  Shield,
} from "lucide-react"
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"
import { useParams, Link } from "react-router-dom"

import {
  fetchFileContent,
  getFileMetadata,
  shareUrlForToken,
} from "@/api/files"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

import type { FileMetadataResponse } from "@/types/files"
import { copyText } from "@/lib/clipboard"
import { ModeToggle } from "@/components/mode-toggle"
import { useCountdown } from "@/hooks/use-countdown"
import { formatBytes, errorMessage } from "@/lib/utils"

import { InfoTile } from "@/components/share/InfoTile"
import { EmptyState } from "@/components/share/EmptyState"
import { DownloadMainSkeleton, DownloadAsideSkeleton } from "@/components/share/LoadingState"

const ShareQrDialog = lazy(() =>
  import("@/components/app/share-qr-dialog").then((module) => ({
    default: module.ShareQrDialog,
  }))
)

export function DownloadPage() {
  const params = useParams()
  const token = params.token || ""

  const [metadata, setMetadata] = useState<FileMetadataResponse | null>(null)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [error, setError] = useState("")
  const [contentError, setContentError] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")
  const [qrOpen, setQrOpen] = useState(false)
  const hasMetadata = useRef(false)

  const countdown = useCountdown(metadata?.expiryTime)
  const shareUrl = metadata?.shareUrl ?? shareUrlForToken(token)
  const isImage = metadata?.contentType?.startsWith("image/") ?? false
  const isVideo = metadata?.contentType?.startsWith("video/") ?? false
  const locked = metadata?.passwordProtected && !metadata.passwordVerified
  const viewsProgress = calculateViewProgress(metadata)

  const statusText = useMemo(() => {
    if (!metadata) {
      return "Checking link"
    }

    if (!metadata.available) {
      return "Unavailable"
    }

    if (metadata.remainingViews < 0) {
      return "Unlimited views"
    }

    return metadata.remainingViews === 1
      ? "1 view left"
      : `${metadata.remainingViews} views left`
  }, [metadata])

  const loadMetadata = useCallback(
    async (nextPassword = password) => {
      const isUnlocking = hasMetadata.current;
      if (isUnlocking) {
        setUnlocking(true)
      } else {
        setLoading(true)
      }
      setError("")

      try {
        const nextMetadata = await getFileMetadata(token, nextPassword)
        setMetadata(nextMetadata)
        hasMetadata.current = true
      } catch (metadataError) {
        setError(errorMessage(metadataError))
      } finally {
        if (isUnlocking) {
          setUnlocking(false)
        } else {
          setLoading(false)
        }
      }
    },
    [password, token]
  )

  async function loadContent(download: boolean) {
    if (download) {
      setDownloadLoading(true)
    } else {
      setPreviewLoading(true)
    }
    setContentError("")

    try {
      const blob = await fetchFileContent(token, { password, download })
      const objectUrl = URL.createObjectURL(blob)

      if (download) {
        const anchor = document.createElement("a")
        anchor.href = objectUrl
        anchor.download = metadata?.name ?? "download"
        anchor.click()
        URL.revokeObjectURL(objectUrl)
        toast.success("Download started")
      } else {
        setPreviewUrl((currentUrl) => {
          if (currentUrl) {
            URL.revokeObjectURL(currentUrl)
          }
          return objectUrl
        })
      }

      await loadMetadata(password)
    } catch (contentFetchError) {
      setContentError(errorMessage(contentFetchError))
    } finally {
      if (download) {
        setDownloadLoading(false)
      } else {
        setPreviewLoading(false)
      }
    }
  }

  useEffect(() => {
    let active = true

    async function run() {
      setLoading(true)
      setError("")

      try {
        const nextMetadata = await getFileMetadata(token, "")
        if (!active) {
          return
        }
        setMetadata(nextMetadata)
      } catch (metadataError) {
        if (!active) {
          return
        }
        setError(errorMessage(metadataError))
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      active = false
    }
  }, [token])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  async function handleCopyUrl() {
    const copied = await copyText(shareUrl)
    if (copied) {
      toast.success("Link copied")
      return
    }

    toast.error("Could not copy the link")
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 md:px-8 lg:px-10 lg:py-10">
        <header className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            className="flex w-fit items-center gap-3 transition-opacity hover:opacity-80"
            to="/"
          >
            <div className="rounded-lg bg-primary p-2 text-primary-foreground">
              <ImageIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                File Share
              </p>
              <p className="text-lg font-bold tracking-tight">Secure access</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyUrl} aria-label="Copy share URL">
              <Copy className="mr-2 size-4" />
              Copy URL
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQrOpen(true)}
              aria-label="Show QR code"
            >
              <QrCode className="size-4" />
            </Button>
            <ModeToggle />
          </div>
        </header>

        <div className="grid flex-1 gap-12 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:py-10">
          <section className="order-2 grid gap-6 lg:order-1">
            <div className="min-h-[420px] rounded-xl border bg-card p-5 shadow-sm sm:p-6 md:p-8">
              {loading && <DownloadMainSkeleton />}

              {!loading && error && (
                <Alert variant="destructive">
                  <AlertTitle>Error loading file</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!loading && !error && locked && (
                <EmptyState
                  icon={<KeyRound className="size-8" />}
                  title="Password required"
                  body="Enter the password to reveal file details and enable preview or download."
                >
                  <div className="mt-5 flex w-full gap-2">
                    <label htmlFor="file-password" className="sr-only">File password</label>
                    <Input
                      id="file-password"
                      placeholder="Enter password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          void loadMetadata(password)
                        }
                      }}
                    />
                      <Button disabled={unlocking} onClick={() => loadMetadata(password)}>
                        {unlocking && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Unlock
                      </Button>
                    </div>
                  </EmptyState>
                )}

              {!loading &&
                !error &&
                metadata &&
                !locked &&
                !metadata.available && (
                  <EmptyState
                    icon={<Clock3 className="size-8" />}
                    title="Link unavailable"
                    body="This file has expired or used up all allowed views."
                  />
                )}

              {!loading &&
                !error &&
                metadata &&
                !locked &&
                metadata.available && (
                  <div className="space-y-6">
                    <div className="flex min-h-[280px] items-center justify-center rounded-xl bg-muted/20 p-2 text-center sm:p-5">
                      {previewUrl ? (
                        <div className="w-full overflow-hidden rounded-lg">
                          {isImage && (
                            <img
                              alt={metadata.name ?? "Preview"}
                              className="max-h-[460px] w-full object-contain"
                              src={previewUrl}
                            />
                          )}
                          {isVideo && (
                            <video
                              className="max-h-[460px] w-full rounded-lg bg-black"
                              controls
                              src={previewUrl}
                            />
                          )}
                          {!isImage && !isVideo && (
                            <div className="py-12 text-muted-foreground">
                              <FileImage className="mx-auto mb-3 size-8" />
                              <p>
                                Preview is not available for this file type.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto w-fit rounded-full border bg-background p-4 shadow-sm">
                            <Download className="size-7 text-muted-foreground" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold tracking-tight">
                              Ready to access
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Preview in the browser or download directly.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {contentError && (
                      <Alert variant="destructive">
                        <AlertTitle>Action failed</AlertTitle>
                        <AlertDescription>{contentError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button
                        variant="secondary"
                        size="lg"
                        disabled={previewLoading || downloadLoading}
                        onClick={() => loadContent(false)}
                        aria-label="Preview file"
                      >
                        {previewLoading ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Eye className="mr-2 size-4" />
                        )}
                        {previewUrl ? "Refresh preview" : "Preview"}
                      </Button>
                      <Button
                        size="lg"
                        disabled={previewLoading || downloadLoading}
                        onClick={() => loadContent(true)}
                        aria-label="Download file"
                      >
                        {downloadLoading ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 size-4" />
                        )}
                        Download
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          </section>

          {loading ? (
            <DownloadAsideSkeleton />
          ) : error && !metadata ? (
            <aside className="order-1 rounded-xl border border-destructive/20 bg-destructive/5 p-5 shadow-sm sm:p-6 md:p-8 lg:order-2">
              <Badge variant="destructive">Unavailable</Badge>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
                File not found
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This file may have expired, reached its view limit, or been deleted.
              </p>
            </aside>
          ) : (
            <aside className="order-1 rounded-xl border border-black/10 bg-card p-5 shadow-sm sm:p-6 md:p-8 lg:order-2">
              <div className="mb-3 flex flex-wrap gap-2">
              <Badge
                variant={
                  metadata?.available === false ? "destructive" : "secondary"
                }
              >
                {statusText}
              </Badge>
              {metadata?.alias && (
                <Badge variant="outline">{metadata.alias}</Badge>
              )}
            </div>

            <h1 className="wrap-break-words text-2xl font-semibold tracking-tight sm:text-3xl">
              {metadata?.name ?? "Protected file"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Previewing or downloading consumes a view. Metadata checks do not.
            </p>

            <dl className="mt-8 divide-y border-y">
              <InfoTile
                icon={<Clock3 className="size-4" />}
                label="Expires"
                value={countdown}
              />
              <InfoTile
                icon={<Shield className="size-4" />}
                label="Access"
                value={
                  metadata?.passwordProtected
                    ? "Password protected"
                    : "Public link"
                }
              />
              <InfoTile
                icon={<FileUp className="size-4" />}
                label="Size"
                value={
                  metadata ? formatBytes(metadata.sizeBytes) : "Checking..."
                }
              />
              <InfoTile
                icon={<Link2 className="size-4" />}
                label="Share URL"
                value={
                  <div className="flex items-center gap-2 p-1 md:p-2">
                    <span className="max-w-[250px] break-all sm:max-w-[350px] lg:max-w-[400px]">
                      {shareUrl}
                    </span>
                  </div>
                }
              />
            </dl>

            {metadata && metadata.maxViews > 0 && (
              <div className="mt-6 rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    View usage
                  </p>
                  <p
                    className={`rounded-md border px-2 py-1 text-sm font-semibold ${
                      metadata.remainingViews <= 2
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : "border-border/60 bg-background text-muted-foreground"
                    }`}
                  >
                    {metadata.remainingViews} remaining
                  </p>
                </div>
                <Progress
                  className={`h-2 ${
                    metadata.remainingViews <= 2
                      ? "[&_[data-slot=progress-indicator]]:bg-destructive"
                      : ""
                  }`}
                  value={viewsProgress}
                />
              </div>
            )}
          </aside>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <ShareQrDialog
          open={qrOpen}
          qrCodeUrl={metadata?.qrCodeUrl ?? ""}
          shareUrl={shareUrl}
          title="Share this file"
          onOpenChange={setQrOpen}
        />
      </Suspense>
    </main>
  )
}

function calculateViewProgress(metadata: FileMetadataResponse | null) {
  if (!metadata || metadata.maxViews === 0) {
    return 0
  }

  return Math.min(
    100,
    Math.round((metadata.currentViews / metadata.maxViews) * 100)
  )
}
