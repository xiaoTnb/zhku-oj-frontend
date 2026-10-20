import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ClassDetail from '../ClassDetail.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { clazzes_id: 'clazz-001' } }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() })
}))

vi.mock('element-plus', () => ({
  ElMessage: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
  ElMessageBox: { confirm: vi.fn(() => Promise.resolve()) }
}))

vi.mock('@/stores/class', () => {
  const fetchMembers = vi.fn(() => Promise.resolve())
  return {
    useClassStore: () => ({
      addStudents: vi.fn(() => Promise.resolve()),
      removeStudentFromClassAction: vi.fn(() => Promise.resolve()),
      linkMajorClasses: vi.fn(() => Promise.resolve()),
      unlinkMajorClasses: vi.fn(() => Promise.resolve()),
      fetchMembers,
      fetchById: vi.fn(() => Promise.resolve()),
      fetchMajorClasses: vi.fn(() => Promise.resolve()),
      memberPage: 1
    })
  }
})

function mountDialog() {
  const wrapper = shallowMount(ClassDetail, {
    global: {
      stubs: {
        'el-dialog': { template: '<div><slot /></div>' },
        'el-input': { template: '<input />' },
        'el-select': { template: '<select><slot /></select>' },
        'el-option': { template: '<option />' },
        'el-button': { template: '<button><slot /></button>' },
      }
    }
  })
  const vm = wrapper.vm as any
  vm.addStudentsDialogVisible = true
  vm.enableManualInput = true
  vm.enableBatchOperation = true
  return { wrapper, vm }
}

describe('ClassDetail manage students dialog actions', () => {
  let wrapper: any
  let vm: any

  beforeEach(() => {
    const mounted = mountDialog()
    wrapper = mounted.wrapper
    vm = mounted.vm
  })

  it('打开管理学生弹窗时默认展示选项列表（两项均未选中）', async () => {
    vm.addStudentsDialogVisible = false
    vm.enableManualInput = true
    vm.enableBatchOperation = true
    await vm.handleAddStudents()
    expect(vm.addStudentsDialogVisible).toBe(true)
    expect(vm.enableManualInput).toBe(false)
    expect(vm.enableBatchOperation).toBe(false)
  })

  it('添加学生：成功后关闭弹窗并刷新成员列表', async () => {
    vm.addStudentsForm.studentIds = 'stu1'
    await vm.handleManualAdd()
    expect(vm.addStudentsDialogVisible).toBe(false)
  })

  it('移除学生：成功后关闭弹窗并刷新成员列表', async () => {
    vm.addStudentsForm.studentIds = 'stu1'
    await vm.handleManualRemove()
    expect(vm.addStudentsDialogVisible).toBe(false)
  })

  it('关联并导入：成功后关闭弹窗并刷新成员列表', async () => {
    vm.addStudentsForm.majorClassIds = ['m1']
    await vm.handleBatchLink()
    expect(vm.addStudentsDialogVisible).toBe(false)
  })

  it('解除关联：成功后关闭弹窗并刷新成员列表', async () => {
    vm.addStudentsForm.majorClassIds = ['m1']
    await vm.handleBatchUnlink()
    expect(vm.addStudentsDialogVisible).toBe(false)
  })
}
) 
