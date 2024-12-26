'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Image, Video, Upload, Save, ArrowLeft } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/components/AuthContext'
import { BlogPost } from '@/lib/types'
import { fetchPost, updatePost } from '@/lib/api'

export default function EditPage() {
  const router = useRouter()
  const { id } = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [activeTab, setActiveTab] = useState('write')
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    const getPost = async () => {
      if (id) {
        try {
          const postData = await fetchPost(Number(id))
          setPost(postData)
          setTitle(postData.title)
          setContent(postData.content)
        } catch (error) {
          console.error('Failed to fetch post:', error)
          toast({
            title: "错误",
            description: "无法获取文章信息，请稍后重试。",
            variant: "destructive",
          })
        }
      }
    }

    getPost()
  }, [id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post) return

    try {
      const updatedPost = await updatePost(post.postId!, { ...post, title, content })
      toast({
        title: "文章已更新",
        description: "您的文章已成功更新。",
      })
      router.push('/')
    } catch (error) {
      console.error('Failed to update post:', error)
      toast({
        title: "更新失败",
        description: "无法更新文章，请稍后重试。",
        variant: "destructive",
      })
    }
  }

  const insertAtCursor = useCallback((text: string) => {
    if (!editorRef.current) return

    const start = editorRef.current.selectionStart
    const end = editorRef.current.selectionEnd
    const newContent = content.substring(0, start) + text + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.selectionStart = editorRef.current.selectionEnd = start + text.length
        editorRef.current.focus()
      }
    }, 0)
  }, [content])

  const handleInsertImage = useCallback(() => {
    const imageUrl = prompt('请输入图片URL：')
    if (imageUrl) {
      insertAtCursor(`![图片描述](${imageUrl})`)
    }
  }, [insertAtCursor])

  const handleInsertVideo = useCallback(() => {
    const videoUrl = prompt('请输入视频URL：')
    if (videoUrl) {
      insertAtCursor(`<video src="${videoUrl}" controls></video>`)
    }
  }, [insertAtCursor])

  const handleUploadImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 这里应该上传图片到服务器
    // 为了演示，我们使用本地 URL
    const imageUrl = URL.createObjectURL(file)
    insertAtCursor(`![Uploaded Image](${imageUrl})`)
  }, [insertAtCursor])

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回博客首页
      </Button>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <Input
            type="text"
            placeholder="输入文章标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-bold border-none shadow-none focus:ring-0 px-0 py-2 flex-grow mr-4"
          />
          <Button type="submit">更新文章</Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="write">编写</TabsTrigger>
            <TabsTrigger value="preview">预览</TabsTrigger>
          </TabsList>
          <TabsContent value="write" className="mt-4">
            <div className="flex space-x-2 mb-4">
              <Button type="button" size="sm" onClick={handleInsertImage}>
                <Image className="w-4 h-4 mr-2" />
                插入图片
              </Button>
              <Button type="button" size="sm" onClick={handleInsertVideo}>
                <Video className="w-4 h-4 mr-2" />
                插入视频
              </Button>
              <Button type="button" size="sm" asChild>
                <label>
                  <Upload className="w-4 h-4 mr-2" />
                  上传图片
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadImage}
                  />
                </label>
              </Button>
            </div>
            <textarea
              ref={editorRef}
              className="w-full min-h-[70vh] p-4 text-lg leading-relaxed resize-none focus:outline-none focus:ring-0 border-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在此输入文章内容（支持 Markdown 格式）"
            />
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <div className="prose dark:prose-invert max-w-none min-h-[70vh] p-4 border rounded-md">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}

