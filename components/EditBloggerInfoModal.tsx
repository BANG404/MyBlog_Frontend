import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UserInfo } from '@/lib/types' // 导入 UserInfo 类型

interface EditBloggerInfoModalProps {
  userInfo: UserInfo
  onSave: (info: UserInfo) => void
}

export function EditBloggerInfoModal({ userInfo, onSave }: EditBloggerInfoModalProps) {
  const [editedInfo, setEditedInfo] = useState(userInfo)
  const [open, setOpen] = useState(false)

  const handleSave = () => {
    
    onSave(editedInfo)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">编辑博主信息</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑博主信息</DialogTitle>
          <DialogDescription>
            在这里修改您的个人信息。点击保存按钮来更新您的资料。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              用户名
            </Label>
            <Input
              id="username"
              value={editedInfo.username}
              onChange={(e) => setEditedInfo({ ...editedInfo, username: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="avatar" className="text-right">
              头像URL
            </Label>
            <Input
              id="avatar"
              value={editedInfo.avatar || ''}
              onChange={(e) => setEditedInfo({ ...editedInfo, avatar: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              简介
            </Label>
            <Textarea
              id="bio"
              value={editedInfo.bio || ''}
              onChange={(e) => setEditedInfo({ ...editedInfo, bio: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              邮箱
            </Label>
            <Input
              id="email"
              value={editedInfo.email}
              onChange={(e) => setEditedInfo({ ...editedInfo, email: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="wechatId" className="text-right">
              微信
            </Label>
            <Input
              id="wechatId"
              value={editedInfo.wechatId || ''}
              onChange={(e) => setEditedInfo({ ...editedInfo, wechatId: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="blogName" className="text-right">
              博客名称
            </Label>
            <Input
              id="blogName"
              value={editedInfo.blogName}
              onChange={(e) => setEditedInfo({ ...editedInfo, blogName: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>保存更改</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
