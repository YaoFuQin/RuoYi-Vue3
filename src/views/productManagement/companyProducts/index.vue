<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="appStore.device === 'mobile'" class="default-theme">
        <!--c产品品类数据-->
        <pane size="16">
          <el-col>
            <div class="head-container">
              <el-input v-model="categoryName" placeholder="请输入品类名称" clearable prefix-icon="Search"
                style="margin-bottom: 20px" />
            </div>
            <div class="head-container">
              <el-tree :data="categoryOptions" :props="{ label: 'categoryName', children: 'children' }"
                :expand-on-click-node="false" :filter-node-method="filterNode" ref="deptTreeRef" node-key="categoryId"
                highlight-current :default-expand-all="false" @node-click="handleNodeClick" />
            </div>
          </el-col>
        </pane>
        <!--产品数据-->
        <pane size="84">
          <el-col>
            <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
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
              <!-- <el-form-item label="创建时间" style="width: 308px">
                <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
                  start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
              </el-form-item> -->
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleAdd"
                  v-hasPermi="['productManagement:companyProducts:add']">新增</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
                  v-hasPermi="['productManagement:companyProducts:edit']">修改</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
                  v-hasPermi="['productManagement:companyProducts:remove']">删除</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="info" plain icon="Upload" @click="handleImport"
                  v-hasPermi="['productManagement:companyProducts:import']">导入</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleExport"
                  v-hasPermi="['productManagement:companyProducts:export']">导出</el-button>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
            </el-row>

            <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="50" align="center" />
              <el-table-column label="产品名称" align="center" key="name" prop="name" v-if="columns.name.visible"
                :show-overflow-tooltip="true" />
              <el-table-column label="图标" align="center" key="iconUrl" v-if="columns.iconUrl.visible" width="120">
                <template #default="scope">
                  <div style="display: flex; align-items: center">
                    <el-image style="width: 100px; height: 100px;border-radius: 10px;"
                      :src="baseUrl + scope.row.iconUrl" :preview-src-list="[baseUrl + scope.row.iconUrl]"> </el-image>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="所属品类" align="center" key="categoryName" prop="categoryName"
                v-if="columns.categoryName.visible" :show-overflow-tooltip="true" width="120" />
              <el-table-column label="品牌名称" align="center" key="brand" prop="brand" v-if="columns.brand.visible"
                :show-overflow-tooltip="true" />
              <el-table-column label="单位" align="center" key="unit" prop="unit" width="120" v-if="columns.unit.visible"
                :show-overflow-tooltip="true" />
              <el-table-column label="价格" align="center" key="price" prop="price" width="120"
                v-if="columns.price.visible" :show-overflow-tooltip="true" />
              <el-table-column label="介绍" align="center" key="introduction" prop="introduction"
                v-if="columns.introduction.visible" :show-overflow-tooltip="true" />
              <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns.createTime.visible"
                width="160">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
                <template #default="scope">
                  <el-tooltip content="修改" placement="top">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                      v-hasPermi="['productManagement:companyProducts:edit']"></el-button>
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                      v-hasPermi="['productManagement:companyProducts:remove']"></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize" @pagination="getList" />
          </el-col>
        </pane>
      </splitpanes>
    </el-row>

    <!-- 添加或修改产品配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
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
            <el-form-item label="所属品牌" prop="brand">
              <el-select v-model="form.brand" placeholder="所属品牌" filterable clearable style="width: 240px">
                <el-option v-for="dict in sys_brand_name" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="产品价格" prop="price">
              <el-input v-model="form.price" placeholder="请输入价格" type="number" />
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

    <!-- 产品导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload ref="uploadRef" :limit="1" accept=".xlsx" :headers="upload.headers" :action="upload.url"
        :disabled="upload.isUploading" :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess"
        :on-change="handleFileChange" :on-remove="handleFileRemove" :auto-upload="false" drag>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <!-- <div class="el-upload__tip">
              <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的产品数据
            </div> -->
            <div>
              <span>仅允许导入xlsx格式文件</span>
              <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline"
                @click="importTemplate">下载模板</el-link>
            </div>
            <div class="info_box">（导入图片要浮动于单元格上并且大小和位置随单元格而变）</div>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="CompanyProducts">
import { getToken } from "@/utils/auth"
import useAppStore from '@/store/modules/app'

import { listCategory } from "@/api/system/category"
import { companyProducts_list, addCompanyProducts, updateCompanyProducts, roleCompanyProducts, delCompanyProducts } from "@/api/productManagement"

import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect } from "@/api/system/user"
import { Splitpanes, Pane } from "splitpanes"
import "splitpanes/dist/splitpanes.css"
const baseUrl = ref(import.meta.env.VITE_APP_VIEW_IMG_URL) // 图片预览地址
const router = useRouter()
const appStore = useAppStore()
const { proxy } = getCurrentInstance()
const { sys_brand_name } = proxy.useDict("sys_brand_name")

const productList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])
const categoryName = ref("")
const categoryOptions = ref([])
const enabledCategoryOptions = ref([])
const initPassword = ref(undefined)
const postOptions = ref([])
const roleOptions = ref([])
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
  url: import.meta.env.VITE_APP_BASE_API + "/productManagement/companyProducts/import"
})
// 列显隐信息
const columns = ref({
  name: { label: '产品名称', visible: true },
  iconUrl: { label: '图标', visible: true },
  categoryName: { label: '所属品类', visible: true },
  brand: { label: '品牌名称', visible: true },
  price: { label: '产品价格', visible: true },
  unit: { label: '单位', visible: true },
  introduction: { label: '介绍', visible: true },
  createTime: { label: '创建时间', visible: true },
})

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    brand: undefined,
    unit: undefined,
    categoryId: undefined
  },
  rules: {
    name: [
      { required: true, message: "产品名称不能为空", trigger: "blur" },
      { min: 2, max: 20, message: '产品名称长度必须介于 2 和 20 之间', trigger: 'blur' }
    ],
    iconUrl: [
      { required: true, message: "产品图标不能为空", trigger: "change" }
    ],
    categoryId: [
      { required: true, message: "请选择所属品类", trigger: "change" }
    ],
    brand: [
      { required: true, message: "请选择所属品牌", trigger: "change" }
    ],
    unit: [
      { required: true, message: "单位不能为空", trigger: "blur" }
    ],
    price: [
      { required: true, message: "请填写产品价格", trigger: "blur" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true
  return data.categoryName.indexOf(value) !== -1
}

/** 根据名称筛选部门树 */
watch(categoryName, val => {
  proxy.$refs["deptTreeRef"].filter(val)
})

/** 查询产品列表 */
function getList () {
  loading.value = true
  companyProducts_list(queryParams.value).then(res => {
    loading.value = false
    productList.value = res.rows
    total.value = res.total
  })
}

/** 查询部门下拉树结构 */
function getDeptTree () {
  listCategory().then(response => {
    let data = response.data
    enabledCategoryOptions.value = []
    categoryOptions.value = []
    categoryOptions.value = [{ categoryId: undefined, categoryName: '所有', children: [] }, ...proxy.handleTree(data, "categoryId")]
    enabledCategoryOptions.value = proxy.handleTree(data, "categoryId")

  })
}
/** 节点单击事件 */
function handleNodeClick (data) {
  queryParams.value.categoryId = data.categoryId
  handleQuery()
}

/** 搜索按钮操作 */
function handleQuery () {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery () {
  dateRange.value = []
  proxy.resetForm("queryRef")
  queryParams.value.categoryId = undefined
  proxy.$refs.deptTreeRef.setCurrentKey(null)
  handleQuery()
}

/** 删除按钮操作 */
function handleDelete (row) {
  const delIds = row.id || ids.value
  proxy.$modal.confirm('是否确认删除产品编号为"' + delIds + '"的数据项？').then(function () {
    return delCompanyProducts(delIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport () {
  proxy.download("system/user/export", {
    ...queryParams.value,
  }, `user_${new Date().getTime()}.xlsx`)
}

/** 产品状态修改  */
function handleStatusChange (row) {
  let text = row.status === "0" ? "启用" : "停用"
  proxy.$modal.confirm('确认要"' + text + '""' + row.userName + '"产品吗?').then(function () {
    return changeUserStatus(row.id, row.status)
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功")
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0"
  })
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
  const id = row.id
  router.push("/system/user-auth/role/" + id)
}

/** 重置密码按钮操作 */
function handleResetPwd (row) {
  proxy.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "产品密码长度必须介于 5 和 20 之间",
    inputValidator: (value) => {
      if (/<|>|"|'|\||\\/.test(value)) {
        return "不能包含非法字符：< > \" ' \\\ |"
      }
    },
  }).then(({ value }) => {
    resetUserPwd(row.id, value).then(response => {
      proxy.$modal.msgSuccess("修改成功，新密码是：" + value)
    })
  }).catch(() => { })
}

/** 选择条数  */
function handleSelectionChange (selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 导入按钮操作 */
function handleImport () {
  upload.title = "产品导入"
  upload.open = true
  upload.selectedFile = null
}

/** 下载模板操作 */
function importTemplate () {
  proxy.download("/productManagement/companyProducts/importTemplate", {
  }, `公司产品_${new Date().getTime()}.xlsx`)
}

/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true
}

/** 文件选择处理 */
const handleFileChange = (file, fileList) => {
  upload.selectedFile = file
}

/** 文件删除处理 */
const handleFileRemove = (file, fileList) => {
  upload.selectedFile = null
}

/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false
  upload.isUploading = false
  proxy.$refs["uploadRef"].handleRemove(file)
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.  + "</div>", "导入结果", { dangerouslyUseHTMLString: true })
  getList()
}

/** 提交上传文件 */
function submitFileForm () {
  const file = upload.selectedFile
  if (!file || file.length === 0 || !file.name.toLowerCase().endsWith('.xls') && !file.name.toLowerCase().endsWith('.xlsx')) {
    proxy.$modal.msgError("请选择后缀为 “xls”或“xlsx”的文件。")
    return
  }
  proxy.$refs["uploadRef"].submit()
}

/** 重置操作表单 */
function reset () {
  form.value = {
    id: undefined,
    name: undefined,
    iconUrl: undefined,
    categoryId: undefined,
    brand: undefined,
    unit: undefined,
    introduction: undefined,
  }
  proxy.resetForm("userRef")
}

/** 取消按钮 */
function cancel () {
  open.value = false
  reset()
}

/** 新增按钮操作 */
function handleAdd () {
  reset()
  open.value = true
  title.value = "添加产品"
}

/** 修改按钮操作 */
function handleUpdate (row) {
  reset()
  const id = row.id || ids.value
  roleCompanyProducts(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改产品"
  })
}

/** 提交按钮 */
function submitForm () {
  proxy.$refs["userRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateCompanyProducts(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addCompanyProducts(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

onMounted(() => {
  getDeptTree()
  getList()
  proxy.getConfigKey("sys.user.initPassword").then(response => {
    initPassword.value = response.msg
  })
})
</script>

<style lang="scss" scoped>
.info_box {
  font-weight: 600;
  background: #FDF6ED;
  color: #E6A23C;
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 5px;
}
</style>
