export interface BlogPost {
  postId?: number;
  userId?: number;
  title: string;
  content: string;
  status: string;
  viewCount?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  preview?: string;
}


export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  email: string;
  blogName: string;
}

export interface UserInfo {
  username: string;
  avatar?: string;
  email: string;
  wechatId?: string;
  bio?: string;
  blogName: string;
  links?: SharedLink[];
}

export interface Media {
  mediaId?: number;
  userId?: number;
  blogPostId?: number;
  title: string;
  picture?: string;
  type: 'music' | 'movie';
  url: string;
  artist?: string;
  publishDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 新增类型定义
export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

export interface RegisterResponse {
  userInfo: UserInfo;
  token: string;
  message?: string;
}

export interface SharedLink {
  linkId?: number;
  userId?: number;
  blogPostId?: number;
  icon: string;
  title: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPostListDTO {
  postId: number;
  title: string;
  preview: string;
  status: string;
  viewCount: number;
  publishedAt: string;
}

export interface PageBlogPostListDTO {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  pageable: PageableObject;
  numberOfElements: number;
  size: number;
  content: BlogPostListDTO[];
  number: number;
  sort: SortObject;
  empty: boolean;
}

export interface PageableObject {
  paged: boolean;
  unpaged: boolean;
  pageNumber: number;
  pageSize: number;
  offset: number;
  sort: SortObject;
}

export interface SortObject {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
}

export interface UpdateUserInfoRequest {
  password?: string;
  avatar?: string;
  email?: string;
  wechatId?: string;
  bio?: string;
  blogName?: string;
}

export interface DashboardData {
  userInfo: UserInfo;
  recentPosts: BlogPostListDTO[];
  latestMusicMedia: Media;
  latestMovieMedia: Media;
  recentLinks: SharedLink[];
}

export interface SearchBlogPostRequest {
  keyword: string;
  page?: number;
  size?: number;
}
