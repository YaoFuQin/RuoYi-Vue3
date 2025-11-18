<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model="queryParams.projectName" placeholder="请输入项目名称" clearable style="width: 240px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="项目类型" prop="projectType">
        <el-select v-model="queryParams.projectType" placeholder="项目状态" clearable style="width: 240px">
          <el-option v-for="dict in project_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" @click="handleAdd"
          v-hasPermi="['projectManagement:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['projectManagement:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['projectManagement:remove']">删除</el-button>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="项目名称" align="center" prop="projectName" :show-overflow-tooltip="true" /> -->
      <el-table-column label="项目名称" align="center" prop="projectName" :show-overflow-tooltip="true">
        <template #default="scope">
          <el-button link type="primary" @click="toDetails(scope.row)">{{ scope.row.projectName }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="项目地址" align="center" prop="projectAddress" :show-overflow-tooltip="true" />
      <el-table-column label="项目类型" align="center" prop="projectType" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="显示排序" align="center" prop="orderNum" width="120" />
      <el-table-column label="特殊需求" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createdTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:post:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:post:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />


    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <!-- 添加或修改岗位对话框 -->

      <el-form ref="postRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目地址" prop="projectAddress">
          <el-input v-model="form.projectAddress" placeholder="请输入项目地址" />
        </el-form-item>
        <el-form-item label="项目类型" prop="projectType">
          <el-select v-model="form.projectType" placeholder="项目类型" clearable style="width: 100%">
            <el-option v-for="dict in project_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目顺序" prop="orderNum">
          <el-input-number v-model="form.orderNum" controls-position="right" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入内容"></el-input>
        </el-form-item>
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

<script setup name="ProjectManagement">
import { projectManagement_list, projectManagement_detils, delProjectManagement, addProjectManagement, updateProjectManagement } from "@/api/projectManagement"

const { proxy } = getCurrentInstance()
const { project_type } = proxy.useDict("project_type")

const projectList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
import { useRouter } from 'vue-router'
const router = useRouter()
import Cookies from "js-cookie"
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    projectName: undefined,
    projectType: undefined,
  },
  rules: {
    projectName: [
      { required: true, message: "项目名称不能为空", trigger: "blur" }
    ],
    projectAddress: [
      { required: true, message: "项目地址不能为空", trigger: "blur" }
    ],
    projectType: [
      { required: true, message: "请选择项目类型", trigger: "change" }
    ],
    orderNum: [
      { required: true, message: "项目顺序不能为空", trigger: "change" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询岗位列表 */
function getList () {
  loading.value = true
  projectManagement_list(queryParams.value).then(response => {
    projectList.value = response.rows
    total.value = response.total
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
    id: undefined,
    postCode: undefined,
    postName: undefined,
    postSort: 0,
    status: "0",
    remark: undefined
  }
  proxy.resetForm("postRef")
}

/** 搜索按钮操作 */
function handleQuery () {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery () {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange (selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length

}

/** 新增按钮操作 */
function handleAdd () {
  reset()
  open.value = true
  title.value = "添加岗位"
}

/** 修改按钮操作 */
function handleUpdate (row) {
  reset()
  const id = row.id || ids.value
  projectManagement_detils(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改岗位"
  })
}

/** 提交按钮 */
function submitForm () {
  proxy.$refs["postRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateProjectManagement(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addProjectManagement(form.value).then(response => {
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
  const delIds = row.id || ids.value
  proxy.$modal.confirm('是否确认删除岗位编号为"' + delIds + '"的数据项？').then(function () {
    return delProjectManagement(delIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport () {
  proxy.download("system/post/export", {
    ...queryParams.value
  }, `post_${new Date().getTime()}.xlsx`)
}

/** 导出按钮操作 */
function toDetails (row) {
  Cookies.set("projectId", row.id, { expires: 30 })

  router.push({ path: '/testDrag', query: { id: row.id } })
}


getList()
</script>
