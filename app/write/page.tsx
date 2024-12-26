'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Image, Video, Upload, Save, ArrowLeft } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import debounce from 'lodash/debounce'
import { createPost } from '@/lib/api'
import { BlogPost } from '@/lib/types'

const AUTOSAVE_DELAY = 5000 // 5 seconds

export default function WritePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [activeTab, setActiveTab] = useState('write')
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load draft from localStorage
    const savedDraft = localStorage.getItem('blogDraft')
    if (savedDraft) {
      const { title: savedTitle, content: savedContent } = JSON.parse(savedDraft)
      setTitle(savedTitle)
      setContent(savedContent)
    }
  }, [])

  const saveDraft = useCallback(() => {
    const currentDraft = { title, content }
    const savedDraft = localStorage.getItem('blogDraft')
    if (savedDraft !== JSON.stringify(currentDraft)) {
      localStorage.setItem('blogDraft', JSON.stringify(currentDraft))
      console.log('Draft saved') // 用console.log替代toast
    }
  }, [title, content])

  const debouncedSaveDraft = debounce(saveDraft, AUTOSAVE_DELAY)

  useEffect(() => {
    debouncedSaveDraft()
    return () => debouncedSaveDraft.cancel()
  }, [title, content, debouncedSaveDraft])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const hasUrl = /https?:\/\/[^\s]+/.test(content)
    const type = hasUrl ? 'link' : 'article'
    
    try {
      const newPost: BlogPost = {
        title,
        content,
        status: '1'
      }
      
      const response = await createPost(newPost)
      console.log('Post created:', response)
      
      // Clear the draft from localStorage
      localStorage.removeItem('blogDraft')
      
      toast({
        title: "博客发布成功",
        description: "您的文章已成功发布。",
      })
      
      // After submission, redirect to the main blog page
      router.push('/')
    } catch (error) {
      console.error('Failed to create post:', error)
      toast({
        title: "发布失败",
        description: "无法发布您的文章，请重试。",
        variant: "destructive",
      })
    }
  }

  const handleManualSave = () => {
    saveDraft()
    toast({
      title: "草稿已手动保存",
      description: "您的文章草稿已成功保存。",
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        handleManualSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [title, content])

  const insertAtCursor = useCallback((text: string) => {
    if (!editorRef.current) return

    const start = editorRef.current.selectionStart
    const end = editorRef.current.selectionEnd
    const newContent = content.substring(0, start) + text + content.substring(end)
    setContent(newContent)

    // Set cursor position after the inserted text
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.selectionStart = editorRef.current.selectionEnd = start + text.length
        editorRef.current.focus()
      }
    }, 0)
  }, [content])

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault()
        const blob = items[i].getAsFile()
        if (!blob) continue

        try {
          const formData = new FormData()
          formData.append('file', blob, 'pasted_image.png')
          
          // Here you would typically upload the image to your server or a file hosting service
          // For this example, we'll just create a fake URL
          const imageUrl = URL.createObjectURL(blob)
          
          insertAtCursor(`![Pasted Image](${imageUrl})`)
          
          toast({
            title: "图片已插入",
            description: "剪贴板中的图片已成功插入到文章中。",
          })
        } catch (error) {
          console.error('Failed to upload image:', error)
          toast({
            title: "图片插入失败",
            description: "无法插入剪贴板中的图片，请重试。",
            variant: "destructive",
          })
        }
      }
    }
  }, [insertAtCursor, toast])

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

    // Here you would typically upload the file to your server or a file hosting service
    // For this example, we'll just create a fake URL
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
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={handleManualSave}>
              <Save className="w-4 h-4 mr-2" />
              保存草稿
            </Button>
            <Button type="submit">发布</Button>
          </div>
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
              onPaste={handlePaste}
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

