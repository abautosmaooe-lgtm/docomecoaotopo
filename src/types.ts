export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  views: number;
  shares: number;
  likes: number;
  isPremium: boolean;
  location: string;
  tags: string[];
  commentsCount?: number;
  customImageHeight?: number;
  customWidthSpan?: string;
  customPadding?: string;
  customBorderRadius?: string;
  customGlowColor?: string;
  customAspectRatio?: string;
  linkUrl?: string;
}

export interface AnalyticsMetric {
  name: string;
  views: number;
  shares: number;
  likes: number;
  activeSeconds: number;
}

export type CategoryType = "PODCAST" | "COMUNIDADE" | "EMBAIXADORES" | "TOUR" | "NOTÍCIAS" | "EVENTOS" | "VAGA DE EMPREGOS" | "PARCEIROS" | "CURSOS";
export type CardLayoutType = 'list' | 'grid' | 'compact';
export type UserStatusType = "approved" | "trial" | "suspended" | "pending";

export interface AppUser {
  email: string;
  name: string;
  photoUrl: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  status?: UserStatusType;
  trialEndsAt?: string;
  uid?: string;
}

export interface PortalUserRecord {
  uid?: string;
  email: string;
  name: string;
  photoUrl: string;
  status: UserStatusType;
  trialEndsAt?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Comment {
  id: string;
  userName: string;
  userEmail: string;
  text: string;
  date: string;
  articleId: string;
}

export interface Member {
  id: string;
  name: string;
  companyName?: string;
  photo: string;
  role: string;
  bio: string;
  branch: string;
  city: string;
  contact: string;
  email: string;
  birthday: string;
  isVerified?: boolean;
  gallery?: string[];
  address?: string;
  googleMapsUrl?: string;
  whatsappLink?: string;
  instagramLink?: string;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  date: string;
}
