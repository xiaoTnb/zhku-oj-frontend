/** 标签 */
export interface Tag {
  /** 标签ID */
  id: string;
  /** 标签名称 */
  name: string;
  /** 标签描述 */
  desc?: string;
  /** 使用次数（题目数量） */
  count?: number;
  /** 创建时间 */
  created_at?: string;
  /** 更新时间 */
  updated_at?: string;
  /** 创建者ID */
  created_by?: string;
}

/** 获取标签列表请求参数 */
export interface GetTagsParams {
  /** 页码 */
  page?: number;
  /** 每页数量 */
  page_size?: number;
  /** 标签名称关键字 */
  keyword?: string;
}

/** 获取标签列表响应数据结构 */
export interface GetTagsResponseData {
  /** 标签列表 */
  tags?: Tag[];
  /** 兼容直接返回数组的情况 */
  [key: string]: any;
}

/** 创建标签请求体 */
export interface CreateTagRequest {
  /** 标签名称 */
  name: string;
  /** 标签描述 */
  desc?: string;
}

/** 更新标签请求体 */
export interface UpdateTagRequest {
  /** 标签名称 */
  name?: string;
  /** 标签描述 */
  desc?: string;
}

/** 获取标签响应数据结构 */
export interface GetTagResponseData {
  /** 标签信息 */
  tag: Tag;
}
