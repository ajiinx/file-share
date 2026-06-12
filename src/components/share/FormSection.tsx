import type { ReactNode } from "react"

export function FormSection({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium leading-none">{label}</label>
        {hint && <p className="mt-1 text-[0.8rem] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  )
}
