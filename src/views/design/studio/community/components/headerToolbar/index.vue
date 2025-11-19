<template>
  <div class="datavis-editor-header-toolbar">
    <div class="toolbar-left">
      <topAction class="back-action" @click="handleExternal(pageOperationTypes.back)">
        <visui-icon name="vis-fanhui" :size="20"></visui-icon>
      </topAction>

      <input class="hover-active-input" disabled type="text" v-model="name" placeholder="返回" />
      <!-- <topAction @click="showDialog(componentBarRef)" title="组件" :class="{ active: componentBarRef === temporaryRef }">
        <visui-icon name="vis-zujian1" :size="18"></visui-icon>
      </topAction> -->
      <topAction @dragstart="aaaaaa1($event)" @dragend="handleDragEnd($event)" draggable="true" title="添加设备"
        :class="{ active: componentBarRef === temporaryRef }">
        <visui-icon name="vis-zujian1" :size="18"></visui-icon>
      </topAction>
    </div>
    <div class="toolbar-center">
      <topAction @click="handleEditorCoreAction(operationTypes.undo)" title="后退"
        :class="{ disabled: !editorState.canUndo }">
        <visui-icon name="vis-houtui" :size="18"></visui-icon>
      </topAction>

      <topAction @click="handleEditorCoreAction(operationTypes.redo)" title="前进"
        :class="{ disabled: !editorState.canRedo }">
        <visui-icon name="vis-qianjin" :size="18"></visui-icon>
      </topAction>

      <topAction title="控制面板" class="panel-wrap" overClass="vis-icon-wrap no-hover">
        <visui-icon class="icon" :class="{ active: panelVisible.left }" name="vis-kongzhizuo"
          @click="togglePanelVisible('left')"></visui-icon>
        <visui-icon class="icon" :class="{ active: panelVisible.right }" name="vis-kongzhiyouce"
          @click="togglePanelVisible('right')"></visui-icon>
      </topAction>
    </div>

    <div class="toolbar-right">
      <topAction @click="exportByCategory" title="分类报价单">
        <visui-icon name="vis-yulan" :size="18"></visui-icon>
      </topAction>
      <topAction @click="exportFun" title="报价单">
        <visui-icon name="vis-yulan" :size="18"></visui-icon>
      </topAction>
      <topAction @click="handleExternal(pageOperationTypes.save)" title="保存项目">
        <visui-icon name="vis-baocun" :size="18"></visui-icon>
      </topAction>
    </div>

    <el-dialog v-model="dialogTableVisible" :show-close="false" :close-on-click-modal="false" append-to-body
      title="请选择设备" width="80%">
      <el-tabs v-model="activeName" type="card" class="demo-tabs" @tab-change="handleChange">
        <el-tab-pane label="公司产品" name="first"></el-tab-pane>
        <el-tab-pane label="平台产品" name="second"></el-tab-pane>
      </el-tabs>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="所属品类" prop="categoryId">
          <el-tree-select filterable v-model="queryParams.categoryId" :data="enabledCategoryOptions"
            style="width: 200px;" :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
            value-key="categoryId" placeholder="请选择所属品类" check-strictly />
        </el-form-item>
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="queryParams.name" placeholder="请输入产品名称" clearable style="width: 240px"
            @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="所属品牌" prop="brand">
          <el-select v-model="queryParams.brand" placeholder="请选择" style="width: 240px" filterable>
            <el-option v-for="dict in sys_brand_name" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>


      <el-table :data="productList" v-loading="loading" height="500" border @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="50" align="center" /> -->
        <el-table-column width="55">
          <template #default="{ row }">
            <el-radio v-model="selectedRow" :label="row">&nbsp;</el-radio>
            <!-- 注意：&nbsp;是为了让单选框和文字对齐，这里没有文字，所以用来占位 -->
          </template>
        </el-table-column>
        <el-table-column label="产品名称" align="center" key="name" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="图标" align="center" key="iconUrl" width="120">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-image style="width: 100px; height: 100px;border-radius: 10px;"
                :src="baseUrl + scope.row.iconUrl"></el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="所属品类" align="center" key="categoryName" prop="categoryName"
          :show-overflow-tooltip="true" />
        <el-table-column label="品牌名称" align="center" key="brand" prop="brand" :show-overflow-tooltip="true" />
        <el-table-column label="价格" align="center" key="price" prop="price" :show-overflow-tooltip="true" />
        <el-table-column label="介绍" align="center" key="introduction" prop="introduction" width="120"
          :show-overflow-tooltip="true" />
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="getList" />
      <template #footer>
        <div class="dialog-footer" style="display: flex;justify-content: center;">
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 组件 -->
    <component-bar ref="componentBarRef" @finish="handleFinishDialog(componentBarRef)"></component-bar>
    <!-- 系统素材 -->
    <system-resource-dialog ref="systemResourceDialogRef"
      @finish="handleFinishDialog(systemResourceDialogRef)"></system-resource-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, toRefs, toRef, watch, onMounted, onBeforeUnmount } from 'vue'
import { operationTypes, pageOperationTypes, eventTypes } from '../../utils/index'
import type { EditorState } from '../../types/index'

import { listCategory } from "@/api/system/category"
import { companyProducts_list, platformProducts_list } from "@/api/productManagement"

import topAction from './component/action.vue'
import emitter from '../../../../../../utils/eventBus'


const componentName = 'headerToolbar'
defineOptions({ name: componentName })
import useEditor from '../../hooks/useEditor'
const { editor } = useEditor()

const name = defineModel<string>('name')
defineProps({
  customThemeList: {
    type: Array,
    default: () => []
  }
})
const editorState = ref<EditorState>({
  canRedo: false,
  canUndo: false,
  selectedCount: 0,
  isGroup: false,
  isActiveSelection: false,
  activeObject: null
})
const loading = ref(true)
const total = ref(0)
const selectedRow = ref(null);

const emit = defineEmits(['command'])
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    brand: undefined,
    categoryId: undefined
  }
})

import { useRoute } from 'vue-router'

const route = useRoute()

const activeName = ref('first')
const { proxy } = getCurrentInstance()
const { sys_brand_name } = proxy.useDict("sys_brand_name")
const baseUrl = ref(import.meta.env.VITE_APP_VIEW_IMG_URL) // 图片预览地址
const dialogTableVisible = ref(false)
const productList = ref([])
const enabledCategoryOptions = ref([])

watch(selectedRow, (newRow, oldRow) => {
  if (newRow) {
    console.log('选中了新产品:', newRow);
    // 在这里执行你的逻辑，比如获取详情等
  }
});

const handleChange = (tab: TabsPaneContext, event: Event) => {
  getList()
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 查询产品列表 */
function getList() {
  loading.value = true
  if (activeName.value === 'first') {
    console.log('公司产品');

    // 公司产品
    companyProducts_list(queryParams.value).then(res => {
      loading.value = false
      productList.value = res.rows
      total.value = res.total
    })
  } else if (activeName.value === 'second') {
    console.log('平台产品');
    // 平台产品
    platformProducts_list(queryParams.value).then(res => {
      loading.value = false
      productList.value = res.rows
      total.value = res.total
    })

  }


}


/** 提交按钮 */
function submitForm() {
  if (selectedRow.value) {
    emitter.emit('siblingEvent', selectedRow.value)
    dialogTableVisible.value = false
  } else {
    proxy.$modal.msgError("请选择选择产品")
  }
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  queryParams.value.categoryId = undefined
  queryParams.value.pageNum = 1
  getList()
}


const componentBarRef = ref() // 组件弹窗
const systemResourceDialogRef = ref() // 系统资源弹窗
const temporaryRef = ref() // 中间变量

// 打开某个弹窗，并关闭其余的弹窗
const showDialog = (valRef: any) => {
  const arr = [componentBarRef.value, systemResourceDialogRef.value]
  arr.forEach((item: any) => {
    if (valRef === item) {
      if (temporaryRef.value === valRef) {
        item.handleCloseDialog()
        temporaryRef.value = null
      } else {
        item.handleOpenDialog()
        temporaryRef.value = valRef
      }
    } else {
      item.handleCloseDialog()
    }
  })
}

const handleFinishDialog = (valRef: any) => {
  valRef.handleCloseDialog()
  temporaryRef.value = null
}

// 向编辑器核心请求执行
const handleEditorCoreAction = (action: operationTypes) => {
  editor.fire(eventTypes.coreOperation, { action })
}


function getDeptTree() {
  listCategory().then(response => {
    let data = response.data
    enabledCategoryOptions.value = []
    enabledCategoryOptions.value = proxy.handleTree(data, "categoryId")

  })
}

// 向编辑器核心请求执行
// 拖拽
const aaaaaa1 = (e: DragEvent, row: any) => {
  let data1 = {
    "name": "customWidgetImage",
    "title": "设备234",
    "url": "/resource/componentConfig/source1.jpeg",
    "isAuth": true,
    deviceData: {
      name: '测试设备',
      type: 1,
      price: 1000
    }
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
const handleDragEnd = (e: DragEvent) => {
  getList()
  dialogTableVisible.value = true
}

// 单击 组件添加
const aaaaaa = (row: any) => {
  let data1 = {
    "name": "customWidgetImage",
    "title": "双折线图",
    "url": "/static/datavis/img/component/charts/visWidgetChartline11.png",
    "isAuth": true
  }
  // 无权限
  if (!data1.isAuth) return
  const data = {
    type: 'addComponent',
    params: {
      name: data1.name,
      title: data1.title,
      url: data1.url
    },
    clearDropPosition: true
  }
  editor.fire(eventTypes.pageOperation, { type: pageOperationTypes.objectAdd, data, source: componentName })
}


// 左右面板显示控制
const panelVisible = ref({
  left: true,
  right: true
})

const togglePanelVisible = (type: 'left' | 'right') => {
  if (type === 'left') {
    panelVisible.value.left = !panelVisible.value.left
  } else {
    panelVisible.value.right = !panelVisible.value.right
  }
  const { left, right } = panelVisible.value
  editor.fire(eventTypes.pageOperation, { type: pageOperationTypes.layoutChange, data: { left, right }, source: componentName })
}

/**
 * 向外抛出事件
 */
const handleExternal = (event: string) => {
  editor.fire(eventTypes.pageOperation, { type: event, source: componentName })
}

const exportByCategory = () => {
  editor.fire(eventTypes.pageOperation, { type: pageOperationTypes.save, source: componentName })
  setTimeout(() => {
    proxy.download("/projectManagement/exportByCategory?projectsIds=" + route.query.id, {
    }, `项目分类报价单_${new Date().getTime()}.xlsx`)
  }, 1000);

}

const exportFun = () => {
  editor.fire(eventTypes.pageOperation, { type: pageOperationTypes.save, source: componentName })
  setTimeout(() => {
    proxy.download("/projectManagement/export?projectsIds=" + route.query.id, {
    }, `项目报价单_${new Date().getTime()}.xlsx`)
  }, 1000);

}


const handleEditorStateUpdate = (state: EditorState) => {
  Object.assign(editorState.value, state)
}

const handleEvents = ({ isDispose = false }) => {
  const key = isDispose ? 'off' : 'on'
  editor[key](eventTypes.editorStateUpdated, handleEditorStateUpdate)
}
const { queryParams } = toRefs(data)
onMounted(() => {
  getDeptTree()
  handleEvents({ isDispose: false })
})
onBeforeUnmount(() => {
  handleEvents({ isDispose: false })
})
</script>
