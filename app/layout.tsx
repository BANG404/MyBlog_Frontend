import "@/app/globals.css"
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/AuthContext'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "个人博客系统",
  description: "分享想法和创意的平台",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <AuthProvider>
          <main className="min-h-screen bg-background">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

