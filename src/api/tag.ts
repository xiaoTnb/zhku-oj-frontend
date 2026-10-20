import { httpGet, httpPost, httpPut, httpDelete } from '../utils/request';
import type {
  Tag,
  GetTagsParams,
  GetTagsResponseData,
  CreateTagRequest,
  UpdateTagRequest,
  GetTagResponseData
} from '@/types/tag';

/**
 * 获取标签列表
 * GET /tags
 * 认证：需要
 * @param params GetTagsParams 分页查询参数
 * @returns GetTagsResponseData 标签列表及分页信息
 */
export const getTags = (params?: GetTagsParams) =>
  httpGet<GetTagsResponseData>('/tags', params);

/**
 * 获取所有标签（做下拉渲染）
 * GET /tags/public
 * 认证：不需要
 * @returns GetTagsResponseData 标签列表
 */
export const getPublicTags = () =>
  httpGet<GetTagsResponseData>('/tags/public');

/**
 * 根据ID查找标签
 * GET /tags/{id}
 * 认证：需要
 * @param id string 标签ID
 * @returns GetTagResponseData 标签信息
 */
export const getTagById = (id: string) =>
  httpGet<GetTagResponseData>(`/tags/${id}`);

/**
 * 创建标签
 * POST /tags
 * 认证：需要
 * @param data CreateTagRequest 标签数据
 * @returns GetTagResponseData 创建的标签信息
 */
export const createTag = (data: CreateTagRequest) =>
  httpPost<GetTagResponseData>('/tags', data);

/**
 * 更新标签
 * PUT /tags/{id}
 * 认证：需要
 * @param id string 标签ID
 * @param data UpdateTagRequest 标签数据
 * @returns GetTagResponseData 更新后的标签信息
 */
export const updateTag = (id: string, data: UpdateTagRequest) =>
  httpPut<GetTagResponseData>(`/tags/${id}`, data);

/**
 * 删除标签
 * DELETE /tags/{id}
 * 认证：需要
 * @param id string 标签ID
 * @returns void
 */
export const deleteTag = (id: string) =>
  httpDelete<void>(`/tags/${id}`);
