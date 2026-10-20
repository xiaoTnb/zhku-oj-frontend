/**
 * 用户统计数据
 */
export interface UserStatistics {
  /** 用户ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 总提交次数 */
  total_submissions: number;
  /** 通过次数 */
  accepted_submissions: number;
  /** 通过率 */
  acceptance_rate: number;
  /** 简单题目通过数 */
  easy_solved: number;
  /** 中等题目通过数 */
  medium_solved: number;
  /** 困难题目通过数 */
  hard_solved: number;
  /** 总题目数 */
  total_problems: number;
  /** 解决题目数 */
  solved_problems: number;
  /** 最后活跃时间 */
  last_active: string;
}

/**
 * 系统统计数据
 */
export interface SystemStatistics {
  /** 总用户数 */
  total_users: number;
  /** 总题目数 */
  total_problems: number;
  /** 总提交次数 */
  total_submissions: number;
  /** 总通过次数 */
  total_accepted: number;
  /** 平均通过率 */
  average_acceptance_rate: number;
  /** 在线用户数 */
  online_users: number;
  /** 每日活跃用户 */
  daily_active_users: number;
}