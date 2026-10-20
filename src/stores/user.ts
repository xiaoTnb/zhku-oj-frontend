import { defineStore } from 'pinia';
import { loginUser, getUserProfile, updateUserProfile } from '@/api/user';
import type { LoginResponseData, UpdateProfileRequest, UserProfile } from '@/types/user';

interface State {
  token: string | null;
  user: UserProfile | null;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * 用户鉴权与资料 Store
 * - 负责登录、资料刷新/更新、登出等
 * - 将 token 与用户资料持久化到 localStorage
 */
export const useUserStore = defineStore('user', {
  state: (): State => ({
    token: typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null,
    user:
      typeof window !== 'undefined'
        ? (() => {
            try {
              const raw = window.localStorage.getItem(USER_KEY);
              return raw ? (JSON.parse(raw) as UserProfile) : null;
            } catch {
              return null;
            }
          })()
        : null,
  }),
  getters: {
    /** 判断是否已登录 */
    isLoggedIn: (s) => !!s.token && !!s.user,
    /** 展示名优先级：real_name > username */
    displayName: (s) => s.user?.real_name || s.user?.username || '',
    /** 头像 */
    avatar: (s) => s.user?.avatar || '',
  },
  actions: {
    setAuth(token: string, user: UserProfile) {
      this.token = token;
      this.user = user;
      try {
        window.localStorage.setItem(TOKEN_KEY, token);
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch {}
    },
    setUser(user: UserProfile) {
      this.user = user;
      try {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch {}
    },
    clearAuth() {
      this.token = null;
      this.user = null;
      try {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
      } catch {}
    },
    async login(payload: { student_id: string; password: string }) {
      const res: LoginResponseData = await loginUser(payload);
      const { token, user } = res || {};
      this.setAuth(token, user as UserProfile);
      return { token, user };
    },
    async refreshProfile() {
      const profile = await getUserProfile();
      this.setUser(profile);
      return profile;
    },
    async updateProfile(payload: Partial<UserProfile>) {
      const requestBody: UpdateProfileRequest = {
        real_name: payload.real_name,
        email: payload.email,
        school: payload.school,
        major: payload.major,
        grade: payload.grade,
        class: payload.class,
        phone: payload.phone,
        bio: payload.bio,
        avatar: payload.avatar,
      };
      const updated = await updateUserProfile(requestBody);
      this.setUser(updated);
      return updated;
    },
    logout() {
      this.clearAuth();
    },
  },
});
