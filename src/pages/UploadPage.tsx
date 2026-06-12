import {
  FileUp,
  Loader2,
  Settings2,
  Wand2,
  X,
} from "lucide-react"
import {
  Suspense,
  lazy,
  useCallback,
  useMemo,
  useState,
  type DragEvent,
} from "react"
import { toast } from "sonner"

import { uploadFile } from "@/api/files"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ExpiryOption, FileUploadResponse } from "@/types/files"
import { useCountdown } from "@/hooks/use-countdown"
import { formatBytes, errorMessage } from "@/lib/utils"

import { AppHeader } from "@/components/app/app-header"
import { HeroCopy } from "@/components/app/hero-copy"
import { FormSection } from "@/components/share/FormSection"
import { ResultCard } from "@/components/share/ResultCard"

const ShareQrDialog = lazy(() =>
  import("@/components/app/share-qr-dialog").then((module) => ({
    default: module.ShareQrDialog,
  }))
)

const expiryOptions: Array<{
  label: string
  value: ExpiryOption
  hint: string
}> = [
  { label: "10 minutes", value: "TEN_MINUTES", hint: "Quick handoff" },
  { label: "1 hour", value: "ONE_HOUR", hint: "Default choice" },
  { label: "24 hours", value: "TWENTY_FOUR_HOURS", hint: "Longer runway" },
]

const viewOptions = [
  { label: "Once (Single access)", value: "1" },
  { label: "3 views (Small group)", value: "3" },
  { label: "10 views (Team share)", value: "10" },
  { label: "Unlimited (Until expiry)", value: "0" },
]

export function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [expiry, setExpiry] = useState<ExpiryOption>("ONE_HOUR")
  const [maxViews, setMaxViews] = useState("1")
  const [alias, setAlias] = useState("")
  const [password, setPassword] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<FileUploadResponse | null>(null)
  const [qrOpen, setQrOpen] = useState(false)
  const [previewToken] = useState(() => randomAlias())

  const countdown = useCountdown(result?.expiryTime)
  const shareUrl = result?.shareUrl ?? ""
  const previewUrl = useMemo(() => buildSharePreview(alias, previewToken), [alias, previewToken])

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setError("Choose a file first.")
      return
    }

    setUploading(true)
    setError("")

    try {
      const response = await uploadFile({
        file: selectedFile,
        expiry,
        maxViews: parseInt(maxViews, 10),
        alias,
        password,
      })

      setResult(response)
      setQrOpen(false)
      toast.success("Short link generated")
    } catch (uploadError) {
      setError(errorMessage(uploadError))
    } finally {
      setUploading(false)
    }
  }, [alias, expiry, maxViews, password, selectedFile])

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragActive(false)

    const file = event.dataTransfer.files.item(0)
    if (file) {
      setSelectedFile(file)
      setResult(null)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 md:px-8 lg:px-10 lg:py-10">
        <AppHeader />

        <div className="grid flex-1 gap-12 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:py-10">
          <HeroCopy />

          <div className="flex flex-col gap-6">
            {!result ? (
              <Card className="border-none bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
                <CardHeader className="px-0 sm:px-6 sm:pb-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      Share a file securely
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 sm:text-base">
                      Upload once, set limits, get a short link.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="grid gap-8 px-0 sm:px-6">
                  {!selectedFile ? (
                    <label
                      htmlFor="file-upload"
                      className={`group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                      }`}
                      onDragLeave={() => setDragActive(false)}
                      onDragOver={(event) => {
                        event.preventDefault()
                        setDragActive(true)
                      }}
                      onDrop={handleDrop}
                    >
                      <input
                        id="file-upload"
                        className="hidden"
                        type="file"
                        onChange={(event) => {
                          setSelectedFile(
                            event.currentTarget.files?.item(0) ?? null
                          )
                          setResult(null)
                        }}
                      />
                      <div className="mb-4 rounded-full border bg-background p-4 text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <FileUp className="size-7" />
                      </div>
                      <p className="text-lg font-semibold tracking-tight sm:text-xl">
                        Drag a file here or click to browse
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Images, videos, documents, or archives
                      </p>
                    </label>
                  ) : (
                    <div className="m-2 flex flex-col gap-4">
                      <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <div className="rounded-full bg-primary/10 p-3 text-primary">
                            <FileUp className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold sm:text-base">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                              {formatBytes(selectedFile.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedFile(null)}
                          title="Remove file"
                          aria-label="Remove file"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="settings" className="border-none">
                          <AccordionTrigger className="rounded-lg bg-muted/30 px-4 py-3 hover:bg-muted/50 hover:no-underline data-[state=open]:rounded-b-none">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Settings2 className="size-4" />
                              Security & Link Settings
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="mb-4 space-y-6 rounded-lg border border-t-0 bg-card p-4">
                            <div className="grid gap-6 sm:grid-cols-2">
                              <FormSection
                                label="Alias"
                                hint="Optional custom URL path"
                              >
                                <div className="flex gap-2">
                                  <Input
                                    maxLength={40}
                                    placeholder="my-file"
                                    value={alias}
                                    disabled={uploading}
                                    onChange={(event) => {
                                      setAlias(event.target.value)
                                      setResult(null)
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    disabled={uploading}
                                    aria-label="Generate random alias"
                                    onClick={() => {
                                      setAlias(randomAlias())
                                      setResult(null)
                                    }}
                                  >
                                    <Wand2 className="size-4" />
                                  </Button>
                                </div>
                                {alias && (
                                  <p className="text-xs break-all text-muted-foreground">
                                    {previewUrl}
                                  </p>
                                )}
                              </FormSection>

                              <FormSection
                                label="Password"
                                hint="Leave empty for open access"
                              >
                                <Input
                                  placeholder="Optional password"
                                  type="password"
                                  value={password}
                                  disabled={uploading}
                                  onChange={(event) =>
                                    setPassword(event.target.value)
                                  }
                                />
                              </FormSection>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                              <FormSection
                                label="Expiry"
                                hint="How long the link stays active"
                              >
                                <Select
                                  value={expiry}
                                  disabled={uploading}
                                  onValueChange={(v) =>
                                    setExpiry(v as ExpiryOption)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select expiry" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {expiryOptions.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormSection>

                              <FormSection
                                label="View limit"
                                hint="Downloads & previews count"
                              >
                                <Select
                                  value={maxViews}
                                  disabled={uploading}
                                  onValueChange={setMaxViews}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select limit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {viewOptions.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormSection>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      {error && (
                        <Alert variant="destructive">
                          <AlertTitle>Upload failed</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="mt-2 border-t pt-4">
                        <Button
                          className="w-full sm:w-auto"
                          size="lg"
                          disabled={uploading}
                          onClick={handleUpload}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            "Generate secure link"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <ResultCard
                countdown={countdown}
                fileName={result.name}
                shareUrl={shareUrl}
                onOpenQr={() => setQrOpen(true)}
                onReset={() => {
                  setResult(null)
                  setSelectedFile(null)
                  setAlias("")
                  setPassword("")
                }}
              />
            )}
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <ShareQrDialog
          open={qrOpen}
          qrCodeUrl={result?.qrCodeUrl ?? ""}
          shareUrl={shareUrl}
          title="Scan short link"
          onOpenChange={setQrOpen}
        />
      </Suspense>
    </main>
  )
}

function buildSharePreview(alias: string, token: string) {
  const cleanedAlias = alias
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)

  const base = window.location.origin.replace(/\/$/, "")

  return cleanedAlias ? `${base}/${token}/${cleanedAlias}` : `${base}/${token}`
}

function randomAlias() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from(
    { length: 5 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join("")
}
