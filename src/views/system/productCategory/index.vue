<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="品类名称" prop="categoryName">
        <el-input v-model="queryParams.categoryName" placeholder="请输入品类名称" @keyup.enter="handleQuery" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-sort" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:toolbarshowSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-if="refreshTable" v-loading="loading" :data="projectList" row-key="categoryId"
      :default-expand-all="isExpandAll" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column prop="categoryName" label="品类名称" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="orderNum" label="排序" width="60"></el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" icon="el-icon-plus" v-if="scope.row.level != 3"
            @click="handleAdd(scope.row)">新增</el-button>
          <el-button type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            style="color: red;">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改品类对话框 -->
    <el-dialog :title="title" v-model="open" width="680px" append-to-body>
      <el-form ref="deptRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级品类" prop="parentId">
              <el-tree-select v-model="form.parentId" :data="categoryOptions"
                :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }" value-key="categoryId"
                placeholder="选择上级品类" check-strictly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="品类名称" prop="categoryName">
              <el-input v-model="form.categoryName" placeholder="请输入品类名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number style="width: 100%;" v-model="form.orderNum" controls-position="right" :min="0" />
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
  </div>
</template>

<script setup name="ProductCategory">

import { listCategory, getCategory, delCategory, addCategory, updateCategory } from "@/api/system/category"
const { proxy } = getCurrentInstance()



const projectList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref("")
const categoryOptions = ref([])
const isExpandAll = ref(true)
const refreshTable = ref(true)


const data = reactive({
  form: {},
  queryParams: {
    categoryName: undefined
  },
  rules: {
    categoryName: [
      { required: true, message: "品类名称不能为空", trigger: "blur" }
    ],
    orderNum: [
      { required: true, message: "品类顺序不能为空", trigger: "blur" }
    ],
    path: [
      { required: true, message: "路由地址不能为空", trigger: "blur" }
    ]
  },
})

const { queryParams, form, rules } = toRefs(data)

/** 查询部门列表 */
function getList () {
  loading.value = true
  listCategory(queryParams.value).then(response => {
    projectList.value = proxy.handleTree(response.data, "categoryId")
    loading.value = false
  })
}

/** 取消按钮 */
function cancel () {
  open.value = false
  reset()
}

/** 表单重置 */
function reset () {
  form.value = {
    categoryId: undefined,
    parentId: 0,
    categoryName: undefined,
    orderNum: undefined,
  }
  proxy.resetForm("deptRef")
}

/** 搜索按钮操作 */
function handleQuery () {
  getList()
}

/** 重置按钮操作 */
function resetQuery () {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 新增按钮操作 */
function handleAdd (row) {
  reset()
  listCategory().then(response => {
    categoryOptions.value = []
    const category = { categoryId: 0, categoryName: '主类目', children: [] }
    category.children = proxy.handleTree(response.data, "categoryId")
    categoryOptions.value.push(category)

    if (row != undefined && row.categoryId) {
      form.value.parentId = row.categoryId
    } else {
      form.value.parentId = 0
    }
    open.value = true
    title.value = "添加品类"
  })

}

/** 展开/折叠操作 */
function toggleExpandAll () {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

/** 修改按钮操作 */
function handleUpdate (row) {
  reset()
  listCategory().then(response => {
    categoryOptions.value = []
    const category = { categoryId: 0, categoryName: '主类目', children: [] }
    category.children = proxy.handleTree(response.data, "categoryId")
    categoryOptions.value.push(category)
  })
  form.value.categoryId = row.categoryId
  form.value.parentId = row.parentId
  form.value.categoryName = row.categoryName
  form.value.orderNum = row.orderNum
  open.value = true
  title.value = "修改品类"
}

/** 提交按钮 */
function submitForm () {
  proxy.$refs["deptRef"].validate(valid => {
    if (valid) {
      if (form.value.categoryId != undefined) {
        updateCategory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addCategory(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete (row) {
  proxy.$modal.confirm('是否确认删除名称为"' + row.deptName + '"的数据项?').then(function () {
    return delCategory(row.categoryId)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => { })
}

getList()
</script>
