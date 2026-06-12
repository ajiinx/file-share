import { useState } from "react"
import { QrCode } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { copyText } from "@/lib/clipboard"

type ShareQrDialogProps = {
  open: boolean
  qrCodeUrl: string
  shareUrl: string
  title: string
  onOpenChange: (open: boolean) => void
}

export function ShareQrDialog({
  open,
  qrCodeUrl,
  shareUrl,
  title,
  onOpenChange,
}: ShareQrDialogProps) {
  const [loadedQrCodeUrl, setLoadedQrCodeUrl] = useState<string | null>(null)
  const imageLoaded = loadedQrCodeUrl === qrCodeUrl

  async function handleCopy() {
    const copied = await copyText(shareUrl)
    if (copied) {
      toast.success("Link copied")
      return
    }

    toast.error("Could not copy the link")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-md">
        <DialogHeader>
          <Badge variant="secondary" className="mb-2 w-fit">
            <QrCode className="mr-1 size-3.5" />
            QR share
          </Badge>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription>
            Scan with any device or copy the link directly.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex justify-center rounded-lg border bg-muted/30 p-4 sm:p-6">
          {qrCodeUrl ? (
            <>
              {!imageLoaded && (
                <Skeleton className="h-40 w-40 rounded-lg sm:h-48 sm:w-48" />
              )}
              <img
                alt="QR code"
                className={`h-40 w-40 object-contain sm:h-48 sm:w-48 ${
                  !imageLoaded ? "hidden" : ""
                }`}
                src={qrCodeUrl}
                onLoad={() => setLoadedQrCodeUrl(qrCodeUrl)}
              />
            </>
          ) : (
            <Skeleton className="h-40 w-40 rounded-lg sm:h-48 sm:w-48" />
          )}
        </div>

        <div className="space-y-3">
          <p className="rounded-lg border bg-muted/30 px-3 py-2 text-xs break-all text-muted-foreground sm:text-sm">
            {shareUrl}
          </p>
          <Button className="w-full" onClick={handleCopy}>
            Copy link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
