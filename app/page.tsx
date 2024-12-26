"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Music,
  Film,
  LinkIcon,
  Share2,
  Star,
  ArrowRight,
  Edit,
  Trash,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { EditBloggerInfoModal } from "@/components/EditBloggerInfoModal";
import {
  checkUserExists,
  fetchPosts,
  getLatestMediaByType,
  getDashboardData,
  updateUserInfo,
  deletePost,
  getRssFeed,
  searchPosts,
} from "@/lib/api";
import {
  BlogPost,
  Media,
  UserInfo,
  BlogPostListDTO,
  UpdateUserInfoRequest,
} from "@/lib/types";
import { SharedLink } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [showAllLinks, setShowAllLinks] = useState(false);
  const [posts, setPosts] = useState<BlogPostListDTO[]>([]);
  const [sharedLinks, setSharedLink] = useState<SharedLink[]>([]);
  const [latestMusicMedia, setLatestMusicMedia] = useState<Media | null>(null);
  const [latestMovieMedia, setLatestMovieMedia] = useState<Media | null>(null);
  const [bloggerInfo, setBloggerInfo] = useState<UserInfo>({
    username: "",
    email: "",
    blogName: "",
  });
  const [searchResults, setSearchResults] = useState<BlogPostListDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef(null);

  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true);

        // 检查是否存在用户
        const hasUser = await checkUserExists();

        if (!hasUser) {
          toast({
            title: "提示",
            description: "系统未初始化，即将跳转到注册页面",
          });
          router.replace("/register");
          return;
        }

        const dashboardData = await getDashboardData();

        // 更新状态
        setBloggerInfo(dashboardData.userInfo);
        setPosts(dashboardData.recentPosts);
        setLatestMusicMedia(dashboardData.latestMusicMedia);
        setLatestMovieMedia(dashboardData.latestMovieMedia);
        setSharedLink(dashboardData.recentLinks);
        setPage(1); // 设置初始页码
        setHasMore(dashboardData.recentPosts.length === 5); // 假设每页 10 条
        console.log("Dashboard data:", dashboardData);
      } catch (error) {
        console.error("初始化页面失败:", error);
        toast({
          title: "错误",
          description: error instanceof Error ? error.message : "加载数据失败",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, []); // 移除 router 和 toast 依赖，避免重复执行

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore]);

  const loadMorePosts = async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const newPosts = await fetchPosts(page, 5);
      if (newPosts.content.length > 0) {
        setPosts((prevPosts) => [...prevPosts, ...newPosts.content]);
        setPage((prevPage) => prevPage + 1);
        setHasMore(newPosts.content.length === 5);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more posts:", error);
      toast({
        title: "加载失败",
        description: "无法加载更多文章，请稍后重试。",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <p className="text-lg">检查系统状态...</p>
          <p className="text-sm text-muted-foreground">
            首次使用需要注册管理员账号
          </p>
        </div>
      </div>
    );
  }

  const filteredPosts = searchQuery
    ? (searchResults.length > 0 ? searchResults : posts).filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await searchPosts(searchQuery);
      setSearchResults(response.content);
    } catch (error) {
      console.error("搜索失败:", error);
      toast({
        title: "搜索失败",
        description: error instanceof Error ? error.message : "搜索文章时发生错误",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleEditBloggerInfo = async (newInfo: typeof bloggerInfo) => {
    try {
      // 只提取需要的字段
      const updateData: UpdateUserInfoRequest = {
        avatar: newInfo.avatar,
        email: newInfo.email,
        wechatId: newInfo.wechatId,
        bio: newInfo.bio,
        blogName: newInfo.blogName,
      };

      // 更新用户信息
      await updateUserInfo(updateData);

      // 更新本地状态
      setBloggerInfo(newInfo);

      toast({
        title: "博主信息已更新",
        description: "您的个人信息已成功更新。",
      });
    } catch (error) {
      console.error("更新失败:", error);
      toast({
        title: "更新失败",
        description:
          error instanceof Error ? error.message : "更新个人信息时发生错误",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = (postId: number) => {
    router.push(`/edit/${postId}`);
  };

  const handleDeletePost = async (postId: number) => {
    if (window.confirm("确定要删除这篇文章吗？此操作不可撤销。")) {
      console.log("Deleting post:", postId);
      await deletePost(postId);
      setPosts(posts.filter((post) => post.postId !== postId));
      const dashboardData = await getDashboardData();
      // 更新状态
      setBloggerInfo(dashboardData.userInfo);
      setPosts(dashboardData.recentPosts);
      setLatestMusicMedia(dashboardData.latestMusicMedia);
      setLatestMovieMedia(dashboardData.latestMovieMedia);
      setSharedLink(dashboardData.recentLinks);
      toast({
        title: "文章已删除",
        description: "您的文章已成功删除。",
      });
    }
  };

  const generateArtisticImage = (type: "music" | "movie", data: Media) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 630;

    // Create a more artistic background
    const gradient = ctx.createRadialGradient(600, 315, 0, 600, 315, 800);
    gradient.addColorStop(0, "#2c3e50");
    gradient.addColorStop(1, "#34495e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Add a decorative pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * 1200,
        Math.random() * 630,
        Math.random() * 100 + 50,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Add blog information
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "left";
    ctx.fillText("张三的个人博客", 50, 50);

    ctx.font = "24px Arial";
    ctx.fillText("blog.zhangsan.com", 50, 90);

    // Add content information
    ctx.fillStyle = "white";
    ctx.font = "bold 64px Arial";
    ctx.textAlign = "center";
    ctx.fillText(type === "music" ? "我正在听" : "我正在看", 600, 200);

    ctx.font = "bold 48px Arial";
    ctx.fillText(data.title, 600, 280);

    ctx.font = "36px Arial";
    ctx.fillText(data.artist || data.artist || "", 600, 340);

    return canvas.toDataURL();
  };

  const handleShare = async (type: "music" | "movie") => {
    const media = type === "music" ? latestMusicMedia : latestMovieMedia;
    if (!media) {
      toast({
        title: "分享失败",
        description: `没有可分享的${type === "music" ? "音乐" : "电影"}数据`,
        variant: "destructive",
      });
      return;
    }
    const imageData = generateArtisticImage(type, media);

    if (imageData) {
      try {
        const res = await fetch(imageData);
        const blob = await res.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        toast({
          title: "分享成功",
          description: "艺术图片已复制到剪贴板，您可以粘贴到社交媒体上分享。",
        });
      } catch (err) {
        console.error("Failed to copy image: ", err);
        toast({
          title: "分享失败",
          description:
            "无法复制图片到剪贴板。请检查您的浏览器设置或尝试使用其他浏览器。",
          variant: "destructive",
        });
      }
    }
  };

  const handleRssSubscribe = async () => {
    try {
      const rssFeedUrl = await getRssFeed();
      window.open(rssFeedUrl, '_blank');
      toast({
        title: "RSS 订阅",
        description: "RSS 订阅链接已在新标签页打开",
      });
    } catch (error) {
      console.error('Failed to get RSS feed:', error);
      toast({
        title: "RSS 订阅失败",
        description: "无法获取 RSS 订阅链接，请稍后重试。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className=" p-4 space-y-6">
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {/* Header Section */}
      <header className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={bloggerInfo.avatar} alt={bloggerInfo.blogName} />
            <AvatarFallback>{bloggerInfo.blogName[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{bloggerInfo.blogName}</h1>
            {isLoggedIn && (
              <EditBloggerInfoModal
                userInfo={bloggerInfo}
                onSave={handleEditBloggerInfo}
              />
            )}
          </div>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Input
              type="search"
              placeholder="搜索内容..."
              className="w-[200px] md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="icon" disabled={isSearching}>
              {isSearching ? (
                <div className="animate-spin">⌛</div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
            {isLoggedIn ? (
              <>
                <Button asChild>
                  <Link href="/write">写博客</Link>
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  登出
                </Button>
              </>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/login">登录</Link>
              </Button>
            )}
          </div>
        </form>
      </header>

      <div className="grid md:grid-cols-[300px_1fr_300px] gap-6">
        {/* Left Sidebar */}
        <Card className="h-fit">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">关于我</h3>
              <p className="text-sm text-muted-foreground">
                {bloggerInfo.bio || "这个用户很懒，还没有填写个人简介。"}
              </p>
            </div>
            {(bloggerInfo.email || bloggerInfo.wechatId) && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">联系方式</h3>
                <div className="space-y-1">
                  {bloggerInfo.email && (
                    <p className="text-sm">
                      <span className="font-medium">邮箱：</span>
                      {bloggerInfo.email}
                    </p>
                  )}
                  {bloggerInfo.wechatId && (
                    <p className="text-sm">
                      <span className="font-medium">微信：</span>
                      {bloggerInfo.wechatId}
                    </p>
                  )}
                </div>
                <Button className="w-full" variant="outline" onClick={handleRssSubscribe}>
                  RSS 订阅
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Card key={post.postId} className="transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-semibold">
                    <Link
                      href={`/post/${post.postId}`}
                      className="hover:underline"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    {formatDate(post.publishedAt)}
                  </span>
                </div>
                <div className="prose dark:prose-invert max-w-none mb-4">
                  <ReactMarkdown>
                    {(post.preview ?? '').slice(0, 150) + "..."}
                  </ReactMarkdown>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/post/${post.postId}`}>
                      阅读全文
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {isLoggedIn && (
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPost(post.postId)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePost(post.postId)}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        删除
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredPosts.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">没有找到相关的博客文章</p>
              </CardContent>
            </Card>
          )}
          {hasMore && (
            <div ref={observerTarget} className="flex justify-center p-4">
              {isLoadingMore ? (
                <div className="animate-spin">⌛</div>
              ) : (
                <Button onClick={loadMorePosts} variant="outline">
                  加载更多
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {latestMusicMedia && (
            <Card>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  <span>在听的音乐</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleShare("music")}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex items-center space-x-4">
                <Image
                  src={
                    latestMusicMedia.picture ||
                    "/placeholder.svg?height=300&width=300"
                  }
                  alt={`${latestMusicMedia.title} by ${latestMusicMedia.artist}`}
                  width={80}
                  height={80}
                  className="rounded-md"
                />
                <div>
                  <p className="font-semibold">{latestMusicMedia.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {latestMusicMedia.artist}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {latestMovieMedia && (
            <Card>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  <span>在看的影视</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleShare("movie")}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex items-center space-x-4">
                <Image
                  src={
                    latestMovieMedia.picture ||
                    "/placeholder.svg?height=450&width=300"
                  }
                  alt={latestMovieMedia.title}
                  width={60}
                  height={90}
                  className="rounded-md"
                />
                <div>
                  <p className="font-semibold">{latestMovieMedia.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {latestMovieMedia.artist}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {sharedLinks && sharedLinks.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  <span>分享的链接</span>
                </CardTitle>
                {sharedLinks.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllLinks(!showAllLinks)}
                  >
                    {showAllLinks ? "收起" : "更多"}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {sharedLinks
                  .slice(0, showAllLinks ? undefined : 2)
                  .map((link, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start gap-2 px-2"
                      asChild
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <Image
                          src={link.icon || "/default-favicon.png"}
                          alt=""
                          width={16}
                          height={16}
                          className="h-4 w-4"
                        />
                        <span className="truncate">{link.title}</span>
                      </a>
                    </Button>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
