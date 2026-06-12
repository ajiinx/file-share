import type { ReactNode } from "react"

export function EmptyState({
  icon,
  title,
  body,
  children,
}: {
  icon: ReactNode
  title: string
  body: string
  children?: ReactNode
}) {
  return (
    <div className="grid min-h-[320px] place-items-center text-center">
      <div className="w-full max-w-md">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground border">
          {icon}
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
        {children}
      </div>
    </div>
  )
}
