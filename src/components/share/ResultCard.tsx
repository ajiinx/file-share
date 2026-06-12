import { Copy, QrCode } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { copyText } from "@/lib/clipboard"

export function ResultCard({
  countdown,
  fileName,
  shareUrl,
  onOpenQr,
  onReset,
}: {
  countdown: string
  fileName: string
  shareUrl: string
  onOpenQr: () => void
  onReset: () => void
}) {
  async function handleCopy() {
    const copied = await copyText(shareUrl)
    if (copied) {
      toast.success("Link copied")
      return
    }

    toast.error("Could not copy the link")
  }

  return (
    <Card className="border-primary/20 shadow-sm bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary">
            Link Ready
          </Badge>
          <Button variant="ghost" size="sm" onClick={onReset}>
            Share another file
          </Button>
        </div>
        <CardTitle className="mt-4 text-xl">{fileName}</CardTitle>
        <CardDescription>Expires in {countdown}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input readOnly value={shareUrl} className="bg-background" aria-label="Share URL" />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1 sm:flex-none" onClick={handleCopy} aria-label="Copy URL">
              <Copy className="mr-2 size-4" />
              Copy
            </Button>
            <Button variant="outline" size="icon" onClick={onOpenQr} aria-label="Show QR Code">
              <QrCode className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
