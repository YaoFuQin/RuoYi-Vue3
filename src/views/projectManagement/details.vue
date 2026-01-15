<template>
  <div class="app-container">

    <el-tabs v-model="activeName" class="demo-tabs" default-value="third" @tab-click="handleClick">
      <el-tab-pane label="报价单" name="1">
        <el-row :gutter="24">
          <!--产品数据-->
          <el-col :span="24"> 
            <el-row :gutter="10" class="mb8">
              <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="120px">
                <el-form-item label="集成分类报价表" prop="categoryName">
                  <el-select v-model="queryParams.categoryName" placeholder="请选择" style="width: 240px" filterable
                    @change="handleQuery">
                    <el-option v-for="item in categoryList" :key="item" :label="item" :value="item"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="Pointer" @click="handleQuery">确定</el-button>
                  <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                </el-form-item>
              </el-form>
            </el-row>

            <el-row :gutter="10" class="mb8">
              <!-- <el-col :span="1.5">
                <el-button plain icon="Plus" @click="handleAdd">新增</el-button>
              </el-col> -->
              <el-col :span="1.5">
                <el-button type="success" plain icon="Edit" @click="handleUpdate">修改</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" @click="handleDelete">删除</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="primary" plain icon="Pointer" @click="preservation">保存</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="info" plain icon="Share" @click="ShareFun">生成报价</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="warning" ElLoading plain icon="DataLine" @click="analyzeTheQuotation">分析报价</el-button>
              </el-col>
            </el-row>

            <!-- <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="产品名称" align="center" key="name" prop="name" v-if="columns.name.visible"
            :show-overflow-tooltip="true" />
          <el-table-column label="图标" align="center" key="iconUrl" v-if="columns.iconUrl.visible" width="120">
            <template #default="scope">
              <div style="display: flex; align-items: center">
                <el-image style="width: 100px; height: 100px;border-radius: 10px;" :src="baseUrl + scope.row.iconUrl"
                  :preview-src-list="[baseUrl + scope.row.iconUrl]"> </el-image>
              </div>
            </template>
</el-table-column>
<el-table-column label="所属品类" align="center" key="categoryName" prop="categoryName" :show-overflow-tooltip="true"
  width="120" />
<el-table-column label="品牌名称" align="center" key="brand" width="120" prop="brand" :show-overflow-tooltip="true" />
<el-table-column label="单位" align="center" key="unit" width="80" prop="unit" />
<el-table-column label="介绍" align="center" key="introduction" prop="introduction" :show-overflow-tooltip="true" />
<el-table-column label="创建时间" align="center" prop="createTime" width="100">
  <template #default="scope">
              <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            </template>
</el-table-column>
<el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
  <template #default="scope">
              <el-tooltip content="修改" placement="top">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                  v-hasPermi="['productManagement:platformProducts:edit']"></el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                  v-hasPermi="['productManagement:platformProducts:remove']"></el-button>
              </el-tooltip>
            </template>
</el-table-column>
</el-table> -->


            <vxe-table ref="tableRef" show-footer :footer-data="footerData"
              :row-config="{ isCurrent: true, isHover: true }" border align="center" :loading="loading"
              :scroll-y="{ enabled: false }" :span-method="mergeRowMethod" :data="productList" :show-overflow="true"
              :edit-config="editConfig" :checkbox-config="{ labelField: 'seq', highlight: true }" max-height="700">
              <vxe-column type="checkbox" field="seq" width="120">
                <template #footer="{ row }">
                  <span style="color: blue;">{{ row.seq }}</span>
                </template>
              </vxe-column>
              <vxe-column field="states[0].style.device.name" title="产品名称" align="center" width="200">
              </vxe-column>
              <vxe-column field="states[0].style.device.region" title="区域" width="100"></vxe-column>
              <vxe-column field="states[0].style.device.categoryName" title="所属品类" width="150"></vxe-column>
              <vxe-column title="设备图标" width="100">
                <template #default="{ row }">
                  <el-image v-if="row.states[0].style.device.iconUrl"
                    style="width: 30px; height: 30px;border-radius: 2px;"
                    :src="baseUrl + row.states[0].style.device.iconUrl"
                    :preview-src-list="[baseUrl + row.states[0].style.device.iconUrl]">
                  </el-image>
                  <span v-else>--</span>
                </template>
              </vxe-column>
              <vxe-column field="states[0].style.device.brand" title="品牌名称" width="100"></vxe-column>
              <vxe-column width="140" field="states[0].style.device.price" title="单价(元)"
                :edit-render="{ autoFocus: true }">
                <template #edit="{ row }">
                  <vxe-number-input @change="updateFootEvent" :min="0" v-model.number="row.states[0].style.device.price"
                    align="center" type="integer"></vxe-number-input>
                </template>
              </vxe-column>
              <vxe-column field="states[0].style.device.costPrice" title="成本价格" width="100"></vxe-column>
              <vxe-column width="100" field="states[0].style.device.num" title="数量" :edit-render="{ autoFocus: true }">
                <template #edit="{ row }">
                  <vxe-number-input @change="updateFootEvent" :min="1" v-model.number="row.states[0].style.device.num"
                    align="center" type="integer"></vxe-number-input>
                </template>
              </vxe-column>
              <vxe-column field="states[0].style.device.unit" title="单位" width="140px">
                <template #footer="{ row }">
                  <span v-if="row.type == 3" style="color: red;">
                    <el-input-number v-model="discountRate" controls-position="right" @change="updateFootEvent"
                      :min="10" :max="100" style="width: 120px;">
                      <template #suffix>
                        <span>%</span>
                      </template>
                    </el-input-number>
                  </span>
                </template>
              </vxe-column>
              <vxe-column title="小计" width="120">
                <template #default="{ row }">
                  <span v-if="row.states[0].style.device.discountPrice">{{ row.states[0].style.device.discountPrice *
                    row.states[0].style.device.num }}</span>
                  <span v-else>{{ row.states[0].style.device.price * row.states[0].style.device.num }}</span>
                </template>
                <template #footer="{ row }">
                  <span v-if="row.type == 1">￥{{ row.sunNum }}元</span>
                  <span v-if="row.type == 2">￥{{ row.sunNum }}元</span>
                  <span style="color: red;" v-if="row.type == 3">￥{{ row.sunNum }}元</span>
                </template>
              </vxe-column>
              <vxe-column title="成本小计" width="100">
                <template #default="{ row }">
                  <span v-if="row.states[0].style.device.discountPrice">{{ row.states[0].style.device.discountPrice *
                    row.states[0].style.device.num }}</span>
                  <span v-else>{{ (row.states[0].style.device.costPrice || 0) * row.states[0].style.device.num }}</span>
                </template>
              </vxe-column>
              <vxe-column field="states[0].style.device.introduction" title="产品介绍" min-width="200">
                <template #footer="{ row }">
                  <span v-if="row.type == 3" style="color: red;">
                    ps： 折扣后金额合计 = 折扣率 * 项目金额合计
                  </span>
                </template>
              </vxe-column>
            </vxe-table>
            <!-- <vxe-table ref="tableRef" show-footer :footer-data="footerData"
              :row-config="{ isCurrent: true, isHover: true }" border align="center" :loading="loading"
              :scroll-y="{ enabled: false }" :span-method="mergeRowMethod" :data="productList" :show-overflow="true"
              :edit-config="editConfig" :checkbox-config="{ labelField: 'seq', highlight: true }">
              <vxe-column type="checkbox" field="seq" width="120">
                <template #footer="{ row }">
                  <span style="color: blue;">{{ row.seq }}</span>
                </template>
              </vxe-column>
              <vxe-column field="name" title="产品名称" align="center" width="200">
              </vxe-column>
              <vxe-column field="region" title="区域" width="100"></vxe-column>
              <vxe-column field="categoryName" title="所属品类" width="150"></vxe-column>
              <vxe-column title="设备图标" width="100">
                <template #default="{ row }">
                  <el-image v-if="row.iconUrl" style="width: 30px; height: 30px;border-radius: 2px;"
                    :src="baseUrl + row.iconUrl" :preview-src-list="[baseUrl + row.iconUrl]"> </el-image>
                  <span v-else>--</span>
                </template>
              </vxe-column>
              <vxe-column field="brand" title="品牌名称" width="100"></vxe-column>
              <vxe-column width="140" field="price" title="单价(元)" :edit-render="{ autoFocus: true }">
                <template #edit="{ row }">
                  <vxe-number-input @change="updateFootEvent" :min="0" v-model.number="row.price" align="center"
                    type="integer"></vxe-number-input>
                </template>
              </vxe-column>
              <vxe-column width="140" field="discountPrice" title="折扣价(元)" :edit-render="{ autoFocus: true }">
                <template #edit="{ row }">
                  <vxe-number-input @change="updateFootEvent" :min="0" v-model.number="row.discountPrice" align="center"
                    type="integer"></vxe-number-input>
                </template>
              </vxe-column>
              <vxe-column width="100" field="num" title="数量" :edit-render="{ autoFocus: true }">
                <template #edit="{ row }">
                  <vxe-number-input @change="updateFootEvent" :min="1" v-model.number="row.num" align="center"
                    type="integer"></vxe-number-input>
                </template>
              </vxe-column>
              <vxe-column field="unit" title="单位" width="60px"></vxe-column>
              <vxe-column title="小计" width="100">
                <template #default="{ row }">
                  <span v-if="row.discountPrice">{{ row.discountPrice * row.num }}</span>
                  <span v-else>{{ row.price * row.num }}</span>
                </template>
                <template #footer="{ row }">
                  <span style="color: red;">￥{{ row.sunNum }}元</span>
                </template>
              </vxe-column>
              <vxe-column field="introduction" title="产品介绍" min-width="200"></vxe-column>
            </vxe-table> -->

          </el-col>
        </el-row>
        <img style="width: 40%;opacity: 0;position: absolute;" ref="imgRef" :src="imageUrl" alt="">
      </el-tab-pane>
      <el-tab-pane label="点位图" name="2">
        <div style="position: relative;">
          <img style="width: 40%;" :src="imageUrl" alt="">
          <img v-for="(item, index) in productSelections" @click="openDetail(item)" :key="index"
            :src="baseUrl + item.iconUrl"
            :style="{ 'width': item.w + 'px', 'height': item.h + 'px', 'top': item.y + 'px', 'left': item.x + 'px', 'background': 'rgb(255, 0, 0, 0)', 'position': 'absolute', 'border': '2px solid #5182D5' }" />
        </div>
      </el-tab-pane>

    </el-tabs>


    <!-- 添加或修改产品配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" :append-to-body="true">
      <el-form :model="form" :rules="rules" ref="userRef" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="产品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入产品昵称" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="产品图标" prop="iconUrl">
              <ImageUpload :isShowTip="true" :limit="1" v-model="form.iconUrl"></ImageUpload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="所属品类" prop="categoryId">
              <el-tree-select v-model="form.categoryId" :data="enabledCategoryOptions"
                :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }" value-key="categoryId"
                placeholder="选择上级品类" check-strictly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属品牌">
              <el-select v-model="form.brand" placeholder="所属品牌" filterable allow-create default-first-option clearable
                style="width: 240px">
                <el-option v-for="dict in sys_brand_name" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="产品价格" prop="price">
              <el-input v-model="form.price" placeholder="请输入价格" type="number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成本价格" prop="costPrice">
              <el-input v-model="form.costPrice" placeholder="请输入成本价格" type="number" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="form.unit" placeholder="请输入单位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="介绍" prop="introduction">
              <el-input v-model="form.introduction" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>


    <el-drawer v-model="drawer" title="设备信息" direction="rtl" body-class="device_drawer" size="40%">
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


    <!-- 添加或修改产品配置对话框 -->
    <el-dialog title="建议优化" v-model="aiOpen" width="600px" :append-to-body="true">
      <div v-html="aiResult"></div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="aiOpen = false">确 定</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="projectManagement_detials">
import axios from 'axios'
import { getToken } from "@/utils/auth"
import useAppStore from '@/store/modules/app'
import { listCategory } from "@/api/system/category"
import { projectManagement_detils, editProduct, getShare, updateProjectManagement } from "@/api/projectManagement"
import { callApi } from "@/api/other"

const { proxy } = getCurrentInstance()
const { sys_brand_name } = proxy.useDict("sys_brand_name")


import { Splitpanes, Pane } from "splitpanes"
import "splitpanes/dist/splitpanes.css"
const baseUrl = ref(import.meta.env.VITE_APP_VIEW_IMG_URL) // 图片预览地址
const shareUrl = ref(import.meta.env.VITE_APP_SHARE_URL) // 跳转地址
const router = useRouter()
const appStore = useAppStore()


const productList = ref([])
const productListCopy = ref([])
const open = ref(false)
const aiOpen = ref(false)
const aiResult = ref('')
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

import { useRoute } from 'vue-router'
const route = useRoute()

const imgRef = ref(null);
const tableRef = ref()
const serviceCharge = ref(1000)
const categoryList = ref([])
const activeName = ref('1')
const scaleNum = ref(1)
const imageUrl = ref('')
const productSelections = ref([])
const drawer = ref(false)
const deviceInfo = ref({})
const jsonDataJson = ref({})

import QrcodeVue from 'qrcode.vue'
import html2canvas from 'html2canvas';
const qrcodeCanvas = ref < HTMLCanvasElement | null > (null);
const dialog_share = ref(false)
const share_url = ref('https://example.com/share?room=123456')


const order = ['玄关', '客厅', '餐厅', '厨房', '主卧', '客卧', '老人房', '儿童房', '次卧', '书房', '卫生间', '阳台', '走廊', '楼梯', '费用项']

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
    price: [
      { required: true, message: "产品价格不能为空", trigger: "blur" }
    ],
    costPrice: [
      { required: true, message: "成本价格不能为空", trigger: "blur" }
    ],
    // brand: [
    //   { required: true, message: "请选择所属品牌", trigger: "change" }
    // ]
  }
})
const footerData = ref([
  { seq: '项目金额合计', sunNum: 0, type: 1, },
  { seq: '项目成本价', sunNum: 0, type: 2, },
  { seq: '折扣后金额合计', sunNum: 1000, type: 3, },
])
const editConfig = reactive({
  trigger: 'dblclick',
  mode: 'cell'
})
const discountRate = ref(100)

const { form, queryParams, formCopy, rules } = toRefs(data)

/** 搜索按钮操作 */
function handleQuery () {
  if (queryParams.value.categoryName) {
    productList.value = productListCopy.value.filter(item => item.states[0].style.device.categoryName === queryParams.value.categoryName);
    updateFootEvent()
  }
}
/** 重置按钮操作 */
function resetQuery () {
  proxy.resetForm("queryRef")
  productList.value = productListCopy.value
  updateFootEvent()
}
const handleDelete = async () => {
  const $table = tableRef.value
  if ($table) {
    const selectRecords = $table.getCheckboxRecords()
    if (selectRecords.length > 0) {
      productList.value = productList.value.filter(item => !selectRecords.some(row => row._X_ROW_KEY === item._X_ROW_KEY))
      productListCopy.value = productListCopy.value.filter(item => !selectRecords.some(row => row._X_ROW_KEY === item._X_ROW_KEY))
      // removeRecords.push(...selectRecords)
    } else {
      proxy.$modal.msgWarning("请选择一条数据进行操作")
    }
  }
}

/** 下载二维码 */
const downloadQRCode = () => {
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
function getValueByPath (obj, path) {
  if (path) {
    const keys = path.split('.').flatMap(key => {
      const match = key.match(/(\w+)\[(\d+)\]/);
      if (match) {
        return [match[1], parseInt(match[2], 10)];
      }
      return [key];
    });
    let current = obj;
    for (const key of keys) {
      if (current == null) {
        return undefined;
      }
      current = current[key];
    }
    return current;
  } else {
    return undefined;
  }
}
// 通用行合并函数（将相同多列数据合并为一行）
const mergeRowMethod = ({ row, _rowIndex, column, visibleData }) => {
  const fields = ['states[0].style.device.region']
  // console.log(row.states[0].style.device.region, 'column.field');

  const cellValue = getValueByPath(row, column.field)

  if (cellValue && fields.includes(column.field)) {
    const prevRow = visibleData[_rowIndex - 1]
    let nextRow = visibleData[_rowIndex + 1]
    if (prevRow && getValueByPath(prevRow, column.field) === cellValue) {

      return { rowspan: 0, colspan: 0 }
    } else {
      let countRowspan = 1
      while (nextRow && getValueByPath(nextRow, column.field) === cellValue) {
        nextRow = visibleData[++countRowspan + _rowIndex]
      }
      if (countRowspan > 1) {
        return { rowspan: countRowspan, colspan: 1 }
      }
    }
  }
}

const handleClick = (tab, event) => {
  preservation()
  if (tab.index == '1') {
    getJson()
    // imageUrl.value = jsonDataJson.value.screen[0].src
    // productSelections.value = jsonDataJson.value.screen[0].objects.map(item => item.states[0].style.device)
  }
}

// const ShareFun = () => {
//   preservation()
//   setTimeout(() => {
//     getShare({ projectsId: route.query.id }).then(response => {
//       share_url.value = 'https://yilaxcx.openhola.com?shareCode=' + response.data
//       dialog_share.value = true
//     })
//   }, 1000)
// }

/** 修改按钮操作 */
function handleUpdate (row) {
  const $table = tableRef.value
  if ($table) {
    $table.refreshColumn()
    const selectRecords = $table.getCheckboxRecords()
    if (selectRecords.length !== 1) {
      proxy.$modal.msgWarning("请选择一条数据进行修改")
      return
    }
    reset()
    form.value = selectRecords[0].states[0].style.device
    open.value = true
    title.value = "修改产品"
  }
}
function extractCategories (productList) {
  return [...new Set(productList.map(item => item.states[0].style.device.categoryName))];
}

/** 查询产品列表 */
function getList () {
  loading.value = true

  projectManagement_detils(route.query.id).then(res => {
    loading.value = false
    jsonDataJson.value = JSON.parse(res.data.jsonData)
    productList.value = JSON.parse(res.data.jsonData).screen[0].objects
    productListCopy.value = JSON.parse(res.data.jsonData).screen[0].objects
    discountRate.value = res.data.discountRate || 100
    // productList.value = JSON.parse(JSON.stringify(res.data.productSelections))
    // productListCopy.value = JSON.parse(JSON.stringify(res.data.productSelections))
    // categoryList.value = res.data.productSelections
    // productListCopy.value = extractDevicesFromScreenConfig(JSON.parse(res.data.jsonData))
    // productList.value = extractDevicesFromScreenConfig(JSON.parse(res.data.jsonData))
    // categoryList.value = extractCategories(JSON.parse(JSON.stringify(productList.value)))
    productList.value.sort((a, b) => {
      if (a.states[0].style.device.region < b.states[0].style.device.region) return -1;
      if (a.states[0].style.device.region > b.states[0].style.device.region) return 1;
      return 0;
    });
    // let obj = {
    //   name: '服务费',
    //   iconUrl: '/profile/upload/2025/12/19/微信图片_20251219124420_260_750_20251219125415A003.png',
    //   categoryName: '其他项',
    //   brand: '--',
    //   price: 0,
    //   projectsId: Number(route.query.id),
    //   categoryId: 2043,// 目前写死的
    //   discountPrice: 0,
    //   num: 1,
    //   unit: '元',
    //   introduction: '服务费',
    //   region: '服务费'
    // }


    // let obj = {
    //   "id": "61cyRDYT",
    //   "name": "设备",
    //   "type": "object",
    //   "component": {
    //     "name": "customWidgetImage",
    //     "title": "设备"
    //   },
    //   "stateIndex": 0,
    //   "states": [
    //     {
    //       "src": "http://192.168.0.103:8080/profile/upload/2025/11/17/temp_1763369775984_20251117165615A106.png",
    //       "style": {
    //         "backgroundColor": "rgba(0,0,0,0)",
    //         "borderWidth": 3,
    //         "borderStyle": "solid",
    //         "borderColor": "#5182D5",
    //         "objectFit": "fill",
    //         "device": {
    //           name: '服务费',
    //           iconUrl: '/profile/upload/2025/12/19/微信图片_20251219124420_260_750_20251219125415A003.png',
    //           categoryName: '其他项',
    //           brand: '--',
    //           price: 0,
    //           projectsId: Number(route.query.id),
    //           categoryId: 2043,// 目前写死的
    //           discountPrice: 0,
    //           num: 1,
    //           unit: '元',
    //           introduction: '服务费',
    //           region: '服务费'
    //         }
    //       },
    //       "name": "默认状态"
    //     }
    //   ],
    //   "x": 458.7856035481228,
    //   "y": 306.78,
    //   "w": 50,
    //   "h": 50,
    //   "angle": 0,
    //   "locked": false,
    //   "visible": true,
    //   "events": {
    //     "enable": false
    //   },
    //   "requests": {
    //     "type": "static",
    //     "url": "",
    //     "method": "GET",
    //     "params": "",
    //     "header": "",
    //     "internal": 0,
    //     "dataFilter": ""
    //   },
    //   "opacity": 1,
    //   "rotate": false,
    //   "duration": 3,
    //   "reverse": false,
    //   "skewAngle": "rotating",
    //   "filter": {
    //     "enable": false,
    //     "hueRotate": {
    //       "enable": false,
    //       "value": 0
    //     },
    //     "contrast": {
    //       "enable": false,
    //       "value": 100
    //     },
    //     "saturate": {
    //       "enable": false,
    //       "value": 100
    //     },
    //     "brightness": {
    //       "enable": false,
    //       "value": 100
    //     },
    //     "grayscale": {
    //       "enable": false,
    //       "value": 0
    //     }
    //   },
    //   "dataFieldMap": [
    //     {
    //       "fieldName": "src",
    //       "fieldAlias": "",
    //       "fieldDesc": "文本",
    //       "dataType": "string"
    //     }
    //   ],
    //   "data": []
    // }
    // productList.value.push(obj)
    // productListCopy.value.push(obj)
    customSort()
    categoryList.value = extractCategories(productList.value)
    footerData.value[0].sunNum = productList.value.reduce((sum, item) => sum + (item.states[0].style.device.discountPrice ? item.states[0].style.device.discountPrice : item.states[0].style.device.price) * item.states[0].style.device.num, 0);
    footerData.value[1].sunNum = productList.value.reduce((sum, item) => sum + (item.states[0].style.device.discountPrice ? item.states[0].style.device.discountPrice : (item.states[0].style.device.costPrice || 0)) * item.states[0].style.device.num, 0);
    footerData.value[2].sunNum = footerData.value[0].sunNum * discountRate.value / 100;
    let jsonData = JSON.parse(res.data.jsonData)
    imageUrl.value = jsonData.config.backgroundImage

    if (imgRef.value) {
      setTimeout(() => {
        let width = 0;
        width = imgRef.value.clientWidth;
        // scaleNum.value = width / (jsonData.config.width + 400);
        scaleNum.value = width / (jsonData.config.width);
        console.log('盒子宽度:', width);
        productSelections.value = extractDevicesFromScreenConfig(
          jsonData,
          scaleNum.value
        )
      }, 1000)
    }
  })
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
      const regionA = a.device.states[0].style.device.region;
      const regionB = b.device.states[0].style.device.region;
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


function customSort () {
  productList.value = sortDevicesByRegion(productList.value);
  productListCopy.value = sortDevicesByRegion(productListCopy.value);
  console.log(productList.value, 123);

}


function getJson () {
  loading.value = true
  projectManagement_detils(route.query.id).then(res => {
    loading.value = false
    let jsonData = JSON.parse(res.data.jsonData)
    productSelections.value = extractDevicesFromScreenConfig(
      jsonData,
      scaleNum.value
    )
  })
}
const preservation = () => {
  let arr = JSON.parse(JSON.stringify(productList.value))
  let productSelections = []
  arr.forEach(item => {
    delete item._X_ROW_KEY
    item.states[0].style.device.projectsId = Number(route.query.id)
    productSelections.push(item.states[0].style.device)
  })
  // console.log(productSelections, arr, 'productSelections');
  productSelections.forEach(item => {
    item.categoryIds = null
    item.companyIds = null
    item.createBy = null
    item.updateBy = null
  })
  editProduct(productSelections).then(res => {
    jsonDataJson.value.screen[0].objects = arr
    updateProjectManagement({
      id: route.query.id,
      jsonData: JSON.stringify(jsonDataJson.value),
      discountRate: discountRate.value
    }).then(response => {
      proxy.$modal.msgSuccess("保存成功")
    })
  })
}

const ShareFun = () => {
  preservation()
  setTimeout(() => {
    getShare({ projectsId: route.query.id }).then(response => {
      const fullUrl = shareUrl.value + '/projectManagement_detials_share?code=' + response.data;
      copyToClipboard(`【易拉报价】${fullUrl}   ，请点击链接查看您的智能家居报价`)
    })
  }, 800)
}

const analyzeTheQuotation = () => {
  preservation()
  setTimeout(() => {
    console.log(productSelections.value, 123);

    callApi({
      text: JSON.stringify(productSelections.value)
    }).then(res => {
      let data = res.data
      let arr = data.split('event: message')
      let newArr = arr.slice(1);
      let a = []
      newArr.forEach((item, index) => {
        item = item.substring(6); // 去掉前面的6个字符（"data: "）
        item = JSON.parse(item);
        a.push(item)
        // item = JSON.parse(item);
      })
      console.log(a, 234);
      const answers = a.filter(item => item.type === "answer");
      answers.sort((a, b) => a.sequence_id - b.sequence_id);
      const result = answers.map(item => item.content.answer).join('');
      // console.log(result, 223);
      aiResult.value = result
      aiOpen.value = true

    })
    // axiosPostWithToken(
    //   'https://38w3cjhmzc.coze.site/stream_run', // 请求地址
    //   {
    //     content: {
    //       query: {
    //         prompt: [
    //           {
    //             type: "text",
    //             content: {
    //               text: "123"
    //             }
    //           }
    //         ]
    //       }
    //     },
    //     type: "query",
    //     project_id: 7588537592594513920
    //   },              // 请求体数据
    // );
  }, 800)
}

function copyToClipboard (text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      proxy.$modal.msgSuccess("报价链接复制成功，请在微信中粘贴转发")
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
  proxy.$modal.msgSuccess("报价链接复制成功，请在微信中粘贴转发")
}


// 在值发生改变时更新表尾合计
const updateFootEvent = () => {
  const $table = tableRef.value
  if ($table) {
    // footerData.value[0].sunNum = productList.value.reduce((sum, item) => sum + (item.discountPrice ? item.discountPrice : item.price) * item.num, 0);
    footerData.value[0].sunNum = productList.value.reduce((sum, item) => sum + (item.states[0].style.device.discountPrice ? item.states[0].style.device.discountPrice : item.states[0].style.device.price) * item.states[0].style.device.num, 0)
    footerData.value[1].sunNum = productList.value.reduce((sum, item) => sum + (item.states[0].style.device.discountPrice ? item.states[0].style.device.discountPrice : (item.states[0].style.device.costPrice || 0)) * item.states[0].style.device.num, 0);
    footerData.value[2].sunNum = footerData.value[0].sunNum * discountRate.value / 100;
  }
}
/** 新增按钮操作 */
function handleAdd () {
  const $table = tableRef.value
  $table.reloadData(productList.value)
  reset()
  open.value = true
  title.value = "添加产品"
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



function extractDevicesFromScreenConfig (screenConfig, scaleNum) {
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
                    projectsId: Number(route.query.id),
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
/** 提交按钮 */
function submitForm () {
  proxy.$refs["userRef"].validate(valid => {
    if (valid) {
      const $table = tableRef.value
      const selectRecords = $table.getCheckboxRecords()
      if (selectRecords.length === 1) {
        // $table.setEditRow(form.value)
        updateFootEvent()
        customSort()
        proxy.$modal.msgSuccess("编辑成功")
        open.value = false
      } else {
        // productList.value.push({
        //   ...form.value,
        //   categoryId: 1,
        //   projectsId: Number(route.query.id),
        //   categoryName: '用户自定义',
        //   region: '其他',
        //   num: 1,
        //   discountPrice: 0,
        // })
        // let obj = {
        //   "id": "61cyRDYT",
        //   "name": "设备",
        //   "type": "object",
        //   "component": {
        //     "name": "customWidgetImage",
        //     "title": "设备"
        //   },
        //   "stateIndex": 0,
        //   "states": [
        //     {
        //       "src": "http://192.168.0.103:8080/profile/upload/2025/11/17/temp_1763369775984_20251117165615A106.png",
        //       "style": {
        //         "backgroundColor": "rgba(0,0,0,0)",
        //         "borderWidth": 3,
        //         "borderStyle": "solid",
        //         "borderColor": "#5182D5",
        //         "objectFit": "fill",
        //         "device": {
        //           name: '服务费',
        //           iconUrl: '/profile/upload/2025/12/19/微信图片_20251219124420_260_750_20251219125415A003.png',
        //           categoryName: '其他项',
        //           brand: '--',
        //           price: 0,
        //           projectsId: Number(route.query.id),
        //           categoryId: 2043,// 目前写死的
        //           discountPrice: 0,
        //           num: 1,
        //           unit: '元',
        //           introduction: '服务费',
        //           region: '服务费'
        //         }
        //       },
        //       "name": "默认状态"
        //     }
        //   ],
        //   "x": 458.7856035481228,
        //   "y": 306.78,
        //   "w": 50,
        //   "h": 50,
        //   "angle": 0,
        //   "locked": false,
        //   "visible": true,
        //   "events": {
        //     "enable": false
        //   },
        //   "requests": {
        //     "type": "static",
        //     "url": "",
        //     "method": "GET",
        //     "params": "",
        //     "header": "",
        //     "internal": 0,
        //     "dataFilter": ""
        //   },
        //   "opacity": 1,
        //   "rotate": false,
        //   "duration": 3,
        //   "reverse": false,
        //   "skewAngle": "rotating",
        //   "filter": {
        //     "enable": false,
        //     "hueRotate": {
        //       "enable": false,
        //       "value": 0
        //     },
        //     "contrast": {
        //       "enable": false,
        //       "value": 100
        //     },
        //     "saturate": {
        //       "enable": false,
        //       "value": 100
        //     },
        //     "brightness": {
        //       "enable": false,
        //       "value": 100
        //     },
        //     "grayscale": {
        //       "enable": false,
        //       "value": 0
        //     }
        //   },
        //   "dataFieldMap": [
        //     {
        //       "fieldName": "src",
        //       "fieldAlias": "",
        //       "fieldDesc": "文本",
        //       "dataType": "string"
        //     }
        //   ],
        //   "data": []
        // }
        // obj.states[0].style.device = {
        //   ...form.value,
        //   categoryId: 1,
        //   projectsId: Number(route.query.id),
        //   categoryName: '用户自定义',
        //   region: '其他',
        //   num: 1,
        //   discountPrice: 0,
        // }
        // productListCopy.value.push(obj)
        // productList.value.push(obj)
        // categoryList.value = extractCategories(JSON.parse(JSON.stringify(productListCopy.value)))
        categoryList.value = extractCategories(productListCopy.value)
        updateFootEvent()
        customSort()
        proxy.$modal.msgSuccess("新增成功")
        open.value = false
      }
    }
  })
}

onMounted(() => {
  getDeptTree()
  setTimeout(() => {
    getList()
  }, 1500)
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
