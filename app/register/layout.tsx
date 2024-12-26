import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "注册新账号",
  description: "创建您的博客账号",
}

export default function RegisterLayout({
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

