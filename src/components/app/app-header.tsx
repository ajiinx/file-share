import { UploadCloud } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Badge } from "@/components/ui/badge"

export function AppHeader() {
  return (
    <header className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary p-2 text-primary-foreground">
          <UploadCloud className="size-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            File Share
          </p>
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            Fast, simple file sharing
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="border-none">Secure links</Badge>
        <ModeToggle />
      </div>
    </header>
  )
}
