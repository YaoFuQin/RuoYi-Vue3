<template>
  <div style="height: 92vh;" class="datavis-layout-wrapper datavis-theme-dark" v-loading="!!state.loadingText"
    :element-loading-text="state.loadingText">
    <visui-provider popupEl=".datavis-theme-dark">
      <!-- 编辑器 -->
      <datavis-editor ref="datavisEditorRef" v-model:name="state.pageObject.name" :isModule="isModule"
        :pageInfo="pageInfo" :customThemeList="state.customThemeList" @command="handleCommand"
        @ready="handleEditorReady">
        <template #header="scope">
          <headerToolbar v-if="scope.isReady" v-model:name="projectName" :customThemeList="state.customThemeList">
          </headerToolbar>
        </template>
        <template #left="scope">
          <datavis-layer-bar v-if="scope.isReady"></datavis-layer-bar>
        </template>
        <template #setting>
          <datavis-setting-bar :isModule="isModule"></datavis-setting-bar>
        </template>
        <template #contextmenu="scope">
          <datavis-contextmenu-bar v-if="scope.isReady"></datavis-contextmenu-bar>
        </template>
      </datavis-editor>
      <!-- 返回 -->
      <back-dialog ref="backDialogRef" @finish="handleFinishBack"></back-dialog>
      <!-- 搜索图层/组件 -->
      <search-dialog ref="searchDialogRef" @command="handleSearchCommand"></search-dialog>
      <image-picker-dialog ref="imagePickerDialogRef" @finish="handleFinishImagePickerDialog"></image-picker-dialog>
    </visui-provider>
  </div>
</template>
<script lang="ts" setup>
// 依赖
import { ref, onMounted, onBeforeUnmount, reactive, computed, watch } from 'vue'
import * as localforage from 'localforage'
import { draftStroageKey, previewStroageKey, getImageSize, useMessage, base64ToFile, pageOperationTypes, eventTypes } from './utils/index'
import { projectManagement_detils, updateProjectManagement } from "@/api/projectManagement"

import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
// @ts-ignore
import dayjs from 'dayjs'
import datavisApi from '@/api/datavisApi.ts'
import { pick, omit } from 'lodash-es'

import emitter from '@/utils/eventBus'


const componentName = 'datavisFrame'
defineOptions({
  name: componentName
})

const queryData = reactive({
  screenType: 'market', // 页面类型，screen：大屏，component：模块 , market:模板
  id: '4e197732fe4a4d60a9273dd018fb5b38'

})


const router = useRouter()
const route = useRoute()
const dataPreviewDialogRef = ref()
const imagePickerDialogRef = ref()
const projectName = ref('')
const imgurl = ref('')

const state = reactive({
  screenType: 'screen', // 页面类型，screen：大屏，component：模块 , market:模板
  pageObject: {} as any, // 页面对象
  loadingText: '',
  customThemeList: [] as any // 自定义主题列表
})

let graphString = '' // 图纸字符串，用于对比图纸是否修改过

const isModule = computed(() => {
  return state.screenType == 'component'
})

// 图纸信息
const pageInfo = computed(() => {
  return {
    name: state.pageObject.name,
    id: queryData.id
  }
})

// 操作
const handleCommand = (type: pageOperationTypes, data: any, source?: any) => {
  switch (type) {
    case pageOperationTypes.save:
      handleSaveData()
      console.log(1)
      break
    case pageOperationTypes.preview:
      console.log(2)
      handlePreviewData()
      break
    case pageOperationTypes.back:
      console.log(3)
      handleBack()
      break
    case pageOperationTypes.objectAdd:
      console.log(4)
      handleAddComponent(data)
      break
    case pageOperationTypes.search:
      console.log(5)
      handleSearch()
      break
    case pageOperationTypes.importDraft:
      console.log(6)
      handleImportDraft()
      break
    case pageOperationTypes.saveDraft:
      console.log(7)
      handleSaveDraft().then(() => {
        ElMessage.success('已保存本地草稿')
      })
      break
    case pageOperationTypes.dataPreview:
      console.log(8)
      handleDataPreview(data)
      break
    case pageOperationTypes.imagePicker:
      console.log(9)
      handleImagePickerOpen(data)
      break
    case pageOperationTypes.fileUpload:
      console.log(10)
      handleFileUpload(data)
      break
    case pageOperationTypes.materialUpdate:
      console.log(11)
      handleMaterialUpdate(data, source)
      break
  }
}

// 处理单个文件上传，上传完成后将url回调给调用方
const handleFileUpload = async ({ formData, callback }: any) => {
  state.loadingText = '请稍候...'
  const [err, res]: any = await datavisApi.file.uploadFiles(formData.files, {
    folder: formData.folder || 'datavis/unclassified',
    isCover: false
  })
  state.loadingText = ''
  if (err) {
    return
  }
  const { urls } = res
  urls.forEach((item: any, index: number) => {
    urls[index] = datavisApi.fileService + item
  })
  callback({ urls })
}

const handleImagePickerOpen = ({ callback }: any) => {
  imagePickerDialogRef.value.handleOpenDialog(callback)
}

const handleFinishImagePickerDialog = (e: any) => {
  const editor = datavisEditorRef.value.exposeGetEditor()
  if (e.type === 'uploaded') {
    editor.fire(eventTypes.pageOperation, { type: pageOperationTypes.materialUpdate, data: e.data, source: 'datavisFrame' })
  }
}

// 素材更新
const handleMaterialUpdate = (data: any, source: any) => {
  imagePickerDialogRef.value.initClassData(data, source)
}

const handleDataPreview = (data: any) => {
  const editor = datavisEditorRef.value.exposeGetEditor()
  const { backend, frontend, screen } = data
  const screens = [...backend, ...frontend, ...screen]
  const objs = screens.reduce((pre, cur) => {
    pre.push(...cur.objects)
    return pre
  }, [])
  const dataMaps: any = {}

  const exportFields = ['id', 'name', 'component', 'data']
  editor.util.traverse(objs, 'objects', (item: any) => {
    if (item.signal) {
      dataMaps[item.signal] = pick(item, exportFields)
    }
  })
  const jsonObject = {
    result: 0,
    data: dataMaps
  }
  dataPreviewDialogRef.value.handleOpenDialog({
    title: '组件数据预览',
    name: state.pageObject.name,
    code: JSON.stringify(jsonObject)
  })
}

const handleFinishDataPreviewDialog = (e: any) => {
  datavisEditorRef.value.exposeSetData(e.data)
  dataPreviewDialogRef.value.handleCloseDialog()
}

//编辑器实例
const datavisEditorRef = ref()

/**
 * 保存草稿
 */
const handleSaveDraft = () => {
  // 模块类型
  return new Promise((resolve, reject) => {
    datavisEditorRef.value.exposeExportData().then((pageData: any) => {
      if (pageData.module) {
        return reject(new Error('模块不能保存草稿'))
      }
      // const id = route.params.id as string
      const id = queryData.id as string
      localforage.getItem(draftStroageKey).then((storePageDataStr: any) => {
        storePageDataStr = storePageDataStr || '{}'
        const storePageData = JSON.parse(storePageDataStr)
        const storeData = {
          pageData,
          time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
        storePageData[id] = storeData
        const storeKeys = Object.keys(storePageData)
        const storeLen = 5 // 最多保存多少个草稿

        if (storeKeys.length > storeLen) {
          const arr: any = []
          storeKeys.forEach(key => {
            arr.push({ key, time: storePageData[key].time })
          })
          arr.sort((a: any, b: any) => dayjs(b.time).unix() - dayjs(a.time).unix()) // 降序排序
          const toDeleteList = arr.slice(storeLen) // 根据时间删除时间久远的草稿
          if (toDeleteList.length) {
            toDeleteList.forEach((item: any) => {
              delete storePageData[item.key]
            })
          }
        }
        localforage.setItem(draftStroageKey, JSON.stringify(storePageData)).then((_res: any) => {
          resolve('ok')
        })
      })
    })
  })
}

// 读取本地草稿
const handleImportDraft = () => {
  // const id = route.params.id as string
  const id = queryData.id as string
  localforage.getItem(draftStroageKey).then((pageData: any) => {
    if (pageData) {
      const storePageData = JSON.parse(pageData)
      if (storePageData[id]) {
        datavisEditorRef.value.exposeImportData(storePageData[id].pageData)
        ElMessage.success('导入成功')
      } else {
        ElMessage.info('暂无草稿')
      }
    }
  })
}

// 返回
const backDialogRef = ref()
const handleBack = async () => {
  const currentPageData = await datavisEditorRef.value.exposeExportData()
  const excludeObj = omit(currentPageData, ['info'])
  const currentPageString = JSON.stringify(excludeObj)
  if (currentPageString !== graphString) {
    backDialogRef.value.handleOpenDialog()
  } else {
    handleFinishBack()
  }
}

//添加组件
const handleAddComponent = (row: any) => {
  switch (row.type) {
    case 'addModule':
      // 模块
      handleGetModuleData(row.params)
      break
    case 'addScreen':
      // 大屏
      handleGetScreenData(row)
      break
    case 'addImage':
      // 图片
      handleGetMaterialData(row.params)
      break
    case 'addVideo':
      // 视频
      handleGetVideoData(row.params)
      break
  }
}

// 获取大屏数据并作为组件添加
const handleGetScreenData = async (data: any) => {
  //把大屏数据导入到编辑器中
  const { params, isCover } = data
  state.loadingText = '正在添加中，请稍后...'
  // const [fileErr, fileRes] = await datavisApi.file.getFile(params.url)
  const fileErr = null
  const fileRes = {}
  if (fileErr) {
    state.loadingText = ''
    return
  }
  const reader = new FileReader()
  reader.onloadend = e => {
    const data: any = e.target?.result
    const parseData = JSON.parse(data)
    if (isCover) {
      datavisEditorRef.value.exposeImportData(parseData)
    } else {
      datavisEditorRef.value.exposeAddModule(parseData)
    }
  }
  reader.readAsText(fileRes.data, 'utf-8')
  state.loadingText = ''
}

// 获取模块数据并作为组件添加
const handleGetModuleData = async (data: any) => {
  //把模块数据导入到编辑器中
  const url = data.url
  state.loadingText = '正在添加中，请稍后...'
  const [fileErr, fileRes] = await datavisApi.file.getFile(url)

  if (fileErr) {
    state.loadingText = ''
    return
  }
  const reader = new FileReader()
  reader.onloadend = e => {
    const data: any = e.target?.result
    const parseData = JSON.parse(data)
    datavisEditorRef.value.exposeAddModule(parseData)
  }
  reader.readAsText(fileRes.data, 'utf-8')
  state.loadingText = ''
}

// 获取素材数据并作为组件添加
const handleGetMaterialData = (data: any) => {
  //把模块数据导入到编辑器中
  const url = data.image
  state.loadingText = '正在添加中，请稍后...'
  getImageSize(url)
    .then((res: any) => {
      const { width, height } = res
      datavisEditorRef.value.exposeAddMaterial({ width, height, url })
    })
    .finally(() => {
      state.loadingText = ''
    })
}

// 获取视频地址并作为组件添加
const handleGetVideoData = (data: any) => {
  //把组件添加到编辑器中
  const url = data.image
  state.loadingText = '正在添加中，请稍后...'
  const width = 300,
    height = 200
  datavisEditorRef.value.exposeAddVideo({ width, height, url })
  state.loadingText = ''
}

// 搜索组件/图层
const searchDialogRef = ref()
const handleSearch = async () => {
  const editor = datavisEditorRef.value.exposeGetEditor()
  const pageData = await datavisEditorRef.value.exposeExportData()
  // 获取当前编辑的子屏
  const activeScreenId = pageData.config.toolbar.defaultBoardId
  const activeScreen = pageData.screen.find((item: any) => item.uid === activeScreenId)
  const screen = {
    name: '图层',
    objects: []
  }
  if (activeScreen) {
    screen.objects = activeScreen.objects
  }
  searchDialogRef.value.handleOpenDialog({
    screen: screen,
    editor: editor
  })
}

const handleSearchCommand = (row: any) => {
  datavisEditorRef.value.exposeAddComponent(row)
}

/**----------路由相关------- */
// 预览
const handlePreviewData = () => {
  // 打开新标签页预览
  const resolveData = router.resolve({
    path: '/view'
  })
  window.open(resolveData.href)
}

// 返回提示确定
const handleFinishBack = async (type?: any) => {
  if (type === 'save') {
    const success = await handleSaveData()
    if (!success) {
      return
    }
    // 预留一点反应时间
    ElMessage.success('2秒后自动回退')
    setTimeout(() => {
      router.back()
    }, 2000)
  } else {
    router.back()
  }
}

/**----------路由相关------- */

/**-----------api接口相关----------- */

// 获取数据
const initGetScreenData = async () => {
  state.loadingText = '正在加载中...'
  // const params = { id: route.params.id }
  // console.log(route.query.id, 2222);

  projectManagement_detils(route.query.id).then(res => {
    const data = res.data
    projectName.value = res.data.projectName
    // let aaaa = { "config": { "width": 1920, "height": 1080, "background": "#1F2024", "backgroundImage": "https://aisearch.cdn.bcebos.com/pic_create/2025-11-04/17/4c7a962758afb00d.jpg?x-bce-process=image/watermark,image_cGljX2NyZWF0ZS93YXRlcm1hcmsvYWlfd2F0ZXJtYXJrLnBuZw==,x_16,y_16", "backgroundFilter": { "enable": false, "hueRotate": 0, "saturate": 100, "brightness": 0, "contrast": 0, "grayscale": 0, "opacity": 100 }, "renderMode": "fit", "defaultScreenId": "", "toolbar": { "enabled": true, "visiable": true, "playEnabled": false, "playInterval": 3, "defaultBoardId": "xxx001" }, "filter": { "enabled": false, "hueRotate": 0, "saturate": 0, "brightness": 0, "contrast": 0, "grayscale": 0 }, "viewportTransform": { "a": 0.7300000000000004, "b": 0, "c": 0, "d": 0.7300000000000004, "e": 147, "f": 100.5 } }, "frontend": [{ "name": "前景大屏", "uid": "xxxfront", "type": "frontend", "objects": [] }], "screen": [{ "name": "页面", "uid": "xxx001", "type": "screen", "objects": [{ "id": "UMD-2RS3", "name": "开关", "type": "object", "component": { "name": "visWidgetSwitch", "title": "开关" }, "stateIndex": 0, "states": [{ "style": { "backgroundColor": "rgba(0,0,0,0)", "fontSize": 14, "color": "#000", "alignItems": "center", "justifyContent": "center" } }], "x": 718.6799999999998, "y": 1.1904761904761898, "w": 181.3199999999996, "h": 77.26666666666631, "angle": 0, "locked": true, "visible": true, "events": { "enable": true, "mounted": { "enable": false, "config": { "request": { "enable": false }, "state": { "enable": false, "index": 0 }, "page": { "enable": false, "pageId": "", "pageIndex": 0 }, "script": { "enable": false, "code": "" }, "write": { "enable": false }, "dialog": { "enable": false, "type": "" } } }, "click": { "enable": false, "config": {} }, "dblclick": { "enable": true, "config": { "request": { "enable": false }, "state": { "enable": false, "index": 0 }, "page": { "enable": false, "pageId": "", "pageIndex": 0 }, "script": { "enable": false, "code": "" }, "write": { "enable": false }, "dialog": { "enable": true, "type": "11" } } }, "mouseenter": { "enable": false, "config": {} }, "mouseleave": { "enable": false, "config": {} } }, "requests": { "type": "static", "url": "", "method": "GET", "params": "", "header": "", "internal": 0, "dataFilter": "" }, "version": "0.0.1", "dataFieldMap": [{ "fieldName": "value", "fieldAlias": "", "fieldDesc": "默认值", "dataType": "string" }], "data": [{ "value": "on" }], "activeColor": "#0B8CF0", "activeValue": "on", "inactiveColor": "#4E5865", "inactiveValue": "off", "flipX": false, "flipY": false }, { "id": "QEE_qUQM", "name": "设备", "type": "object", "component": { "name": "customWidgetImage", "title": "设备" }, "stateIndex": 0, "states": [{ "src": "http://192.168.0.103:8080/profile/upload/2025/10/24/IMG_0840_20251024110016A002.JPG", "style": { "backgroundColor": "rgba(0,0,0,0)", "borderWidth": 0, "borderStyle": "solid", "borderColor": "#999", "objectFit": "fill", "device": { "createBy": null, "createTime": "2025-10-24 11:00:24", "updateBy": null, "updateTime": "2025-11-12 09:47:57", "remark": null, "id": 5, "companyId": "3250", "platformProductId": 0, "name": "222", "categoryId": 103, "categoryName": "智慧生活", "brand": "美的", "iconUrl": "/profile/upload/2025/10/24/IMG_0840_20251024110016A002.JPG", "introduction": "2222", "price": 2233, "unit": "个", "categoryIds": null } }, "name": "默认状态" }], "x": 288.7, "y": 114.73, "w": 50, "h": 50, "angle": 0, "locked": false, "visible": true, "events": { "enable": false }, "requests": { "type": "static", "url": "", "method": "GET", "params": "", "header": "", "internal": 0, "dataFilter": "" }, "opacity": 1, "rotate": false, "duration": 3, "reverse": false, "skewAngle": "rotating", "filter": { "enable": false, "hueRotate": { "enable": false, "value": 0 }, "contrast": { "enable": false, "value": 100 }, "saturate": { "enable": false, "value": 100 }, "brightness": { "enable": false, "value": 100 }, "grayscale": { "enable": false, "value": 0 } }, "dataFieldMap": [{ "fieldName": "src", "fieldAlias": "", "fieldDesc": "文本", "dataType": "string" }], "data": [] }, { "id": "igaHu2M4", "name": "设备", "type": "object", "component": { "name": "customWidgetImage", "title": "设备" }, "stateIndex": 0, "states": [{ "src": "http://192.168.0.103:8080/profile/upload/2025/10/24/infinity-739525_20251024110235A003.jpg", "style": { "backgroundColor": "rgba(0,0,0,0)", "borderWidth": 0, "borderStyle": "solid", "borderColor": "#999", "objectFit": "fill", "device": { "createBy": null, "createTime": "2025-10-24 11:02:44", "updateBy": null, "updateTime": "2025-11-12 09:47:57", "remark": null, "id": 6, "companyId": "9851", "platformProductId": 0, "name": "呜呜呜88", "categoryId": 103, "categoryName": "智慧生活", "brand": "杜亚", "iconUrl": "/profile/upload/2025/10/24/infinity-739525_20251024110235A003.jpg", "introduction": "123", "price": 11222, "unit": "个", "categoryIds": null } }, "name": "默认状态" }], "x": 480.48, "y": 143.49, "w": 50, "h": 50, "angle": 0, "locked": false, "visible": true, "events": { "enable": false }, "requests": { "type": "static", "url": "", "method": "GET", "params": "", "header": "", "internal": 0, "dataFilter": "" }, "opacity": 1, "rotate": false, "duration": 3, "reverse": false, "skewAngle": "rotating", "filter": { "enable": false, "hueRotate": { "enable": false, "value": 0 }, "contrast": { "enable": false, "value": 100 }, "saturate": { "enable": false, "value": 100 }, "brightness": { "enable": false, "value": 100 }, "grayscale": { "enable": false, "value": 0 } }, "dataFieldMap": [{ "fieldName": "src", "fieldAlias": "", "fieldDesc": "文本", "dataType": "string" }], "data": [] }] }, { "name": "子页面2", "uid": "myEY-tHL", "type": "screen", "objects": [] }], "backend": [{ "name": "前景大屏", "uid": "xxxbg", "type": "backend", "objects": [] }], "lastEditScreenId": "xxx001", "info": { "app": "localhost", "appVersion": "editor-v0.0.1", "version": "core-v0.0.1", "build": "2025-11-13 11:41:49", "name": "111", "id": "4e197732fe4a4d60a9273dd018fb5b38" }, "type": "visual", "metadata": { "fonts": [] } }
    let jsonData = {}
    if (data.jsonData) {
      jsonData = data.jsonData
    } else {
      jsonData = {
        "config": {
          "width": 1920,
          "height": 1080,
          "background": "#1F2024",
          "backgroundImage": "",
          "backgroundFilter": {
            "enable": false,
            "hueRotate": 0,
            "saturate": 100,
            "brightness": 0,
            "contrast": 0,
            "grayscale": 0,
            "opacity": 100
          },
          "renderMode": "fit",
          "defaultScreenId": "",
          "toolbar": {
            "enabled": true,
            "visiable": true,
            "playEnabled": false,
            "playInterval": 3,
            "defaultBoardId": "xxx001"
          },
          "filter": {
            "enabled": false,
            "hueRotate": 0,
            "saturate": 0,
            "brightness": 0,
            "contrast": 0,
            "grayscale": 0
          },
          "viewportTransform": {
            "a": 0.2972222222222222,
            "b": 0,
            "c": 0,
            "d": 0.2972222222222222,
            "e": 394.5,
            "f": 30.5
          }
        },
        "frontend": [
          {
            "name": "前景大屏",
            "uid": "xxxfront",
            "type": "frontend",
            "objects": []
          }
        ],
        "screen": [
          {
            "name": "页面",
            "uid": 'xxx001',
            'pageId': data.pageList[0].id,
            "type": "screen",
            "objects": []
          }
        ],
        "backend": [
          {
            "name": "前景大屏",
            "uid": "xxxbg",
            "type": "backend",
            "objects": []
          }
        ],
        "lastEditScreenId": "xxx001",
        "info": {
          "app": "192.168.0.102:2800",
          "appVersion": "editor-v0.0.1",
          "version": "core-v0.0.1",
          "build": "2025-11-13 16:54:12",
          "name": "123",
          "id": "ff74bab7c70142aaa2a45c485ee383de"
        },
        "type": "visual",
        "metadata": {
          "fonts": []
        }
      }
    }

    let fileResJSON = JSON.stringify(jsonData)
    let blob = new Blob([fileResJSON], { type: 'application/json' });
    const reader = new FileReader()
    reader.onloadend = e => {
      const parseData = JSON.parse(e.target?.result as string)
      graphString = JSON.stringify(omit(parseData, ['info'])) // 更新全局变量图纸数据
      datavisEditorRef.value.exposeImportData(parseData)
      state.loadingText = ''
    }
    // console.log(blob, 39839398)
    reader.readAsText(blob, 'utf-8')
    state.loadingText = ''
  }).catch(() => {
    state.loadingText = ''
  })
}

function extractDevicesFromScreenConfig(screenConfig) {
  if (!screenConfig || typeof screenConfig !== 'object') {
    console.warn('无效的配置对象');
    return [];
  }

  const devices = [];

  try {
    // 检查screen数组是否存在
    if (Array.isArray(screenConfig.screen)) {
      screenConfig.screen.forEach(screen => {
        // 检查screen中的objects数组
        if (Array.isArray(screen.objects)) {
          screen.objects.forEach(object => {
            // 检查object中的states数组
            if (Array.isArray(object.states)) {
              object.states.forEach(state => {
                // 检查state中的style对象和其中的device对象
                if (state.style && state.style.device && typeof state.style.device === 'object') {
                  devices.push({
                    companyProductId: state.style.device.id,
                    remark: state.style.device.remark || "",
                    name: state.style.device.name || '',
                    categoryId: state.style.device.categoryId,
                    categoryName: state.style.device.categoryName,
                    brand: state.style.device.brand || '',
                    iconUrl: state.style.device.iconUrl,
                    price: state.style.device.price || 0,
                    unit: state.style.device.unit,
                    num: state.style.device.num || 1,
                    discountPrice: state.style.device.discountPrice || 0,
                    region: state.style.device.region || '其他',
                    introduction: state.style.device.introduction || '',
                  });
                }
              });
            }
          });
        }
      });
    }

    return devices;
  } catch (error) {
    console.error('提取设备信息时发生错误:', error);
    return [];
  }
}
const aaa = async (data) => {
  const { pageData } = await datavisEditorRef.value.exposeGetSaveData()
  let pageDataJson = JSON.parse(JSON.stringify(pageData))
  pageDataJson.config.width = data.width
  pageDataJson.config.height = data.height
  datavisEditorRef.value.exposeImportData(pageDataJson)
}

emitter.on('changeBackground', aaa)

const processImage = async (image, margin = 200, color = 'white') => {
  // const { pageData, image } = await datavisEditorRef.value.exposeGetSaveData()
  // 1. 加载原始图片，获取尺寸
  const img = new Image()
  img.src = image
  img.onload = () => {

    // 2. 动态设置Canvas尺寸（按需扩展，此处以“扩展50像素边距”为例）
    const canvas = document.createElement('canvas')
    canvas.width = (img.width + margin * 2)
    canvas.height = (img.height + margin * 2)
    const ctx = canvas.getContext('2d')!



    // 3. 填充背景（避免白色区域）
    ctx.fillStyle = color || 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 4. 绘制原始图片到中心位置
    ctx.drawImage(img, margin, margin, (img.width), (img.height))


    // // 获取文字宽度（需先设置字体样式）
    // ctx.font = '50px Arial' // 示例字体样式
    // const textWidth = ctx.measureText('厦门HOLA科技').width

    // // 右上角x坐标：canvas宽度 - 文字宽度 - 右侧空白（margin）
    // const x = canvas.width - textWidth - 50
    // const y = 100 // 右上角y坐标（接近0的偏移量，如margin）

    // // 5. 绘制右上角文字
    // ctx.fillStyle = 'black' // 文字颜色
    // ctx.font = '40px Arial' // 字体样式
    // ctx.fillText('厦门HOLA科技', x, y) // 文字位置（右上角）
    const quality = 0.5; // 画质（0-1，0.8为推荐平衡值）
    // 5. 转换为Base64并显示
    imgurl.value = canvas.toDataURL('image/png', quality)
  }
}

// 保存图纸
const handleSaveData = async () => {
  let saveSuccess = false // 保存是否成功
  state.loadingText = '正在保存中...'
  const { pageData, image } = await datavisEditorRef.value.exposeGetSaveData()
  // const fileFullName = route.params.id
  const fileFullName = queryData.id
  const content = JSON.stringify(pageData)
  // console.log(content);
  let productSelections = extractDevicesFromScreenConfig(JSON.parse(content))

  processImage(image)

  // setTimeout(() => {
  updateProjectManagement({
    id: route.query.id,
    jsonData: content,
    productSelections,
    image: imgurl.value
  }).then(response => {
    useMessage.success('保存成功')
    saveSuccess = true
    graphString = JSON.stringify(omit(pageData, ['info'])) // 更新全局变量图纸数据
  })
  // }, 500)

  // const jsonFile = new File([content], `${fileFullName}.json`, {
  //   type: 'text/json'
  // })
  // const thumbnail = base64ToFile(image, fileFullName.toString())
  // const filePathMaps: any = {
  //   screen: 'datavis/screen',
  //   component: 'datavis/component',
  //   market: 'datavis/market'
  // }
  // console.log(jsonFile, thumbnail, '20290202889');

  // const files = [jsonFile, thumbnail]

  // const [uploadErr, uploadRes]: any = await datavisApi.file.uploadFiles(files, {
  //   folder: filePathMaps[state.screenType],
  //   isCover: true
  // })
  // if (!uploadErr) {
  //   const { urls } = uploadRes
  //   const params = {
  //     ...state.pageObject,
  //     url: urls[0],
  //     thumbnail: urls[1]
  //   }
  //   const [err] = await datavisApi.resource.save(params)
  //   if (!err) {
  //     useMessage.success('保存成功')
  //     saveSuccess = true
  //     graphString = JSON.stringify(omit(pageData, ['info'])) // 更新全局变量图纸数据
  // }
  // }

  state.loadingText = ''
  return saveSuccess
}

/**-----------api接口相关----------- */

watch(
  () => route.path,
  () => {
    initGetScreenData()
  }
)

// 处理页面隐藏事件，如切换标签页、页面最小化等，将当前内容写到预览数据中
const handleVisibilityChange = async () => {
  if (document.visibilityState === 'hidden') {
    const pageData = await datavisEditorRef.value.exposeExportData()
    localforage.setItem(previewStroageKey, JSON.stringify(pageData))
  }
}

const handleEditorReady = (datavisEditor: any) => {
  // if (route.query.screenType) {
  //   state.screenType = route.query.screenType as any
  // }
  if (queryData.screenType) {
    state.screenType = queryData.screenType as any
  }
  initGetScreenData()
  document.addEventListener('visibilitychange', handleVisibilityChange)
}

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
onMounted(() => {
  setTimeout(() => {
    // 1. 选中所有匹配的元素
    const elements = document.querySelectorAll('.page-bar_board_item');
    const elements1 = document.querySelectorAll('.visui-item');
    // 2. 遍历并删除每个元素
    elements.forEach((el: any, index) => {
      if (index == 0 || index == elements.length - 1) {
        // el.remove();
        // console.log(el, 'page-bar_board_item');
        el.style.display = 'none'; // 隐藏元素
      }
    });
    elements1.forEach((el: any, index) => {
      if (index == 0) {
        // console.log(el, 'visui-item');
        // el.remove();
        el.style.display = 'none'; // 隐藏元素
      }
    });
  }, 2500);
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>
