export async function copyText(text: string): Promise<boolean> {
  if (!text) {
    return false
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to the selection-based fallback below.
    }
  }

  return fallbackCopyTextToClipboard(text)
}

function fallbackCopyTextToClipboard(text: string): boolean {
  const textarea = document.createElement("textarea")
  textarea.value = text

  // Prevent scrolling
  textarea.style.top = "0"
  textarea.style.left = "0"
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"

  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  // Extra step for iOS compatibility
  textarea.setSelectionRange(0, 999999)

  try {
    const success = document.execCommand("copy")
    document.body.removeChild(textarea)
    return success
  } catch {
    document.body.removeChild(textarea)
    return false
  }
}
