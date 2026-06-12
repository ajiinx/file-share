import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

import { UploadPage } from "@/pages/UploadPage"
import { DownloadPage } from "@/pages/DownloadPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/:token" element={<DownloadPage />} />
        <Route path="/:token/:alias" element={<DownloadPage />} />
        <Route path="/f/:token" element={<DownloadPage />} />
        <Route path="/f/:token/:alias" element={<DownloadPage />} />
        <Route path="*" element={
          <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
            <div className="text-center">
              <h1 className="text-6xl font-bold">404</h1>
              <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
              <a href="/" className="mt-6 inline-block text-primary hover:underline">Go home</a>
            </div>
          </main>
        } />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
