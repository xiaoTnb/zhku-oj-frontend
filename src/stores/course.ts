import { defineStore } from 'pinia';
import { 
  queryCourses, 
  getCourseById,
  createCourse, 
  updateCourse, 
  deleteCourse,
  updateCourseAvatar,
  addCourseTeachers,
  removeCourseTeachers,
  getTeachingCourses,
} from '@/api/course';
import type { 
  Course, 
  CourseQueryPayload,
  CourseCardItem, 
  CourseStatus, 
  CreateCoursePayload, 
  UpdateCoursePayload,
  CourseListResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  AddCourseTeachersRequest,
  RemoveCourseTeachersRequest,
} from '@/types/course';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

/**
 * 处理Base64图片数据，添加正确的data URI前缀
 * @param base64Data Base64编码的图片数据
 * @returns 完整的data URI或原始数据
 */
function processImageData(base64Data?: string): string {
  if (!base64Data) {
    return 'https://placehold.co/400x250.png?text=Course+Cover';
  }
  
  // 如果已经是完整的URL或data URI，直接返回
  if (base64Data.startsWith('http') || base64Data.startsWith('data:')) {
    return base64Data;
  }
  
  // 如果是Base64数据，添加data URI前缀
  // 默认假设是JPEG格式，也可以根据数据头部判断格式
  if (base64Data.startsWith('/9j/') || base64Data.startsWith('iVBOR') || base64Data.startsWith('R0lGOD')) {
    // /9j/ 开头通常是JPEG，iVBOR开头是PNG，R0lGOD开头是GIF
    let mimeType = 'image/jpeg';
    if (base64Data.startsWith('iVBOR')) {
      mimeType = 'image/png';
    } else if (base64Data.startsWith('R0lGOD')) {
      mimeType = 'image/gif';
    }
    return `data:${mimeType};base64,${base64Data}`;
  }
  
  // 如果不是识别的图片格式，返回默认图片
  return 'https://placehold.co/400x250.png?text=Course+Cover';
}

/**
 * 课程列表 Store
 * - 负责课程的分页加载、创建/更新/删除等操作
 * - 使用 POST /courses/query 接口进行分页查询
 * - 提供原始数据和卡片数据两种格式
 * - 状态说明：0-未开始，1-进行中，2-已结束（基于swagger CourseStatus模型）
 */
function mapStatusToTag(status?: CourseStatus): { type: '' | 'success' | 'info' | 'warning', label: string } {
  switch (status) {
    case 1: return { type: 'success', label: '进行中' };
    case 2: return { type: 'info', label: '已结束' };
    case 0: return { type: 'warning', label: '未开始' };
    default: return { type: '', label: '未知' };
  }
}

/** 将后端课程实体映射为 UI 卡片项 */
function toCardItem(c: Course): CourseCardItem {
  const status = mapStatusToTag(c.status);
  // 兼容后端返回 name 或 title 字段
  const courseTitle = c.title || c.name || '未命名课程';
  // 从 created_by_user 中提取教师名称
  const teacherName = c.teacher_name || c.created_by_user?.username || c.created_by_user?.real_name || '';
  
  return {
    id: c.id,
    title: courseTitle,
    cover: processImageData(c.avatar || c.cover_url),
    statusType: status.type,
    statusLabel: status.label,
    desc: c.description || '',
    teacher: teacherName,
    students: c.students_count || 0,
    ctime: c.ctime || '',
  };
}

export const useCourseStore = defineStore('course', {
  state: () => ({
    /** 原始课程数据列表 */
    rawCourses: [] as Course[],
    /** UI 卡片列表 */
    cardList: [] as CourseCardItem[],
    /** 当前课程详情 */
    currentCourse: null as Course | null,
    /** 总条数 */
    total: 0,
    /** 当前页码 */
    page: 1,
    /** 每页数量 */
    pageSize: 10,
    /** 总页数 */
    totalPage: 0,
    /** 加载中 */
    loading: false,
    /** 最近一次查询条件 */
    lastQuery: {} as CourseQueryPayload,
  }),
  actions: {
    /**
     * 加载课程列表（分页）
     * @param params 查询参数
     */
    async fetchList(params: CourseQueryPayload = {}) {
      try {
        this.loading = true;
        const query: CourseQueryPayload = {
          page_num: params.page_num ?? this.page,
          page_size: params.page_size ?? this.pageSize,
          name: params.name,
          status: params.status,
        };
        
        const data = await queryCourses(query) as any;
        
        // 调试：查看后端返回的原始数据
        console.log('=== 后端返回的原始数据 ===', data);
        if (data.courses && data.courses[0]) {
          console.log('第一个课程对象:', data.courses[0]);
          console.log('字段列表:', Object.keys(data.courses[0]));
        }
        
        // 处理返回的数据结构
        this.rawCourses = data.courses || data.items || [];
        this.total = data.total ?? 0;
        this.page = data.page_num ?? data.page ?? query.page_num ?? 1;
        this.pageSize = data.page_size ?? query.page_size ?? 12;
        this.totalPage = data.total_page ?? Math.ceil(this.total / this.pageSize);
        
        // 调试：查看 rawCourses
        console.log('rawCourses:', this.rawCourses);
        
        // 转换为UI卡片数据
        this.cardList = this.rawCourses.map(toCardItem);
        
        console.log('cardList:', this.cardList);
        
        this.lastQuery = query;
      } catch (e: any) {
        ElMessage.error(e?.message || '加载课程失败');
        this.rawCourses = [];
        this.cardList = [];
      } finally {
        this.loading = false;
      }
    },

    /**
     * 加载教师课程列表（分页）
     * @param params 查询参数
     */
    async fetchTeachingList(params: CourseQueryPayload = {}) {
      try {
        const userStore = useUserStore();
        console.log('fetchTeachingList called by user:', userStore.user?.id, userStore.user?.real_name);
        
        this.loading = true;
        // 构造查询参数，同时兼容 page/page_num 和 page_size/pageSize
        const query: any = {
          page_num: params.page_num ?? this.page,
          page: params.page_num ?? this.page,
          page_size: params.page_size ?? this.pageSize,
          pageSize: params.page_size ?? this.pageSize,
          name: params.name,
          status: params.status,
        };
        
        console.log('fetchTeachingList params:', query);
        
        const data = await getTeachingCourses(query) as any;
        
        console.log('fetchTeachingList response:', data);
        
        // 处理返回的数据结构，尝试多种字段名
        this.rawCourses = data.courses || data.items || data.list || data.data || [];
        this.total = data.total ?? 0;
        this.page = data.page_num ?? data.page ?? query.page_num ?? 1;
        this.pageSize = data.page_size ?? query.page_size ?? 12;
        this.totalPage = data.total_page ?? Math.ceil(this.total / this.pageSize);
        
        // 转换为UI卡片数据
        this.cardList = this.rawCourses.map(toCardItem);
        
        this.lastQuery = params; // 保存原始参数
      } catch (e: any) {
        console.error('fetchTeachingList error:', e);
        ElMessage.error(e?.message || '加载课程失败');
        this.rawCourses = [];
        this.cardList = [];
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取课程详情
     * @param courseId 课程ID
     */
    async fetchCourseById(courseId: string) {
      try {
        this.loading = true;
        const course = await getCourseById(courseId);
        this.currentCourse = course as Course;
        return course;
      } catch (e: any) {
        ElMessage.error(e?.message || '获取课程详情失败');
        this.currentCourse = null;
        throw e;
      } finally {
        this.loading = false;
      }
    },
    /**
     * 重新根据上一次条件刷新
     */
    async refresh() {
      await this.fetchList(this.lastQuery);
    },

    /**
     * 重置列表状态
     */
    reset() {
      this.rawCourses = [];
      this.cardList = [];
      this.currentCourse = null;
      this.total = 0;
      this.page = 1;
      this.pageSize = 12;
      this.totalPage = 0;
      this.lastQuery = {};
    },

    /**
     * 创建课程
     * @param payload 创建课程参数
     */
    async create(payload: CreateCoursePayload) {
      try {
        await createCourse(payload);
        ElMessage.success('课程创建成功');
        await this.refresh();
      } catch (e: any) {
        ElMessage.error(e?.message || '课程创建失败');
        throw e;
      }
    },

    /**
     * 创建课程（新接口）
     * @param payload 创建课程请求参数
     */
    async createWithNewAPI(payload: CreateCourseRequest) {
      try {
        const result = await createCourse(payload);
        ElMessage.success('课程创建成功');
        await this.refresh();
        return result;
      } catch (e: any) {
        ElMessage.error(e?.message || '课程创建失败');
        throw e;
      }
    },

    /**
     * 创建课程（兼容性接口）
     * @param payload 创建课程参数
     */
    async createCompat(payload: CreateCoursePayload) {
      try {
        const result = await createCourse(payload);
        ElMessage.success('课程创建成功');
        await this.refresh();
        return result;
      } catch (e: any) {
        ElMessage.error(e?.message || '课程创建失败');
        throw e;
      }
    },

    /**
     * 更新课程
     * @param id 课程ID
     * @param payload 更新参数
     */
    async update(id: string, payload: UpdateCoursePayload) {
      try {
        await updateCourse(payload);
        ElMessage.success('课程更新成功');
        await this.refresh();
      } catch (e: any) {
        ElMessage.error(e?.message || '课程更新失败');
        throw e;
      }
    },

    /**
     * 更新课程（新接口）
     * @param payload 更新课程请求参数
     */
    async updateWithNewAPI(payload: UpdateCourseRequest) {
      try {
        const result = await updateCourse(payload);
        ElMessage.success('课程更新成功');
        await this.refresh();
        return result;
      } catch (e: any) {
        ElMessage.error(e?.message || '课程更新失败');
        throw e;
      }
    },

    /**
     * 更新课程（兼容性接口）
     * @param id 课程ID
     * @param payload 更新参数
     */
    async updateCompat(payload: UpdateCoursePayload) {
      try {
        const result = await updateCourse(payload);
        ElMessage.success('课程更新成功');
        await this.refresh();
        return result;
      } catch (e: any) {
        ElMessage.error(e?.message || '课程更新失败');
        throw e;
      }
    },

    /**
     * 删除课程
     * @param id 课程ID
     */
    async remove(id: string) {
      try {
        await deleteCourse(id);
        ElMessage.success('课程已删除');
        await this.refresh();
      } catch (e: any) {
        ElMessage.error(e?.message || '课程删除失败');
        throw e;
      }
    },

    /**
     * 更新课程头像
     * @param courseId 课程ID
     * @param file 头像文件
     */
    async updateAvatar(courseId: string, file: File | Blob) {
      try {
        await updateCourseAvatar(courseId, file);
        ElMessage.success('头像更新成功');
        // 刷新课程详情
        if (this.currentCourse?.id === courseId) {
          await this.fetchCourseById(courseId);
        }
        await this.refresh();
      } catch (e: any) {
        ElMessage.error(e?.message || '头像更新失败');
        throw e;
      }
    },

    /**
     * 添加课程教师（基于swagger文档）
     * @param payload 添加课程教师请求参数
     * @param autoRefresh 是否自动刷新数据，默认为false
     */
    async addTeachers(payload: AddCourseTeachersRequest, autoRefresh: boolean = false) {
      try {
        await addCourseTeachers(payload.course_id, payload);
        // 只在API调用成功时显示成功消息，让调用方处理UI更新
        if (autoRefresh) {
          ElMessage.success('课程教师添加成功');
          // 刷新课程详情
          if (this.currentCourse?.id === payload.course_id) {
            await this.fetchCourseById(payload.course_id);
          }
          await this.refresh();
        }
      } catch (e: any) {
        const errorMsg = e?.response?.data?.message || e?.response?.data?.msg || e?.message || '课程教师移除失败';
        // 统一使用 Warning 提示，避免红色报错
        ElMessage.warning(errorMsg);
        throw e;
      }
    },

    /**
     * 移除课程教师（基于swagger文档）
     * @param payload 移除课程教师请求参数
     * @param autoRefresh 是否自动刷新数据，默认为false
     */
    async removeTeachers(payload: RemoveCourseTeachersRequest, autoRefresh: boolean = false) {
      try {
        if (payload.teacher_ids && payload.teacher_ids.length > 0) {
          for (const teacherId of payload.teacher_ids) {
            await removeCourseTeachers(payload.course_id, teacherId);
          }
        }
        // 只在API调用成功时显示成功消息，让调用方处理UI更新
        if (autoRefresh) {
          ElMessage.success('课程教师移除成功');
          // 刷新课程详情
          if (this.currentCourse?.id === payload.course_id) {
            await this.fetchCourseById(payload.course_id);
          }
          await this.refresh();
        }
      } catch (e: any) {
        const errorMsg = e?.response?.data?.message || e?.response?.data?.msg || e?.message || '课程教师移除失败';
        if (e?.response?.status === 400 || e?.code === 400) {
          ElMessage.warning(errorMsg);
        } else {
          ElMessage.error(errorMsg);
        }
        throw e;
      }
    },
  },
});
