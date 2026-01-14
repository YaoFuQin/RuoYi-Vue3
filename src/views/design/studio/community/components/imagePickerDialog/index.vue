<template>
  <el-dialog title="图片选择" width="890px" style="opacity: 0" :modal="false" class="datavis-image-picker-dialog"
    :close-on-click-modal="false" v-model="state.visible">
    <div class="datavis-image-picker-dialog-body">
      <div class="left-sidebar">
        <el-button @click="handleOpenGallyCate"><i class="iconfont-bi icon-bi-jia"></i>新增分类</el-button>
        <div class="scrollbar-wrap">
          <el-scrollbar ref="scrollbarRef">
            <el-tree highlight-current ref="treeRef" node-key="id" :data="state.classData"
              :current-node-key="state.classActive" :props="{ children: 'folders', label: 'name' }"
              @node-click="handleChangeClass">
            </el-tree>
          </el-scrollbar>
        </div>
      </div>
      <div class="right-content">
        <div class="action-wrap">
          <el-button type="primary" @click="handleOpenUpload">上传素材</el-button>
        </div>
        <div class="scrollbar-wrap">
          <el-scrollbar>
            <div class="flex-layout-container">
              <div class="flex-item" v-for="(item, index) in state.listData" :key="index"
                @click="handleSelectImage(item)" :title="item.name">
                <img :src="datavisApi.fileService + (item.thumbnail || item.url)"
                  onerror="onerror=null;src='/static/datavis/img/error-img.png'" />
              </div>
            </div>
            <div class="flex-item-empty" v-if="!state.loading && !state.listData.length">
              <img class="empty_data_img" :src="editorEmptyImgUrl" />
              <span class="upload_btn" @click="handleOpenUpload">点击上传素材～</span>
              <span class="upload_tip">仅支持png、jpeg、jpg、svg格式文件上传，支持批量上传</span>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <!-- 新增分类 -->
    <itemFolder ref="itemFolderRef" @finish="handleFinishFolder"></itemFolder>
    <!-- 上传素材 -->
    <itemUpload ref="itemUploadRef" @finish="handleFinishUpload"></itemUpload>



    <input type="file" ref="uploadRef" @change="handleFileChange" id="fileInput" class="hidden"
      accept="image/jpeg,image/jpg,image/png,image/gif">



    <!-- <el-upload ref="uploadRef" action="/api/upload" :auto-upload="false" :show-file-list="true"
      :on-change="handleFileChange">
      <template #trigger>
        <el-button type="primary" style="display: none">
          选择文件
        </el-button>
      </template>

<div class="upload-tip">
  <p>弹窗打开后将自动弹出文件选择框</p>
  <p>选择文件后点击下方上传按钮</p>
</div>

<el-button type="success" @click="submitUpload" :disabled="!fileList.length">
  上传文件
</el-button>
</el-upload> -->

    <!-- <ImageUpload ref="inputImgRef" :isShowTip="true" :limit="1" v-model="state.iconUrl"></ImageUpload> -->

  </el-dialog>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'imagePickerDialog'
})
import { ref, reactive, nextTick, watch } from 'vue'
import datavisApi from '@/api/datavisApi'
import { editorEmptyImgUrl, getObjFromTreeData, getScrollTreeState, setScrollTreeState } from '../../utils'
import itemFolder from './component/folder.vue'
import itemUpload from './component/upload.vue'
import { getToken } from "@/utils/auth"
const { proxy } = getCurrentInstance()

const uploadRef = ref()
const selectedFile = ref(null)
const baseUrl = import.meta.env.VITE_APP_BASE_API
const imageBaseUrl = import.meta.env.VITE_APP_VIEW_IMG_URL

const isProductImg = ref('')


const emit = defineEmits(['finish'])
const state = reactive({
  iconUrl: '',
  config: {
    title: '素材-图片',
    type: '310',
    configType: 'image',
    fileType: 'image/*', //文件类型
    folder: 'datavis/image/' //文件路径
  },
  visible: false,
  loading: false,
  classActive: null,
  classRow: null as any,
  classData: [] as any,
  query: {
    name: ''
  },
  listData: [] as any,
  callbackFun: null as any, // 选择完图片后回调函数
  treeState: null as any
})

const handleOpenDialog = (callback: Function, source: any) => {
  console.log(source, '111122');
  isProductImg.value = source
  state.callbackFun = callback
  state.visible = true
  initGetClassData()
}
const handleCloseDialog = () => {
  state.visible = false
}

const initClassData = (_data: any, source: any) => {
  if (source && source === 'systemResourceDialog' && state.visible) {
    initGetClassData()
  }
}

defineExpose({
  handleOpenDialog,
  handleCloseDialog,
  initClassData
})

// 根据parent_id获取文件夹列表和文件列表
const getWholeFolders = async ({ type }: any) => {
  const params = { type, sortBy: 'sort', sortOrder: 'desc' }
  const [err, res] = await datavisApi.folders.wholeTree(params)
  if (err) return []
  return res
}

const scrollbarRef = ref()
const treeRef = ref()
// 分类
const initGetClassData = async () => {
  const res = await getWholeFolders({ type: state.config.type })
  if (!state.treeState) {
    state.treeState = { scrollTop: 0, expandedKeys: res.map((a: any) => a.id) }
  } else {
    state.treeState = getScrollTreeState(treeRef, scrollbarRef)
  }
  state.classData = res
  let obj = getObjFromTreeData(res, 'folders', (item: any) => item.id === state.classActive) || res[0]
  if (obj) {
    handleChangeClass(obj)
  }
  nextTick(() => {
    setScrollTreeState(treeRef, scrollbarRef, state.treeState)
    treeRef.value.setCurrentKey(state.classActive)
  })
}
const handleChangeClass = (row: any) => {
  state.classActive = row.id
  state.classRow = row
  initGetListData()
}

// 列表
const initGetListData = async () => {
  const params = { parent_id: state.classActive, sortBy: 'sort', sortOrder: 'desc' }
  const [err, res] = await datavisApi.resource.list(params)
  const data = err ? [] : res || []
  state.listData = data
}

// 设置图片
const handleSelectImage = (row: any) => {
  handleCloseDialog()
  const url = datavisApi.fileService + row.url
  state.callbackFun && state.callbackFun({ url })
}

// 添加分类
const itemFolderRef = ref()
// 打开分类
const handleOpenGallyCate = (type: any, row?: any) => {
  let title = '新建分类'
  let form = {
    id: '',
    name: '',
    type: state.config.type,
    parent_id: ''
  }
  if (type === 'edit') {
    title = '编辑分类'
    form = Object.assign({}, row)
  }
  const data = {
    title,
    form,
    parentFlag: true,
    classData: state.classData
  }
  itemFolderRef.value.handleOpenDialog(data)
}
// 保存分类
const handleFinishFolder = () => {
  // 关闭弹窗
  itemFolderRef.value.handleCloseDialog()
}

//上传
const itemUploadRef = ref<any>()
const handleOpenUpload = () => {
  console.log('state.classRow', state)
  state.callbackFun && state.callbackFun({ url: 'https://www.bing.com/th?id=OHR.AloeDichotoma_ZH-CN4432972312_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp&w=360&h=202' })
  state.visible = false

  // const data = {
  //   folder: state.config.folder + state.classRow.url,
  //   form: {
  //     id: '',
  //     name: '',
  //     url: '',
  //     image: '',
  //     parent_id: state.classRow.id,
  //     type: state.config.type,
  //     sort: 0
  //   }
  // }
  // itemUploadRef.value.handleOpenDialog(data)
}

watch(() => state.visible, val => {
  if (val) {
    setTimeout(() => {
      uploadRef.value.click()
    }, 200)
  }
}, { deep: true, immediate: true })

// 处理上传
const handleUpload = () => {
  if (!selectedFile.value) {
    // ElMessage.warning('请先选择文件')
    return
  }

  // 这里添加实际的上传逻辑
  // ElMessage.success('文件上传成功！')
  // console.log('上传文件:', selectedFile.value)

  // 上传完成后关闭对话框
  // handleClose()
}



/**
 * 获取图片宽高（通过 File 对象，如上传图片）
 * @param file File 实例
 */
function getImageSizeFromFile(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target?.result as string

      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }

      img.onerror = () => {
        reject(new Error('图片加载失败（File）'))
      }
    }

    reader.onerror = () => {
      reject(new Error('读取文件失败'))
    }

    reader.readAsDataURL(file)
  })
}

// 处理文件选择变化
const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  selectedFile.value = file

  // const size = await getImageSizeFromFile(file)

  uploadImage(file)
  // 生成预览
  const reader = new FileReader()
  reader.onload = (e) => {
    // previewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const uploadImage = async (file) => {
  try {
    // 创建FormData
    const formData = new FormData();
    formData.append('file', file);
    // formData.append('timestamp', Date.now());

    // 发送请求
    const response = await fetch(baseUrl + (isProductImg.value == 'datavisSettingBarBackground' ? '/common/uploadNoCompress' : '/common/upload'), {
      method: 'POST',
      headers: {
        // ...this.options.headers
        Authorization: "Bearer " + getToken()
      },
      body: formData
    })
    const result = await response.json();
    if (response.ok && result.code === 200) {
      state.callbackFun && state.callbackFun({ url: imageBaseUrl + result.fileName })
      state.visible = false
    } else {
      state.visible = false
      proxy.$modal.msgError(result.msg || '上传失败')
    }
  } catch (err) {
    proxy.$modal.msgError(err || '上传失败')
    state.visible = false
  }
}

const handleFinishUpload = async () => {
  initGetListData()
  emit('finish', { type: 'uploaded', data: state.classRow })
}
</script>
