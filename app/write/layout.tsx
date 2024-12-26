import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "编写新博客",
  description: "创建并发布新的博客文章",
}

export default function WriteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`min-h-screen bg-background ${inter.className}`}>
      {children}
    </div>
  )
}

