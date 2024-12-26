'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UpdateUserInfoRequest } from '@/lib/types'

// import { updateUserInfo } from '@/lib/api'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState<UpdateUserInfoRequest>({
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    wechatId: user?.wechatId || '',
    blogName: user?.blogName
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.bio) {
        throw new Error('请填写个人简介')
      }

      await updateUser(formData)
      // updateUserInfo(formData)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新信息时发生错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">完善个人资料</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="blogName">博客名称</Label>
              <Input
                id="blogName"
                name="blogName"
                value={formData.blogName}
                onChange={handleChange}
                placeholder="请输入您的博客名称"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">个人简介</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="请简单介绍一下您自己"
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wechatId">微信号</Label>
              <Input
                id="wechatId"
                name="wechatId"
                value={formData.wechatId}
                onChange={handleChange}
                placeholder="选填：方便读者联系您"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存并继续'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

