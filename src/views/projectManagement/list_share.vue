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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="projectList_share">
      <el-table-column label="项目名称" align="center" prop="projectName" :show-overflow-tooltip="true">
        <template #default="scope">
          <el-button link type="primary" @click="toDetails(scope.row)">{{ scope.row.projectName }}</el-button>
        </template>
      </el-table-column>
      <!-- <el-table-column label="项目地址" align="center" prop="projectAddress" :show-overflow-tooltip="true" /> -->
      <!-- <el-table-column label="项目类型" align="center" prop="projectType" :show-overflow-tooltip="true" width="150" /> -->
      <el-table-column label="结束时间" align="center" prop="createdTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.expireTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" /> -->
  </div>
</template>

<script setup name="ProjectManagement_list_share">
import { shareProjects_list } from "@/api/projectManagement"

const { proxy } = getCurrentInstance()
const { project_type } = proxy.useDict("project_type")

const projectList_share = ref([])
const loading = ref(true)
const showSearch = ref(false)
const total = ref(0)
import { useRouter } from 'vue-router'
const router = useRouter()
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 100,
    // projectName: undefined,
    // projectType: undefined,
  },
})

const { queryParams } = toRefs(data)

/** 查询项目列表 */
function getList () {
  loading.value = true
  shareProjects_list(queryParams.value).then(response => {
    projectList_share.value = response.rows
    total.value = response.total
    loading.value = false
  })
}


/** 搜索按钮操作 */
function handleQuery () {
  queryParams.value.pageNum = 1
  getList()
}

/** 进去项目分享详情 */
function toDetails (row) {
  // Cookies.set("projectId", row.id, { expires: 30 })
  router.push({ path: '/projectManagement_detials_share', query: { id: row.id } })
}


/** 重置按钮操作 */
function resetQuery () {
  proxy.resetForm("queryRef")
  handleQuery()
}

getList()
</script>
