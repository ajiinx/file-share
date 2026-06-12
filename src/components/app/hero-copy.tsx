import { Clock3, Link2, Shield } from "lucide-react"
import type { ReactNode } from "react"

export function HeroCopy() {
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          Share files quickly without an account.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground lg:text-lg">
          Upload once, share a short-lived URL, and control access with expiry,
          password protection, and view limits.
        </p>
      </div>

      <div className="grid gap-4 mt-6">
        <FeatureItem
          icon={<Link2 className="size-5" />}
          title="Short links"
          desc="Optional alias plus a compact 5-character ID."
        />
        <FeatureItem
          icon={<Shield className="size-5" />}
          title="Controlled access"
          desc="Set passwords and view limits only when you need them."
        />
        <FeatureItem
          icon={<Clock3 className="size-5" />}
          title="Automatic cleanup"
          desc="Expired or exhausted files remove themselves automatically."
        />
      </div>
    </div>
  )
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted/50 text-foreground">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
