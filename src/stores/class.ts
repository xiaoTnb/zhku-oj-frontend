import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassMembers,
  getClassQRCode,
  refreshClassQRCode,
  addStudentToClass,
  addStudentsToClass,
  leaveClass,
  addClazzMember,
  removeClazzMember,
  addClazzTeachers,
  removeClazzTeacher,
  bindTeachersToClasses,
  finishTask,
  joinClass,
  getStudentClasses,
  addTask,
  updateTask,
  getTaskDetail,
  deleteTask,
  getMajorClasses,
  addMajorClassesToClass,
  removeMajorClassFromClass,
  removeStudentFromClass,
  getClassTasks
} from '@/api/class';
import type {
  ClassItem,
  ClassListQuery,
  ClassListResponse,
  ClassTableRow,
  ClassStatus,
  CreateClassRequest,
  UpdateClassRequest,
  ClassMember,
  ClassMemberQuery,
  ClassMemberResponse,
  ClassQRCodeResponse,
  AddStudentToClassRequest,
  StudentClassResponse,
  AddClazzMemberRequest,
  AddClazzTeachersRequest,
} from '@/types/class';
import { ElMessage } from 'element-plus';

/**
 * 状态映射 - 基于swagger ClassStatus模型
 */
function mapStatusToTag(status?: ClassStatus): {
  type: '' | 'success' | 'info' | 'warning';
  label: string;
} {
  switch (status) {
    case 1: return { type: 'success', label: '进行中' };
    case 2: return { type: 'info', label: '已结束' };
    case 0: return { type: 'warning', label: '未开始' };
    default: return { type: '', label: '未知' };
  }
}

/**
 * 将班级实体映射为表格行数据
 */
function toTableRow(item: ClassItem): ClassTableRow {
  const statusInfo = mapStatusToTag(item.status);
  const memberCount = item.member_count || 0;
  const maxMembers = item.max_members || 0;

  return {
    ...item,
    statusLabel: statusInfo.label,
    statusType: statusInfo.type,
    memberDisplay: maxMembers > 0 ? `${memberCount} / ${maxMembers}` : `${memberCount}`,
  };
}

/**
 * 班级管理 Store
 * - 负责班级的分页加载、创建/更新/删除等操作
 * - 提供原始数据和表格数据两种格式
 */
export const useClassStore = defineStore('class', () => {

  const courseId = ref<string>('');

  // 状态
  const rawClasses = ref<ClassItem[]>([]);
  const list = ref<ClassTableRow[]>([]);
  const currentClass = ref<ClassItem | null>(null);
  const loading = ref(false);

  // 分页信息
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(10);
  const totalPage = ref(0);

  // 最近一次查询条件
  const lastQuery = ref<ClassListQuery>({});

  // 班级成员
  const members = ref<ClassMember[]>([]);
  const memberTotal = ref(0);
  const memberPage = ref(1);
  const memberPageSize = ref(10);
  const memberLoading = ref(false);

  // 班级二维码
  const qrCode = ref<string>('');
  const inviteCode = ref<string>('');
  const qrCodeLoading = ref(false);

  // 计算属性
  const totalClasses = computed(() => total.value);

  // 班级
  const studentClasses = ref<StudentClassResponse[]>([]);
  const studentClassesLoading = ref(false);

  // 专业班级列表
  const majorClasses = ref<any[]>([]);

  /**
   * 设置课程ID
   * @param id 课程ID
   */
  const setCourseId = (id: string) => {
    courseId.value = id;
  };

  // 操作
  /**
   * 加载班级列表（分页）
   * @param params 查询参数
   */
  const fetchList = async (params: ClassListQuery = {}) => {

    // 检查课程ID是否设置
    if (!courseId.value) {
      console.error('课程ID未设置，请先调用 setCourseId 方法');
      ElMessage.error('课程信息未加载');
      return;
    }

    loading.value = true;
    try {
      const query: ClassListQuery = {
        page: params.page ?? page.value,
        page_size: params.page_size ?? pageSize.value,
        keyword: params.keyword,
        status: params.status,
      };

      // 传入课程ID和查询参数
      const data = (await getClasses(courseId.value)) as ClassListResponse; 

      rawClasses.value = data.data || [];
      total.value = data.total ?? 0;
      page.value = data.page ?? query.page ?? 1;
      pageSize.value = data.page_size ?? query.page_size ?? 10;
      totalPage.value = data.total_page ?? 0;

      list.value = rawClasses.value.map(toTableRow);
      lastQuery.value = query;
    } catch (error: any) {
      ElMessage.error(error?.message || '获取班级列表失败');
      rawClasses.value = [];
      list.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取班级详情
   * @param classId 班级ID
   */
  const fetchById = async (classId: string) => {
    loading.value = true;
    try {
      let classData: any = await getClassById(classId);
      
      // 安全检查：确保返回的是对象
      if (!classData || typeof classData !== 'object') {
        throw new Error('获取到的班级数据格式不正确');
      }

      // 兼容嵌套的 data 结构，例如 { data: { id, major_class_ids, ... } }
      if (classData.data && typeof classData.data === 'object' && !classData.id && !classData.major_class_ids) {
        classData = classData.data;
      }

      // 确保完整保存API返回的数据，包括teachers和major_class_ids字段
      currentClass.value = { ...classData } as ClassItem;
      
      // 检查是否包含teachers字段
      if ('teachers' in classData && Array.isArray((classData as any).teachers)) {
        console.log(`班级 ${classId} 包含 ${(classData as any).teachers.length} 位教师信息`);
      } else {
        // 安全处理，避免后续访问出错
        console.log(`班级 ${classId} 未包含 teachers 字段或格式不正确`);
      }
      
      // 如果后端没有返回member_count，则使用member_ids的长度
      if (currentClass.value.member_count === undefined && currentClass.value.member_ids) {
        currentClass.value.member_count = currentClass.value.member_ids.length;
      }
      
      // 如果member_count仍然为undefined或0，尝试获取班级成员列表来计算
      if (!currentClass.value.member_count) {
        try {
          const membersData = await getClassMembers(classId);
          if (membersData && membersData.members) {
            currentClass.value.member_count = membersData.members.length;
            console.log('通过成员列表获取到班级人数:', currentClass.value.member_count);
          }
        } catch (memberError) {
          console.warn('获取班级成员列表失败:', memberError);
        }
      }
      
      console.log('班级详情获取完成:', {
        classId,
        member_count: currentClass.value.member_count,
        member_ids_length: currentClass.value.member_ids?.length,
        has_teachers: 'teachers' in currentClass.value && Array.isArray(currentClass.value.teachers),
        teacher_count: 'teachers' in currentClass.value && Array.isArray(currentClass.value.teachers) ? currentClass.value.teachers.length : 0,
        classData: currentClass.value
      });
      
      return classData;
    } catch (error: any) {
      ElMessage.error(error?.message || '获取班级详情失败');
      currentClass.value = null;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 创建班级
   * @param payload 创建班级参数
   */
  const create = async (payload: CreateClassRequest) => {
    try {
      await createClass(payload);
      ElMessage.success('班级创建成功');
      await refresh();
    } catch (error: any) {
      ElMessage.error(error?.message || '班级创建失败');
      throw error;
    }
  };

  /**
   * 更新班级
   * @param payload 更新参数
   */
  const update = async (payload: UpdateClassRequest) => {
    try {
      await updateClass(payload.clazz_id || payload.class_id || '', payload);
      await refresh();
    } catch (error: any) {
      ElMessage.error(error?.message || '班级更新失败');
      throw error;
    }
  };

  /**
   * 删除班级
   * @param id 班级ID
   */
  const remove = async (id: string) => {
    try {
      await deleteClass(id);
      ElMessage.success('班级已删除');
      await refresh();
    } catch (error: any) {
      ElMessage.error(error?.message || '班级删除失败');
      throw error;
    }
  };

  /**
   * 添加学生到班级
   * @param classId 班级ID
   * @param studentIds 学生ID数组
   */
  const addStudents = async (classId: string, studentIds: string[]) => {
    try {
      // 使用批量添加API，尝试不同的字段名
      await addStudentsToClass(classId, {
        student_ids: studentIds
      });
      ElMessage.success('学生添加成功');
      // 刷新班级详情
      if (currentClass.value?.id === classId) {
        await fetchById(classId);
      }
      await refresh();
    } catch (error: any) {
      console.error('添加学生失败:', error);
      console.error('错误详情:', error?.response?.data);
      // 如果批量添加失败，回退到单个添加
      console.log('批量添加失败，尝试单个添加');
      try {
        for (const studentId of studentIds) {
          // 使用AddClazzMemberRequest，后端期望member_id
          const payload: AddClazzMemberRequest = {
            clazz_id: classId,
            member_id: studentId
          };
          console.log('添加学生到班级:', { classId, studentId, payload, courseId: courseId.value });
          await addClazzMember(classId, payload);
        }
        ElMessage.success('学生添加成功');
        if (currentClass.value?.id === classId) {
          await fetchById(classId);
        }
        await refresh();
      } catch (retryError: any) {
        console.error('单个添加也失败:', retryError);
        console.error('单个添加错误详情:', retryError?.response?.data);
        ElMessage.error(error?.message || '学生添加失败');
        throw error;
      }
    }
  };

  /**
   * 从班级移除学生
   * @param classId 班级ID
   * @param studentId 学生ID
   */
  const removeStudent = async (classId: string, studentId: string) => {
    try {
      // 使用 leaveClass 接口，学生自己退出班级
      await leaveClass(classId);
      ElMessage.success('学生已移除');
      if (currentClass.value?.id === classId) {
        await fetchById(classId);
      }
      await refresh();
    } catch (error: any) {
      ElMessage.error(error?.message || '学生移除失败');
      throw error;
    }
  };

  /**
   * 添加单个学生到班级（新接口）
   * @param payload 添加学生请求参数
   */
  const addSingleStudent = async (payload: AddStudentToClassRequest) => {
    try {
      await addStudentToClass(payload.clazz_id || payload.class_id || '', payload);
      ElMessage.success('学生添加成功');
      if (currentClass.value?.id === payload.clazz_id || currentClass.value?.id === payload.class_id) {
        await fetchById(payload.clazz_id || payload.class_id || '');
      }
      await refresh();
    } catch (error: any) {
      ElMessage.error(error?.message || '学生添加失败');
      throw error;
    }
  };

  /**
   * 通过请求参数移除学生
   * @param classId 班级ID
   */
  const removeStudentByRequest = async (classId: string) => {
    try {
      await leaveClass(classId);
      ElMessage.success('学生已移除');
      if (currentClass.value?.id === classId) {
        await fetchById(classId);
      }
      await refresh();
    } catch (error: any) {
      ElMessage.error(error?.message || '学生移除失败');
      throw error;
    }
  };

  /**
   * 获取班级成员列表
   * @param params 查询参数
   */
  const fetchMembers = async (params: ClassMemberQuery) => {
    memberLoading.value = true;
    try {
      const query: ClassMemberQuery = {
        class_id: params.class_id,
        page: params.page ?? memberPage.value,
        page_size: params.page_size ?? memberPageSize.value,
        keyword: params.keyword,
      };

      // getClassMembers接口只接受classId参数
      const data = await getClassMembers(params.class_id);
      
      // 根据实际接口返回数据结构调整：接口直接返回学生数组
      if (Array.isArray(data)) {
        members.value = data;
        memberTotal.value = data.length;
        memberPage.value = query.page ?? 1;
        memberPageSize.value = query.page_size ?? 10;
        
        // 更新当前班级的成员数量
        if (currentClass.value && currentClass.value.id === params.class_id) {
          currentClass.value.member_count = data.length;
        }
      } else if (data && data.members) {
        // 兼容原有的数据结构
        members.value = data.members || [];
        memberTotal.value = data.total ?? 0;
        memberPage.value = data.page ?? query.page ?? 1;
        memberPageSize.value = data.page_size ?? query.page_size ?? 10;
        
        // 更新当前班级的成员数量
        if (currentClass.value && currentClass.value.id === params.class_id) {
          currentClass.value.member_count = data.members?.length || 0;
        }
      } else {
        members.value = [];
        memberTotal.value = 0;
        
        // 更新当前班级的成员数量
        if (currentClass.value && currentClass.value.id === params.class_id) {
          currentClass.value.member_count = 0;
        }
      }
    } catch (error: any) {
      ElMessage.error(error?.message || '获取班级成员列表失败');
      members.value = [];
      memberTotal.value = 0;
      
      // 更新当前班级的成员数量
      if (currentClass.value && currentClass.value.id === params.class_id) {
        currentClass.value.member_count = 0;
      }
    } finally {
      memberLoading.value = false;
    }
  };

  /**
   * 获取班级二维码
   * @param classId 班级ID
   * @param silent 是否静默失败，不显示错误消息
   */
  const fetchQRCode = async (classId: string, silent: boolean = false) => {
    qrCodeLoading.value = true;
    try {
      const response = await getClassQRCode(classId);

      // 根据实际API响应结构处理数据
      // API直接返回base64字符串
      if (response && typeof response === 'string' && response.length > 0) {
        // 添加data URL前缀以便在img标签中显示
        const qrCodeDataUrl = `data:image/png;base64,${response}`;
        qrCode.value = qrCodeDataUrl;
      } else {
        qrCode.value = '';
      }

      // API直接返回base64字符串，没有邀请码信息
      inviteCode.value = '';

      return response;
    } catch (error: any) {
      if (!silent) {
        ElMessage.error(error?.message || '获取班级二维码失败');
      }
      throw error;
    } finally {
      qrCodeLoading.value = false;
    }
  };

  /**
   * 刷新班级二维码
   * @param classId 班级ID
   * @param courseId 课程ID（可选）
   */
  const refreshQRCode = async (classId: string, courseId?: string) => {
    qrCodeLoading.value = true;
    try {
      const response = await refreshClassQRCode(classId, courseId);

      // 根据实际API响应结构处理数据
      // API直接返回base64字符串
      if (response && typeof response === 'string' && response.length > 0) {
        // 添加data URL前缀以便在img标签中显示
        const qrCodeDataUrl = `data:image/png;base64,${response}`;
        qrCode.value = qrCodeDataUrl;
      } else {
        qrCode.value = '';
      }

      // API直接返回base64字符串，没有邀请码信息
      inviteCode.value = '';

      return response;
    } catch (error: any) {
      console.error('刷新二维码失败，尝试使用GET方法获取:', error);
      // 如果刷新失败，尝试使用GET方法获取二维码
      try {
        const fallbackResponse = await getClassQRCode(classId);
        if (fallbackResponse && typeof fallbackResponse === 'string' && fallbackResponse.length > 0) {
          const qrCodeDataUrl = `data:image/png;base64,${fallbackResponse}`;
          qrCode.value = qrCodeDataUrl;
          inviteCode.value = '';
          return fallbackResponse;
        }
      } catch (fallbackError) {
        console.error('获取二维码也失败:', fallbackError);
      }
      ElMessage.error(error?.message || '二维码刷新失败');
      throw error;
    } finally {
      qrCodeLoading.value = false;
    }
  };

  /**
   * 刷新当前列表
   */
  const refresh = async () => {
    await fetchList(lastQuery.value);
  };

  /**
   * 添加班级成员（基于swagger文档）
   * @param payload 添加班级成员请求参数
   */
  const addClazzMemberAction = async (payload: AddClazzMemberRequest) => {
    try {
      await addClazzMember(payload.clazz_id, payload);
      ElMessage.success('班级成员添加成功');
      if (currentClass.value?.id === payload.clazz_id) {
        await fetchById(payload.clazz_id);
      }
      await refresh();
    } catch (error: any) {
      ElMessage.error(error?.message || '班级成员添加失败');
      throw error;
    }
  };

  /**
   * 移除班级成员（基于swagger文档）
   * @param clazzId 班级ID
   * @param memberId 成员ID
   */
  const removeClazzMemberAction = async (clazzId: string, memberId: string) => {
    try {
      await removeClazzMember(clazzId, memberId);
      ElMessage.success('班级成员移除成功');
      if (currentClass.value?.id === clazzId) {
        await fetchById(clazzId);
      }
      await refresh();
    } catch (error: any) {
      ElMessage.error(error?.message || '班级成员移除失败');
      throw error;
    }
  };

  /**
   * 添加班级教师（基于swagger文档）
   * @param clazzId 班级ID
   * @param payload 添加班级教师请求参数
   */
  const addClazzTeachersAction = async (clazzId: string, payload: AddClazzTeachersRequest) => {
    try {
      console.log('添加班级教师:', { clazzId, payload });
      await addClazzTeachers(clazzId, payload);
      ElMessage.success('班级教师添加成功');
      if (currentClass.value?.id === clazzId) {
        await fetchById(clazzId);
      }
      await refresh();
    } catch (error: any) {
      console.error('添加班级教师失败:', error);
      console.error('错误详情:', error?.response?.data);
      const errorMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.message || '班级教师添加失败';
      // 统一使用 Warning 提示，避免红色报错
      ElMessage.warning(errorMsg);
      throw error;
    }
  };

  /**
   * 移除班级教师（基于swagger文档）
   * @param clazzId 班级ID
   * @param teacherId 教师ID
   */
  const removeClazzTeacherAction = async (clazzId: string, teacherId: string) => {
    loading.value = true;
    try {
      await removeClazzTeacher(clazzId, teacherId);
      ElMessage.success('班级教师移除成功');
      if (currentClass.value?.id === clazzId) {
        await fetchById(clazzId);
      }
      await refresh();
    } catch (error: any) {
      console.error('移除班级教师失败:', error);
      const errorMsg = error?.response?.data?.message || error?.response?.data?.msg || error?.message || '班级教师移除失败';
      if (error?.response?.status === 400 || error?.code === 400) {
        ElMessage.warning(errorMsg);
      } else {
        ElMessage.error(errorMsg);
      }
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 批量绑定教师到班级
   */
  const bindTeachers = async (clazzIds: string[], teacherId: string) => {
    loading.value = true;
    try {
      await bindTeachersToClasses({ clazz_ids: clazzIds, teacher_id: teacherId });
      ElMessage.success('批量绑定教师成功');
    } catch (error: any) {
      console.error('批量绑定教师失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

 /**
 * 获取学生的所有班级
 * @param studentId 学生ID
 */
const fetchStudentClasses = async (studentId: string) => {
  // 验证学生ID
  if (!studentId || studentId === 'string') {
    ElMessage.warning('学生ID无效');
    return [];
  }

  studentClassesLoading.value = true;
  try {
    console.log('调用 getStudentClasses，参数:', studentId);
    const data = await getStudentClasses(studentId);
    studentClasses.value = data || [];
    console.log('获取到的班级数据:', data);
    return data;
  } catch (error: any) {
    console.error('获取学生班级列表失败:', error);
    // 更详细的错误信息
    if (error?.code === 400) {
      ElMessage.error('参数错误：请检查学生ID格式');
    } else if (error?.code === 404) {
      ElMessage.error('接口不存在或学生未找到');
    } else {
      ElMessage.error(error?.message || '获取学生班级列表失败');
    }
    studentClasses.value = [];
    throw error;
  } finally {
    studentClassesLoading.value = false;
  }
};

  /**
   * 获取所有专业班级
   */
  const fetchMajorClasses = async () => {
    try {
      const response: any = await getMajorClasses();
      
      // 兼容直接返回数组或返回包含data字段的对象
      if (Array.isArray(response)) {
        majorClasses.value = response;
      } else if (response && Array.isArray(response.data)) {
        majorClasses.value = response.data;
      } else {
        majorClasses.value = [];
      }
      return majorClasses.value;
    } catch (error: any) {
      console.error('获取专业班级失败:', error);
      ElMessage.error(error?.message || '获取专业班级失败');
      throw error;
    }
  };

  /**
   * 关联专业班级到课程班级
   */
  const linkMajorClasses = async (clazzId: string, majorClassIds: string[]) => {
    try {
      await addMajorClassesToClass(clazzId, { major_class_ids: majorClassIds });
      ElMessage.success('关联专业班级成功');
      if (currentClass.value?.id === clazzId) {
        await fetchById(clazzId);
        // 乐观更新：合并新关联的 ID，确保界面立即刷新（应对 GET 可能未及时返回最新数据）
        const existing = ((currentClass.value as any)?.major_class_ids || []) as string[];
        const merged = [...new Set([...existing, ...majorClassIds])];
        currentClass.value = { ...currentClass.value, major_class_ids: merged } as ClassItem;
      }
      await refresh();
    } catch (error: any) {
      console.error('关联专业班级失败:', error);
      ElMessage.error(error?.message || '关联专业班级失败');
      throw error;
    }
  };

  /**
   * 移除专业班级关联
   */
  const unlinkMajorClasses = async (clazzId: string, majorClassIds: string[]) => {
    try {
      // 保存当前关联列表，用于乐观更新
      const existingIds = (currentClass.value?.id === clazzId
        ? ((currentClass.value as any)?.major_class_ids || []) as string[]
        : []);
      const toRemove = new Set(majorClassIds);

      await removeMajorClassFromClass(clazzId, { major_class_ids: majorClassIds });
      ElMessage.success('移除专业班级关联成功');
      if (currentClass.value?.id === clazzId) {
        await fetchById(clazzId);
        // 乐观更新：从本地状态中移除，确保界面立即刷新
        const newIds = existingIds.filter((id) => !toRemove.has(id));
        currentClass.value = { ...currentClass.value, major_class_ids: newIds } as ClassItem;
      }
      await refresh();
    } catch (error: any) {
       console.error('移除专业班级关联失败:', error);
       ElMessage.error(error?.message || '移除专业班级关联失败');
       throw error;
    }
  };

  /**
   * 从班级移除学生（新接口）
   */
  const removeStudentFromClassAction = async (clazzId: string, studentId: string, courseId: string) => {
    try {
      await removeStudentFromClass(clazzId, studentId, courseId);
    } catch (error: any) {
      console.error(`移除学生 ${studentId} 失败:`, error);
      throw error;
    }
  };

  /**
   * 重置状态
   */
  const reset = () => {
    rawClasses.value = [];
    list.value = [];
    currentClass.value = null;
    total.value = 0;
    page.value = 1;
    pageSize.value = 10;
    totalPage.value = 0;
    lastQuery.value = {};
    members.value = [];
    memberTotal.value = 0;
    memberPage.value = 1;
    memberPageSize.value = 10;
    qrCode.value = '';
    inviteCode.value = '';
  };

  return {
    // 状态
    courseId,
    rawClasses,
    list,
    currentClass,
    loading,
    total,
    page,
    pageSize,
    totalPage,
    lastQuery,
    members,
    memberTotal,
    memberPage,
    memberPageSize,
    memberLoading,
    qrCode,
    inviteCode,
    qrCodeLoading,
    studentClasses,
    studentClassesLoading,
    majorClasses,

    // 计算属性
    totalClasses,

    // 操作
    setCourseId,
    fetchList,
    fetchById,
    fetchMajorClasses,
    create,
    update,
    remove,
    addStudents,
    removeStudent,
    addSingleStudent,
    removeStudentByRequest,
    linkMajorClasses,
    unlinkMajorClasses,
    removeStudentFromClassAction,
    fetchMembers,
    fetchQRCode,

    refreshQRCode,
    addClazzMemberAction,
    removeClazzMemberAction,
    addClazzTeachersAction,
    removeClazzTeacherAction,
    bindTeachers,
    fetchStudentClasses,
    refresh,
    reset,
  };
});
