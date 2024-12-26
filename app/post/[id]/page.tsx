'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'
import { ArrowLeft, Calendar, Share2, Edit } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { useToast } from "@/hooks/use-toast"
import { getPost } from '@/lib/api'
import { BlogPost } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default function PostPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { toast } = useToast()
  const [post, setPost] = useState<BlogPost | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await getPost(Number(id))
        setPost(postData)
      } catch (error) {
        console.error('Failed to fetch post:', error)
        toast({
          title: "错误",
          description: "无法获取文章信息，请稍后重试。",
          variant: "destructive",
        })
      }
    }

    if (id) {
      fetchPost()
    }
  }, [id, toast])

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "分享成功",
        description: "文章链接已复制到剪贴板。",
      })
    }).catch(() => {
      toast({
        title: "分享失败",
        description: "无法复制链接，请手动复制。",
        variant: "destructive",
      })
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
            {formatDate(post.publishedAt || post.createdAt || '')}
          </span>
          
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

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
        {isLoggedIn && (
          <Button variant="outline" onClick={() => router.push(`/edit/${post.postId}`)}>
            <Edit className="h-4 w-4 mr-2" />
            编辑文章
          </Button>
        )}
      </div>
    </div>
  )
}

