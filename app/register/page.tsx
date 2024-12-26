'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/components/AuthContext'
import { register, updateUserInfo } from '@/lib/api'

// 添加默认用户资料配置
const DEFAULT_USER_PROFILE = {
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg', // 默认头像
  description: '这个人很懒，还没有填写简介',
  wechat: '',
}

type FormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
  avatar: string
  description: string
  wechat: string
}

export default function RegisterPage() {
  
  const [step, setStep] = useState(1)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '',
    description: '',
    wechat: '',
  })
  const [error, setError] = useState('')
  const router = useRouter()
  const { toast } = useToast()
  const { login, updateUser, refreshUserInfo } = useAuth()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // 当头像URL改变时更新预览
    if (name === 'avatar') {
      setAvatarPreview(value)
    }
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('请填写所有必填字段')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不匹配')
      return false
    }
    if (formData.password.length < 8) {
      setError('密码长度至少为8个字符')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.description) {
      setError('请填写个人简介')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    setError('')
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      handleSubmit()
    }
  }

  // 优化后的注册提交处理函数
  const handleSubmit = async () => {
    try {
      const registerData = {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        blogName: formData.name,
      }

      // 注册并获取响应
      const response = await register(registerData);

      // 确保 token 和用户信息存在
      if (!response.token || !response.userInfo) {
        throw new Error('注册返回数据不完整');
      }

      // 更新用户资料
      try {
        await updateUserInfo({
          avatar: formData.avatar || DEFAULT_USER_PROFILE.avatar,
          bio: formData.description || DEFAULT_USER_PROFILE.description,
          wechatId: formData.wechat || DEFAULT_USER_PROFILE.wechat,
        });

        // 刷新 AuthContext 中的用户信息
        await refreshUserInfo()

        toast({
          title: "注册成功",
          description: "账号创建成功，即将跳转到首页",
        });

        // 注册完成后延迟跳转，让用户看到成功提示
        setTimeout(() => router.push('/'), 1500);
      } catch (updateError) {
        console.error('更新用户信息失败:', updateError);
        toast({
          title: "部分信息更新失败",
          description: "基本账号已创建，您可以稍后在个人设置中更新资料",
          variant: "destructive",
        });
        // 虽然更新失败，但注册成功，依然跳转
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '注册失败，请重试';
      setError(errorMessage);
      toast({
        title: "注册失败",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  // 优化后的跳过处理函数
  const handleSkip = async () => {
    try {
      if (!validateStep1()) {
        setStep(1);
        return;
      }

      const registerData = {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        blogName: formData.name,
      }

      const response = await register(registerData);

      if (!response.token || !response.userInfo) {
        throw new Error('注册返回数据不完整');
      }

      // 使用默认参数更新用户信息
      try {
        await updateUserInfo({
          avatar: DEFAULT_USER_PROFILE.avatar,
          bio: DEFAULT_USER_PROFILE.description,
          wechatId: DEFAULT_USER_PROFILE.wechat,
        });
      } catch (updateError) {
        console.error('更新默认用户信息失败:', updateError);
        // 使用默认值失败不阻止注册流程
      }

      // 刷新 AuthContext 中的用户信息
      await refreshUserInfo()

      toast({
        title: "注册成功",
        description: "账号已使用默认资料创建，即将跳转到首页",
      });

      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '注册失败，请重试';
      setError(errorMessage);
      toast({
        title: "注册失败",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {step === 1 ? '创建新账号' : '完善个人资料'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">用户名</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="请输入您的用户名"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="请输入您的邮箱"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="请输入密码（至少8个字符）"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2 flex flex-col items-center">
                <Label htmlFor="avatar">头像</Label>
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={avatarPreview || formData.avatar} 
                    alt="Avatar"
                    onError={() => setAvatarPreview('')}
                  />
                  <AvatarFallback>{formData.name[0]}</AvatarFallback>
                </Avatar>
                <Input
                  id="avatar"
                  name="avatar"
                  type="url"
                  placeholder="请输入头像图片URL"
                  value={formData.avatar}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">个人简介</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="请简单介绍一下自己"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wechat">微信号（选填）</Label>
                <Input
                  id="wechat"
                  name="wechat"
                  placeholder="请输入您的微信号"
                  value={formData.wechat}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {step === 1 ? (
            <Button onClick={handleNextStep} className="w-full">
              下一步
            </Button>
          ) : (
            <>
              <Button onClick={handleSubmit} className="w-full">
                完成注册
              </Button>
              <Button variant="outline" onClick={handleSkip} className="w-full">
                跳过，使用默认资料
              </Button>
              <Button variant="ghost" onClick={() => setStep(1)} className="w-full">
                返回上一步
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

