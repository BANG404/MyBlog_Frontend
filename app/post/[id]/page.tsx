'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'
import { ArrowLeft, Calendar, Share2 } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { useToast } from "@/hooks/use-toast"


export default function PostPage() {
  const { id } = useParams()
  const { isLoggedIn } = useAuth()
  const { toast } = useToast()
  const [post, setPost] = useState<{ 
    title: string; 
    content: string; 
    date: string; 
    author: string;
  } | null>(null)

  useEffect(() => {
    // Mock fetch post data
    const mockPost = {
      id: '1',
      title: '深入理解 React Hooks',
      content: '# React Hooks 简介\n\nReact Hooks 是 React 16.8 中新增的特性。它们允许你在不编写 class 的情况下使用 state 以及其他的 React 特性。\n\n## 为什么使用 Hooks?\n\nHooks 解决了我们在开发 React 应用时经常遇到的问题：\n\n1. 在组件之间复用状态逻辑很难\n2. 复杂组件变得难以理解\n3. 难以理解的 class\n\n## 常用的 Hooks\n\n### useState\n\n`useState` 是最基本的 Hook，它让你在函数组件中添加 state。\n\n\`\`\`jsx\nconst [count, setCount] = useState(0);\n\`\`\`\n\n### useEffect\n\n`useEffect` 让你在函数组件中执行副作用操作。\n\n\`\`\`jsx\nuseEffect(() => {\n  document.title = `You clicked ${count} times`;\n});\n\`\`\`\n\n### useContext\n\n`useContext` 让你不使用组件嵌套就可以订阅 React 的 Context。\n\n\`\`\`jsx\nconst value = useContext(MyContext);\n\`\`\`\n\n## 结论\n\nHooks 是 React 的一个强大特性，它使得函数组件更加灵活和强大。通过使用 Hooks，我们可以编写更简洁、更易于理解和维护的代码。',
      date: '2024-01-10',
      author: '张三'
    }
    setPost(mockPost)
  }, [id])

  const handleShare = () => {
    // Implement actual sharing logic here
    toast({
      title: "分享成功",
      description: "文章链接已复制到剪贴板。",
    })
  }

  if (!post) {
    return <div className="container mx-auto p-4">加载中...</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Back to Home Button */}
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首页
        </Link>
      </Button>

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{post.title}</h1>
        <div className="flex items-center justify-center space-x-4 text-muted-foreground">
          <span className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            {post.date}
          </span>
          <span>|</span>
          <span>{post.author}</span>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Social Sharing */}
      <div className="flex items-center space-x-4">
        <span className="font-semibold">分享这篇文章：</span>
        <Button variant="outline" size="icon" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

