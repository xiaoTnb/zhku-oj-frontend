/** 创建测试用例请求 */
export interface CreateTestCase {
  /** 输入数据 */
  input: string;
  /** 是否为样例 */
  is_sample?: boolean;
  /** 内存限制(MB) */
  memory_limit?: number;
  /** 输出数据 */
  output: string;
  /** 题目ID */
  problem_id: string;
  /** 分数 */
  score?: number;
  /** 时间限制(ms) */
  time_limit?: number;
}

/** 测试用例实体 */
export interface TestCase {
  /** 创建时间 */
  created_at: string;
  /** 测试用例ID */
  id: string;
  /** 输入数据 */
  input: string;
  /** 是否为样例 */
  is_sample: boolean;
  /** 内存限制(MB) */
  memory_limit: number;
  /** 输出数据 */
  output: string;
  /** 题目ID */
  problem_id: string;
  /** 分数 */
  score: number;
  /** 时间限制(ms) */
  time_limit: number;
}

/** 批量创建测试用例请求 */
export interface CreateTestCaseBatch {
  /** 题目ID */
  problem_id: string;
  /** 测试用例列表 */
  test_cases: Omit<TestCase, 'id' | 'created_at' | 'problem_id'>[];
}

/** 更新测试用例请求 */
export interface UpdateTestCase {
  /** 输入数据 */
  input?: string;
  /** 是否为样例 */
  is_sample?: boolean;
  /** 内存限制(MB) */
  memory_limit?: number;
  /** 输出数据 */
  output?: string;
  /** 分数 */
  score?: number;
  /** 时间限制(ms) */
  time_limit?: number;
}

