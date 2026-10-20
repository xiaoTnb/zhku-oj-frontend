import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { ElMessage } from 'element-plus';

export interface ApiResponse<T = any> {
  code?: number | string;
  message?: string;
  msg?: string;
  data?: T;
  success?: boolean;
  [k: string]: any;
}

const appBase = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
const defaultApiBase = `${appBase || ''}/api/v1`;
const envApiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

export const baseURL: string =
  envApiBase ? envApiBase.replace(/\/+$/, '') : defaultApiBase;

const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: false,
});

const ABSOLUTE_URL_RE = /^[a-z][a-z\d+\-.]*:\/\//i;

// 统一接口路径格式：相对路径自动补末尾斜杠（保留 query/hash）
const normalizeApiPath = (url: string): string => {
  if (!url || ABSOLUTE_URL_RE.test(url) || url.startsWith('//')) {
    return url;
  }

  const queryIndex = url.indexOf('?');
  const hashIndex = url.indexOf('#');
  const cutIndexCandidates = [queryIndex, hashIndex].filter((index) => index >= 0);
  const cutIndex = cutIndexCandidates.length > 0 ? Math.min(...cutIndexCandidates) : -1;

  const path = cutIndex >= 0 ? url.slice(0, cutIndex) : url;
  const suffix = cutIndex >= 0 ? url.slice(cutIndex) : '';

  if (!path || path === '/') {
    return `${path}${suffix}`;
  }

  return `${path.replace(/\/+$/, '')}/${suffix}`;
};

// 简洁的消息提示
const toast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  try {
    ElMessage({ message: msg, type, grouping: true });
  } catch {
    // 非 UI 环境下忽略
  }
};

// 获取token的工具函数，与HTTP请求拦截器保持一致
export const getAuthToken = (): string => {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem('token') || '' : '';
  } catch {
    return '';
  }
};

// 请求拦截：附带 token（localStorage）
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
      if (token) {
        const headers: any = config.headers || {};
        if (typeof headers.set === 'function') {
          headers.set('Authorization', `Bearer ${token}`);
        } else {
          headers['Authorization'] = `Bearer ${token}`;
        }
        (config as any).headers = headers;
      }
    } catch {
      // 忽略 token 读取异常
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// 响应拦截：二进制/流直接返回 data；其余返回 data 或整个响应体
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const ct =
      response.headers['content-type'] ||
      (response.headers as any)['Content-Type'] ||
      '';
    // 二进制/下载/流类型直接拿 data
    if (
      ct.includes('octet-stream') ||
      ct.includes('multipart/form-data') ||
      ct.includes('application/x-www-form-urlencoded') ||
      ct.includes('text/event-stream')
    ) {
      return response.data as any;
    }
    // 常规 JSON：优先返回 data.data，否则返回 data
    const payload = response.data;
    const inner = (payload as any)?.data;
    return inner !== undefined ? inner : payload;
  },
  (error: { response: { status: any; data: { message: any; msg: any; }; }; message: any; }) => {
    const status = error?.response?.status;
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      error?.message ||
      '服务异常';

    if (status === 401) {
      // 仅在非登录页面且非注册页面才跳转
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
      
      if (!isAuthPage) {
        toast('登录失效,请重新登录', 'error');
        // 使用 router 跳转而不是硬刷新
        setTimeout(() => {
          // 处理 base url
          const baseUrl = import.meta.env.BASE_URL || '/';
          const loginPath = `${baseUrl}login`.replace('//', '/');
          window.location.href = loginPath;
        }, 1000);
      }
    } else {
      // 不自动显示错误消息,由调用方处理
      // toast(msg, 'error');
    }
    return Promise.reject(error);
  }
);

// 便捷方法（保持简洁）
export const httpGet = <T = any>(url: string, params?: any, config?: AxiosRequestConfig) =>
  instance.get<T>(normalizeApiPath(url), { params, ...(config || {}) }).then((res: any) => res as T);

export const httpPost = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  instance.post<T>(normalizeApiPath(url), data, config).then((res: any) => res as T);

export const httpPut = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  instance.put<T>(normalizeApiPath(url), data, config).then((res: any) => res as T);

export const httpDelete = <T = any>(
  url: string, 
  dataOrParams?: any, 
  config?: AxiosRequestConfig & { useAsParams?: boolean }
) => {
  const { useAsParams, ...restConfig } = config || {};
  
  // 如果明确指定使用查询参数
  if (useAsParams) {
    return instance.delete<T>(normalizeApiPath(url), { params: dataOrParams, ...restConfig }).then((res: any) => res as T);
  }
  
  // 默认情况下，如果dataOrParams存在，尝试作为请求体传递
  // 注意：axios的delete方法第二个参数是config，需要在config.data中传递请求体
  if (dataOrParams) {
    return instance.delete<T>(normalizeApiPath(url), { data: dataOrParams, ...restConfig }).then((res: any) => res as T);
  }
  
  // 没有数据，直接发送
  return instance.delete<T>(normalizeApiPath(url), restConfig).then((res: any) => res as T);
};

export default instance;
