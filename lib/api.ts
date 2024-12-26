import { get } from 'lodash';
import { BlogPost, LoginRequest, RegisterRequest,RegisterResponse, UserInfo, Media, UpdateUserInfoRequest,DashboardData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function fetchWithErrorHandling(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        `HTTP error! status: ${response.status}`
      );
    }

    // 检查 Content-Length 和 Content-Type
    const contentLength = response.headers.get('Content-Length');
    const contentType = response.headers.get('Content-Type');

    // 如果响应为空或不是 JSON 类型，直接返回 true
    if (contentLength === '0' || !contentType?.includes('application/json')) {
      return true;
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// 博客文章相关 API
export async function fetchPosts(page = 0, size = 10) {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/blog/posts?page=${page}&size=${size}`);
  return response;
}

export async function createPost(post: BlogPost) {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/blog/create`, {
    method: 'POST',
    body: JSON.stringify(post)
  });
  return response;
}

export async function updatePost(postId: number, post: BlogPost) {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/blog/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(post)
  });
  return response;
}

export async function deletePost(postId: number) {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/blog/${postId}`, {
      method: 'DELETE'
    });
    
    // response 可能是 true 或 其他响应数据
    return response;
  } catch (error) {
    console.error('Delete post error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('删除文章失败');
  }
}

export async function fetchPost(postId: number): Promise<BlogPost> {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/blog/${postId}`);
  return response;
}

// 搜索博客文章
export async function searchPosts(keyword: string, page = 0, size = 10) {
  const response = await fetchWithErrorHandling(
    `${API_BASE_URL}/api/blog/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
  );
  return response;
}

// 认证相关 API
export async function login(credentials: LoginRequest) {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  // 保存 token
  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  return response;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    // 严格检查响应数据
    if (!response || !response.token) {
      throw new Error('注册响应数据不完整');
    }

    // 保存 token 到 localStorage
    localStorage.setItem('token', response.token);
    
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : '注册失败';
    throw new Error(`注册错误: ${message}`);
  }
}

// 用户检查 API
export async function checkUserExists(): Promise<boolean> {
  try {
    const result = await fetchWithErrorHandling(`${API_BASE_URL}/api/auth/check-user-exists`,{
      method: 'GET',
    });

    return result;
  } catch (error) {
    console.error('Failed to check user:', error);
    return false; // 如果请求失败，默认返回 false
  }
}

// 用户信息更新 API
export async function updateUserInfo(data: UpdateUserInfoRequest): Promise<UserInfo> {
  try {
    console.log('Updating user info with data:', data); // 调试日志

    const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/user/profile`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    console.log('Update user info response:', response); // 调试日志
    
    if (!response) {
      throw new Error('更新失败：服务器未返回数据');
    }

    return response;
  } catch (error) {
    console.error('Update user info error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('更新用户信息失败');
  }
}

// 获取当前登录用户信息
export async function getCurrentUser(): Promise<UserInfo> {
  try {
    console.log('Fetching current user...'); // 调试日志
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/user/profile`);
    console.log('Current user response:', response); // 调试日志
    return response;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('获取用户信息失败');
  }
}

// 获取首页仪表盘数据
export async function getDashboardData(): Promise<DashboardData> {
  let user;
  try {
    user=getCurrentUser(); // 确保用户已登录
    
    const [userInfo, posts, musicMedia, movieMedia, links] = await Promise.all([
      getCurrentUser(),
      fetchPosts(0, 5), // 获取最新5篇文章
      getLatestMediaByType((await user).username,'音乐'),
      getLatestMediaByType((await user).username,'影视'),
      getLatestSharedLinks(5)
    ]);

    return {
      userInfo,
      recentPosts: posts.content,
      latestMusicMedia: musicMedia,
      latestMovieMedia: movieMedia,
      recentLinks: links,
    };
  } catch (error) {
    throw new Error('获取首页数据失败');
  }
}

// 媒体相关 API


export async function getLatestMediaByType(username: string,type:'音乐'|'影视') {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/media/latest?username=${username}&type=${type}`);
  console.log('Get latest media response:', response); // 调试日志
  if (response === true) {
    return null;
  }
  return response;
}

// 文件上传相关 API
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/files/upload`, {
    method: 'POST',
    body: formData
  });
  return response;
}

export async function deleteFile(fileId: number) {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/files/${fileId}`, {
    method: 'DELETE'
  });
  return response;
}

// 添加分享链接相关 API
export async function getLatestSharedLinks(limit: number = 5) {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/shared-links/latest?limit=${limit}`);
  return response;
}

export async function getPost(postId: number): Promise<BlogPost> {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/blog/${postId}`);
    return response;
  } catch (error) {
    console.error('Get post error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('获取文章失败');
  }
}

// 添加 RSS 订阅相关 API
export async function getRssFeed(): Promise<string> {
  return `${API_BASE_URL}/api/rss`;
  // try {
  //   const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/rss`, {
  //     method: 'GET',
  //     headers: {
  //       'Accept': 'application/xml',
  //     },
  //   });
  //   return response;
  //   console.log('Get RSS feed response:', response); // 调试日志
  // } catch (error) {
  //   console.error('Get RSS feed error:', error);
  //   throw error instanceof Error 
  //     ? error 
  //     : new Error('获取 RSS 订阅链接失败');
  // }
}

//