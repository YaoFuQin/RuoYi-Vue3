<template>
  <div class="app-container">

    <el-tabs v-model="activeName" class="demo-tabs" default-value="third" @tab-click="handleClick">
      <el-tab-pane label="报价单" name="1">
        <el-row :gutter="24">
          <!--产品数据-->
          <el-col :span="24">
            <el-row :gutter="10" class="mb8">
              <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="120px">
                <el-form-item label="分类报价表" prop="categoryName">
                  <div style="display: flex;align-items: center;">
                    <el-select v-model="queryParams.categoryName" placeholder="请选择" style="width: 120px" filterable
                      @change="handleQuery">
                      <el-option v-for="item in categoryList" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                    <el-button style="margin: 0 10px;" icon="Refresh" @click="resetQuery">重置</el-button>
                    <vxe-toolbar ref="toolbarRef" custom></vxe-toolbar>
                  </div>
                </el-form-item>

              </el-form>
            </el-row>
            <vxe-table ref="tableRef" show-footer :footer-data="footerData" @cell-click="tableClick"
              :row-config="{ isCurrent: true, isHover: true }" border align="center" :loading="loading"
              :scroll-y="{ enabled: false }" :span-method="mergeRowMethod" :data="productList" :show-overflow="true"
              max-height="650">
              <vxe-column field="name" title="产品名称" align="center" width="200">
                <template #footer="{ row }">
                  <span style="color: blue;">{{ row.seq }}</span>
                </template>
              </vxe-column>
              <vxe-column field="region" title="区域" width="100"></vxe-column>
              <vxe-column field="categoryName" title="所属品类" width="120"></vxe-column>
              <vxe-column title="设备图标" width="100">
                <template #default="{ row }">
                  <el-image v-if="row.iconUrl" style="width: 30px; height: 30px;border-radius: 2px;"
                    :src="baseUrl + row.iconUrl"> </el-image>
                  <span v-else>--</span>
                </template>
              </vxe-column>
              <vxe-column field="brand" title="品牌名称" width="90"></vxe-column>
              <!-- <vxe-column field="name" title="产品名称"></vxe-column> -->
              <vxe-column width="100" field="price" title="单价(元)"></vxe-column>
              <!-- <vxe-column width="100" field="discountPrice" title="折扣价(元)">
              </vxe-column> -->
              <vxe-column width="50" field="num" title="数量"> </vxe-column>
              <vxe-column field="unit" title="单位" width="140">
                <template #footer="{ row }">
                  <span v-if="row.type == 3" style="color: red;">
                    折扣率： {{ discountRate }}%
                  </span>
                </template>
              </vxe-column>
              <vxe-column title="小计" width="120">
                <template #default="{ row }">
                  <span v-if="row.discountPrice">{{ row.discountPrice * row.num }}</span>
                  <span v-else>{{ row.price * row.num }}</span>
                </template>
                <template #footer="{ row }">
                  <span v-if="row.type == 1">￥{{ row.sunNum }}元</span>
                  <span style="color: red;" v-if="row.type == 3">￥{{ row.sunNum }}元</span>
                </template>
              </vxe-column>
              <vxe-column field="introduction" title="产品介绍" min-width="200">
                <template #footer="{ row }">
                  <span v-if="row.type == 3" style="color: red;">
                    ps： 折扣后金额合计 = 折扣率 * 项目金额合计
                  </span>
                </template>
              </vxe-column>
            </vxe-table>
          </el-col>
        </el-row>
        <img style="width: 100%;opacity: 0;position: absolute;" ref="imgRef" :src="imageUrl" alt="">
      </el-tab-pane>
      <el-tab-pane label="点位图" name="2">
        <div style="position: relative;">
          <img style="width: 100%;" :src="imageUrl" alt="">
          <img v-for="(item, index) in shareProductSelections" @click="openDetail(item)" :key="index"
            :src="baseUrl + item.iconUrl"
            :style="{ 'width': item.w + 'px', 'height': item.h + 'px', 'top': item.y + 'px', 'left': item.x + 'px', 'background': 'rgb(255, 0, 0, 0)', 'position': 'absolute', 'border': '2px solid #5182D5' }" />
        </div>
      </el-tab-pane>

    </el-tabs>


    <el-drawer v-model="drawer" title="设备信息" direction="btt" body-class="device_drawer" size="60%">
      <div style="display:flex;justify-content: center;"><el-image :src="baseUrl + deviceInfo.iconUrl"
          style="width: 20%;height:20%"></el-image></div>
      <div class="line_item">
        <div class="title_box">产品名称：</div>
        <div class="content_box">{{ deviceInfo.name }}</div>
      </div>
      <div style="margin-top: 20rpx;">
        <div class="title_box">产品介绍：</div>
        <div class="content_box" style="margin-top: 8rpx;">{{ deviceInfo.introduction || '--' }}</div>
      </div>
      <!-- <div class="line_item">
        <div class="title_box">产品折扣价：</div>
        <div class="content_box">{{deviceInfo.discountPrice}} 元</div>
      </div> -->
      <div class="line_item">
        <div class="title_box">产品数量：</div>
        <div class="content_box">{{ deviceInfo.num }} {{ deviceInfo.unit }}</div>
      </div>
      <div class="line_item">
        <div class="title_box">产品价格：</div>
        <div class="content_box">{{ deviceInfo.price }} 元</div>
      </div>
      <div class="line_item">
        <div class="title_box">产品区域：</div>
        <div class="content_box">{{ deviceInfo.region }}</div>
      </div>
    </el-drawer>

    <el-dialog v-model="dialog_share" :show-close="true" :close-on-click-modal="false" append-to-body title="分享">
      <div class="qr-code-container">
        <div id="codeImg" ref="qrcodeCanvas"
          style="padding:30px;display:flex;flex-direction: column;align-items: center;justify-content: center;">
          <p class="link-text">您的智能家居方案已完成，请扫码查阅!</p>
          <div style="">
            <QrcodeVue :value="share_url" :size="200" level="M" />
          </div>
          <p class="link-text" style="color:#ccc">由Yila.OpenHola.com智能设计驱动!</p>
          <!-- <p class=" link-text">{{ share_url }}</p> -->
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer" style="display:flex;justify-content: center;">
          <!-- <el-button type="primary" @click="downloadQRCode">下载二维码</el-button> -->
        </div>
      </template>
    </el-dialog>


  </div>
</template>

<script setup name="projectManagement_detials">
import { getToken } from "@/utils/auth"
import useAppStore from '@/store/modules/app'
import { listCategory } from "@/api/system/category"
import { shareProjects_detils, checkShare } from "@/api/projectManagement"
const { proxy } = getCurrentInstance()
const { sys_brand_name } = proxy.useDict("sys_brand_name")
import { useRoute, useRouter } from 'vue-router'

import { Splitpanes, Pane } from "splitpanes"
import "splitpanes/dist/splitpanes.css"



const baseUrl = ref(import.meta.env.VITE_APP_VIEW_IMG_URL) // 图片预览地址
const router = useRouter()
const route = useRoute()
const appStore = useAppStore()


const productList = ref([])
const productListCopy = ref([])
const open = ref(false)
const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])
const enabledCategoryOptions = ref([])
const initPassword = ref(undefined)
const postOptions = ref([])
const roleOptions = ref([])
const status = ref(1)


const imgRef = ref(null);
const toolbarRef = ref()
const tableRef = ref()
const serviceCharge = ref(1000)
const categoryList = ref([])
const activeName = ref('1')
const scaleNum = ref(1)
const imageUrl = ref('')
const shareProductSelections = ref([])
const drawer = ref(false)
const deviceInfo = ref({})

import QrcodeVue from 'qrcode.vue'
import html2canvas from 'html2canvas';
const qrcodeCanvas = ref < HTMLCanvasElement | null > (null);
const dialog_share = ref(false)
const share_url = ref('https://example.com/share?room=123456')

/*** 产品导入参数 */
const upload = reactive({
  // 是否显示弹出层（产品导入）
  open: false,
  // 弹出层标题（产品导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的产品数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/productManagement/platformProducts/import"
})
// 列显隐信息
const columns = ref({
  name: { label: '产品名称', visible: true },
  iconUrl: { label: '图标', visible: true },
  categoryName: { label: '所属品类', visible: true },
  unit: { label: '单位', visible: true },
  brand: { label: '品牌名称', visible: true },
  introduction: { label: '介绍', visible: true },
  createTime: { label: '创建时间', visible: true },
})
const footerData = ref([
  { seq: '项目金额合计', sunNum: 0, type: 1, },
  { seq: '折扣后金额合计', sunNum: 1000, type: 3, },
])
const discountRate = ref(100)

const data = reactive({
  form: {},
  queryParams: {
    categoryName: undefined
  },
  formCopy: {},
  rules: {
    name: [
      { required: true, message: "产品名称不能为空", trigger: "blur" },
      { min: 2, max: 20, message: '产品名称长度必须介于 2 和 20 之间', trigger: 'blur' }
    ],
    // iconUrl: [
    //   { required: true, message: "产品图标不能为空", trigger: "change" }
    // ],
    categoryId: [
      { required: true, message: "请选择所属品类", trigger: "change" }
    ],
    unit: [
      { required: true, message: "单位不能为空", trigger: "blur" }
    ],
    // brand: [
    //   { required: true, message: "请选择所属品牌", trigger: "change" }
    // ]
  }
})


const { form, queryParams, formCopy, rules } = toRefs(data)

/** 搜索按钮操作 */
function handleQuery () {
  if (queryParams.value.categoryName) {
    productList.value = productListCopy.value.filter(item => item.categoryName === queryParams.value.categoryName);
    updateFootEvent()
  }
}
/** 重置按钮操作 */
function resetQuery () {
  proxy.resetForm("queryRef")
  productList.value = productListCopy.value
  updateFootEvent()
}

/** 下载二维码 */
const downloadQRCode = () => {
  console.log(qrcodeCanvas.value, 2221);

  html2canvas(qrcodeCanvas.value).then((canvas) => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = '图片下载.png';
    link.click();
  });
  // if (!qrcodeCanvas.value) return;
  // const canvas = qrcodeCanvas.value;
  // console.log(canvas, 2222);
  // const dataURL = canvas.toDataURL('image/png');
  // const link = document.createElement('a');
  // link.href = dataURL;
  // link.download = 'qrcode.png';
  // link.click();
}

/** 查询部门下拉树结构 */
function getDeptTree () {
  listCategory().then(response => {
    let data = response.data
    enabledCategoryOptions.value = []
    enabledCategoryOptions.value = proxy.handleTree(JSON.parse(JSON.stringify(data)), "categoryId")
  })
}
// 通用行合并函数（将相同多列数据合并为一行）
const mergeRowMethod = ({ row, _rowIndex, column, visibleData }) => {
  const fields = ['region']
  const cellValue = row[column.field]
  if (cellValue && fields.includes(column.field)) {
    const prevRow = visibleData[_rowIndex - 1]
    let nextRow = visibleData[_rowIndex + 1]
    if (prevRow && prevRow[column.field] === cellValue) {
      return { rowspan: 0, colspan: 0 }
    } else {
      let countRowspan = 1
      while (nextRow && nextRow[column.field] === cellValue) {
        nextRow = visibleData[++countRowspan + _rowIndex]
      }
      if (countRowspan > 1) {
        return { rowspan: countRowspan, colspan: 1 }
      }
    }
  }
}

const handleClick = (tab, event) => {
  console.log(tab, event)
}

function extractCategories (productList) {
  return [...new Set(productList.map(item => item.categoryName))];
}

const tableClick = ({ row, rowIndex }) => {
  deviceInfo.value = row
  drawer.value = true
}
/**
 * 将设备数组按照指定的区域顺序排序
 * @param {Array} devices - 设备数组，每个设备对象包含region属性
 * @returns {Array} 排序后的设备数组
 */
function sortDevicesByRegion (devices) {
  // 标准区域顺序
  const standardRegions = ['玄关', '客厅', '餐厅', '厨房', '主卧', '客卧', '老人房', '儿童房', '次卧', '书房', '卫生间', '阳台', '走廊', '楼梯', '费用项'];

  // 创建一个映射，用于快速获取标准区域的索引
  const regionOrderMap = new Map();
  standardRegions.forEach((region, index) => {
    regionOrderMap.set(region, index);
  });

  // 获取一个区域的排序值
  const getOrder = (region) => {
    if (regionOrderMap.has(region)) {
      return regionOrderMap.get(region);
    }
    // 非标准区域：放置在“楼梯”之后（即“楼梯”的索引+1的位置），注意“楼梯”在标准区域中必须存在
    // 如果标准区域中没有“楼梯”，则这里需要调整，但根据要求，标准区域中有“楼梯”
    const stairIndex = regionOrderMap.get('楼梯');
    return stairIndex + 1; // 非标准区域统一放在楼梯后面，费用项之前
  };

  // 使用稳定排序，对原数组进行排序
  // 由于JavaScript的sort方法在ES2019之后要求稳定，但为了兼容，我们可以用索引来辅助
  // 这里采用映射数组的方式，避免修改原数组
  return devices.map((device, index) => ({ device, index }))
    .sort((a, b) => {
      const regionA = a.device.region;
      const regionB = b.device.region;
      const orderA = getOrder(regionA);
      const orderB = getOrder(regionB);
      // 如果排序值不同，按排序值排序
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // 如果排序值相同（比如都是非标准区域，或者同一区域），则按原数组中的顺序
      return a.index - b.index;
    })
    .map(item => item.device);
}
/** 查询产品列表 */
function getList (projectsId) {
  loading.value = true
  shareProjects_detils(projectsId).then(res => {
    loading.value = false
    productList.value = res.data.shareProductSelections
    productListCopy.value = res.data.shareProductSelections
    categoryList.value = res.data.shareProductSelections
    categoryList.value = extractCategories(res.data.shareProductSelections)
    discountRate.value = res.data.discountRate || 100
    // productListCopy.value = extractDevicesFromScreenConfig(JSON.parse(res.data.jsonData))
    // productList.value = extractDevicesFromScreenConfig(JSON.parse(res.data.jsonData))
    // categoryList.value = extractCategories(JSON.parse(JSON.stringify(productList.value)))
    productList.value.sort((a, b) => {
      if (a.region < b.region) return -1;
      if (a.region > b.region) return 1;
      return 0;
    });
    productList.value = sortDevicesByRegion(productList.value)
    productListCopy.value = sortDevicesByRegion(productListCopy.value)
    // footerData.value[0].sunNum = productList.value.reduce((sum, item) => sum + (item.discountPrice ? item.discountPrice : item.price) * item.num, 0);
    let sumNum = productList.value.reduce((sum, item) => sum + (item.discountPrice ? item.discountPrice : item.price) * item.num, 0)
    footerData.value[0].sunNum = sumNum
    footerData.value[1].sunNum = sumNum * discountRate.value / 100;
    if (discountRate.value == 100) {
      footerData.value = [
        { seq: '项目金额合计', sunNum: sumNum, type: 1, },
      ]
    }
    total.value = res.total
    let jsonData = JSON.parse(res.data.jsonData)
    imageUrl.value = jsonData.config.backgroundImage

    if (imgRef.value) {
      setTimeout(() => {
        let width = 0;
        width = imgRef.value.clientWidth;
        // scaleNum.value = width / (jsonData.config.width + 400);
        scaleNum.value = width / (jsonData.config.width);
        console.log('盒子宽度:', width);
        shareProductSelections.value = extractDevicesFromScreenConfig(
          jsonData,
          scaleNum.value,
          projectsId
        )
        // console.log(shareProductSelections.value, 222);    
      }, 1000)

    }
  })
}

function copyToClipboard (text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      proxy.$modal.msgSuccess("复制成功")
    }).catch(err => {
      proxy.$modal.msgWarning("复制失败" + err)
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy (text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// 在值发生改变时更新表尾合计
const updateFootEvent = () => {
  const $table = tableRef.value
  if ($table) {
    // footerData.value[0].sunNum = productList.value.reduce((sum, item) => sum + (item.discountPrice ? item.discountPrice : item.price) * item.num, 0);
    footerData.value[0].sunNum = productList.value.reduce((sum, item) => sum + (item.discountPrice ? item.discountPrice : item.price) * item.num, 0)
    footerData.value[1].sunNum = footerData.value[0].sunNum * discountRate.value / 100;
  }
}

/** 重置操作表单 */
function reset () {
  form.value = {
    // id: undefined,
    // name: undefined,
    // iconUrl: undefined,
    // categoryId: undefined,
    // brand: undefined,
    // unit: undefined,
    // introduction: undefined,
  }
  // proxy.resetForm("userRef")
}



function extractDevicesFromScreenConfig (screenConfig, scaleNum, projectsId) {
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
                    projectsId: Number(projectsId),
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
                    // x: (object.x + 200) * scaleNum,
                    // y: (object.y + 200) * scaleNum,
                    x: (object.x) * scaleNum,
                    y: (object.y) * scaleNum,
                    w: object.w * scaleNum,
                    h: object.h * scaleNum,
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
/** 更多操作 */
function handleCommand (command, row) {
  switch (command) {
    case "handleResetPwd":
      handleResetPwd(row)
      break
    case "handleAuthRole":
      handleAuthRole(row)
      break
    default:
      break
  }
}

/** 跳转角色分配 */
function handleAuthRole (row) {
  const productId = row.productId
  router.push("/system/user-auth/role/" + productId)
}

/** 选择条数  */
function handleSelectionChange (selection) {
  ids.value = selection.map(item => item.productId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}


/** 取消按钮 */
function cancel () {
  open.value = false
  reset()
}

const openDetail = (item) => {
  console.log(item);
  drawer.value = true
  deviceInfo.value = item
}

onMounted(() => {
  if (route.query.id) {
    getList(route.query.id)
  }
  if (route.query.code) {
    checkShare({ projectsShare: route.query.code }).then(res => {
      status.value = res.data.status
      if (res.data.status !== 0) {
        proxy.$modal.msgWarning(`该分享链接${res.data.status == 1 ? '错误' : res.data.status == 2 ? '已过期' : '使用'}`)
        router.push({ path: '/projectManagemenlks_list_share' })
        return
      }
      if (res.data.id) {
        getList(res.data.id)
      }
    })
  }
  const $table = tableRef.value
  const $toolbar = toolbarRef.value
  if ($table && $toolbar) {
    $table.connect($toolbar)
  }
  getDeptTree()

})
</script>
<style lang="scss" scoped>
.device_drawer {
  height: 600px !important;
  background: red !important;
}

.line_item {
  display: flex;
  align-items: center;
  margin-top: 10px;
  // font-size: 32px;
}

.title_box {
  color: #000;
  font-weight: bold;
}

.content_box {
  color: #312f2f;
}
</style>
