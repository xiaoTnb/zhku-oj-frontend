/**
 * 时间格式化工具函数
 */

/**
 * 格式化时间为易读的字符串
 * @param dateInput - 时间输入，可以是字符串、Date对象或时间戳
 * @param format - 格式类型，默认为 'datetime'
 * @returns 格式化后的时间字符串
 */
export function formatTime(
  dateInput: string | Date | number | null | undefined,
  format: 'datetime' | 'date' | 'time' | 'relative' | 'full' = 'datetime'
): string {
  if (!dateInput) {
    return '暂无';
  }

  let date: Date;
  
  try {
    if (typeof dateInput === 'string') {
      // 处理 ISO 字符串格式，如 "2025-11-02T09:26:02.803Z"
      date = new Date(dateInput);
    } else if (typeof dateInput === 'number') {
      // 处理时间戳
      date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return '无效时间';
    }

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '无效时间';
    }

    const now = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    switch (format) {
      case 'date':
        return `${year}-${month}-${day}`;
      
      case 'time':
        return `${hours}:${minutes}:${seconds}`;
      
      case 'datetime':
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      
      case 'full':
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      
      case 'relative':
        return getRelativeTime(date, now);
      
      default:
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
  } catch (error) {
    console.error('时间格式化错误:', error);
    return '格式化失败';
  }
}

/**
 * 获取相对时间描述
 * @param date - 目标时间
 * @param now - 当前时间
 * @returns 相对时间描述
 */
function getRelativeTime(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 30) {
    return `${diffDays}天前`;
  } else if (diffMonths < 12) {
    return `${diffMonths}个月前`;
  } else {
    return `${diffYears}年前`;
  }
}

/**
 * 格式化创建时间（专门用于用户创建时间等场景）
 * @param dateInput - 时间输入
 * @returns 格式化后的创建时间字符串
 */
export function formatCreateTime(dateInput: string | Date | number | null | undefined): string {
  return formatTime(dateInput, 'datetime');
}

/**
 * 格式化更新时间
 * @param dateInput - 时间输入
 * @returns 格式化后的更新时间字符串
 */
export function formatUpdateTime(dateInput: string | Date | number | null | undefined): string {
  return formatTime(dateInput, 'relative');
}

/**
 * 获取当前时间的格式化字符串
 * @param format - 格式类型
 * @returns 当前时间的格式化字符串
 */
export function getCurrentTime(format: 'datetime' | 'date' | 'time' | 'full' = 'datetime'): string {
  return formatTime(new Date(), format);
}

/**
 * 判断是否为今天
 * @param dateInput - 时间输入
 * @returns 是否为今天
 */
export function isToday(dateInput: string | Date | number): boolean {
  if (!dateInput) return false;
  
  try {
    const date = new Date(dateInput);
    const today = new Date();
    
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  } catch {
    return false;
  }
}

/**
 * 判断是否为本周
 * @param dateInput - 时间输入
 * @returns 是否为本周
 */
export function isThisWeek(dateInput: string | Date | number): boolean {
  if (!dateInput) return false;
  
  try {
    const date = new Date(dateInput);
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return date >= weekStart && date <= weekEnd;
  } catch {
    return false;
  }
}