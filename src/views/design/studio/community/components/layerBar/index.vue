<template>
  <div class="datavis-layer-bar--wrap">
    <div class="datavis-layer-bar--header">
      <div class="title">产品</div>
      <div class="action">
        <visui-icon class="search-icon" name="ele-search" @click="handleOpen"></visui-icon>
        <div class="search-input" :class="{ 'is-active': state.visible }">
          <el-input placeholder="请输入关键词" v-model="queryParams.name" clearable @input="handleSearch" @blur="">
            <template #prefix>
              <visui-icon name="ele-search" :size="18"></visui-icon>
            </template>
          </el-input>
          <visui-icon class="close-icon" name="ele-close" :size="24" @click="handleClose"></visui-icon>
        </div>
      </div>
    </div>

    <div class="datavis-layer-bar--content">
      <div class="scrollbar-wrap">
        <el-scrollbar style="height: 100vh;padding: 10px 10px;padding-bottom: 30px;">
          <div class="list" ref="listRef">
            <div class="list-item" :draggable="true"
              style="height: 50px;display: flex;align-items: center;border-bottom: 1px #d1d5db1c solid;padding: 8px 10px;margin: 10px 0;"
              v-for="item in productList" :key="item.id" @dragstart="handleDragStart($event, item)"
              @dragend="handleDragEnd($event, item)">
              <div class="item-image-box" style="margin-right: 10px;">
                <el-image :src="baseUrl + item.iconUrl" class="item-image" fit="contain" lazy
                  style="width: 50px;height: 50px;">
                  <template #error>
                    图片加载失败
                    <!-- <img :src="errorImgUrl" alt="" /> -->
                  </template>
                </el-image>
              </div>

              <el-text truncated>
                {{ item.name }}
              </el-text>
              <!-- <span class=" item-text"
                style="font-size: 14px;margin-left: 6px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;"
                :title="item.name">
                {{ item.name }}</span> -->
            </div>
          </div>
          <!-- <div class="dw-empty" v-if="!state.loadingText && !state.dataList.length">暂无数据</div> -->
        </el-scrollbar>
      </div>

      <!-- <layer-tree ref="layerTreeRef" :data="state.layerList" :componentsImgMap="state.componentsImgMap"
        :activeIdList="activeIdList" :expandKeyList="expandKeyList"></layer-tree> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, toRefs, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import layerTree from './component/tree.vue'
import layerAction from './component/action.vue'
import layerDivider from './component/divider.vue'
import { eventTypes } from '../../utils/index'
import { EditorState } from '../../types'
import { debounce, cloneDeep } from 'lodash-es'
import { companyProducts_list } from "@/api/productManagement"

import emitter from '../../../../../../utils/eventBus'


import useEditor from '../../hooks/useEditor'
const { editor } = useEditor()
defineOptions({ name: 'datavisLayerBar' })

const baseUrl = ref(import.meta.env.VITE_APP_VIEW_IMG_URL) // 图片预览地址
const productList = ref([])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 1000,
    name: undefined,
    brand: undefined,
    categoryId: undefined
  }
})
// 数据转换
const stringifyArray = (arr: any) => {
  arr = arr || []
  const newArr: any = []
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    const { id, name, type, visible, locked, component } = item
    const obj = {
      id,
      name,
      type,
      visible,
      locked,
      component: cloneDeep(component)
    }
    if (item.objects) {
      Reflect.set(obj, 'objects', stringifyArray(item.objects))
    }
    newArr.push(obj)
  }
  return newArr
}

const state = reactive({
  originList: [],
  layerList: [],
  rightMenuShow: true,
  isWorkspace: false,
  selectFlag: true,
  multipleFlag: false,
  groupFlag: false,
  lockFlag: true,
  visible: false,
  componentsImgMap: {} as any
})

const editorState = ref<EditorState>({
  canRedo: false,
  canUndo: false,
  selectedCount: 0,
  isGroup: false,
  isActiveSelection: false,
  activeObject: null
})
const expandKeyList: any = ref([])
const canMoveUp = computed(() => {
  const { selectedCount, index = 0, sameLevelCount = 0 } = editorState.value
  return selectedCount === 1 && index < sameLevelCount - 1
})

const canMoveDown = computed(() => {
  const { selectedCount, index = 0, sameLevelCount = 0 } = editorState.value
  return selectedCount === 1 && index < sameLevelCount && index > 0
})

/** 查询产品列表 */
function getList() {
  // 公司产品
  companyProducts_list(queryParams.value).then(res => {
    productList.value = res.rows
  })
}


// 获取对象的所有父级id列表
const getParentIdList = (arr: any) => {
  const parentIdObj: any = {}
  const recursion = (item: any) => {
    if (item && item.group) {
      parentIdObj[item.group.id] = 1
      recursion(item.group)
    }
  }
  arr = arr || []
  arr.forEach((item: any) => {
    recursion(item)
  })
  return Object.keys(parentIdObj)
}

const activeIdList = computed(() => {
  const { activeObject } = editorState.value
  let idList: any = []
  let parentIdList: any = []
  // 在计算属性中混入节点展开的逻辑，确保节点始终可见，而不是收起
  if (activeObject) {
    if (activeObject.type === 'activeSelection') {
      idList = activeObject.objects.map((a: any) => a.id)
      parentIdList = getParentIdList(activeObject.objects)
    } else {
      idList = [activeObject.id]
      parentIdList = getParentIdList([activeObject])
    }
  }
  const toAppendIdList = parentIdList.filter((a: any) => !expandKeyList.value.includes(a))
  if (toAppendIdList.length) {
    expandKeyList.value.push(...toAppendIdList)
  }
  return idList
})

// 关键词
const keyWord = ref('')
watch(
  () => keyWord,
  () => {
    handleSearch(keyWord.value)
  },
  { deep: true }
)
// 搜索
const handleSearch = debounce(val => {
  getList()
  // if (val) {
  //   function filterData(data: any, keyword: any) {
  //     function recursiveFilter(nodes: any) {
  //       return nodes.reduce((acc: any, node: any) => {
  //         const matches = node.name.includes(keyword) || node.id.includes(keyword)
  //         const filteredChildren = recursiveFilter(node.objects || [])
  //         if (matches || filteredChildren.length > 0) {
  //           acc.push({
  //             ...node,
  //             objects: filteredChildren
  //           })
  //         }
  //         return acc
  //       }, [])
  //     }
  //     return recursiveFilter(data)
  //   }
  //   // 使用示例
  //   const result = filterData(state.originList, keyWord.value)
  //   state.layerList = result
  // } else {
  //   state.layerList = state.originList
  // }
})
// 拖拽
const handleDragStart = (e: DragEvent, row: any) => {
  let data1 = {
    "name": "customWidgetImage",
    "title": "设备",
    "url": "/resource/componentConfig/source1.jpeg",
    "isAuth": true
  }
  const data = {
    type: 'addComponent',
    params: data1
  }
  const content = JSON.stringify(data)
  if (e.dataTransfer) {
    e.dataTransfer.setData('datavisData', content)
  }
}
const handleDragEnd = (e: DragEvent, row: any) => {
  emitter.emit('siblingEvent', row)
}
// 展示搜索弹窗
const handleOpen = () => {
  state.visible = true
}
const handleClose = () => {
  state.visible = false
}

const handleCommand = (flag: boolean, action: any, param = '') => {
  if (!flag) {
    return
  }
  const params = {
    action,
    param
  }
  editor.fire(eventTypes.coreOperation, params)
}
const recursionHanldeData = (arr: any = [], level = 1, parentId = '') => {
  arr = arr || []
  arr.reverse() // 反转一下数组
  arr.forEach((item: any) => {
    item.level = level
    item.parentId = parentId
    recursionHanldeData(item.objects, level + 1, item.id)
  })
  return arr
}
const handleLayerChanged = (data: any) => {
  const list = stringifyArray(data)
  state.originList = recursionHanldeData(list)
  handleSearch(keyWord.value)
}
const handleEditorStateUpdated = (e: any) => {
  editorState.value = e
}

const layerTreeRef = ref()

const handleComponentsImgFetched = (e: any) => {
  state.componentsImgMap = e
}

const handleEvents = ({ isDispose = false }) => {
  const key = isDispose ? 'off' : 'on'
  editor[key](eventTypes.layerChange, handleLayerChanged)
  editor[key](eventTypes.editorStateUpdated, handleEditorStateUpdated)
  editor[key](eventTypes.componentsImgFetched, handleComponentsImgFetched)
}

onMounted(() => {
  handleEvents({ isDispose: false })
  getList()
})
onBeforeUnmount(() => {
  handleEvents({ isDispose: true })
})

const { queryParams } = toRefs(data)

</script>
