<template>
  <el-form ref="pwdRef" :model="form" :rules="rules" label-width="140px">
    <el-form-item label="公司名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入公司名称(请严格根据营业执照内容填写)" />
    </el-form-item>
    <el-form-item label="公司地址" prop="address">
      <el-input v-model="form.address" placeholder="请输入公司地址" />
    </el-form-item>
    <el-form-item label="法人" prop="legalPerson">
      <el-input v-model="form.legalPerson" placeholder="请输入法人" />
    </el-form-item>
    <!-- <el-form-item label="手机号码" prop="phone">
      <el-input v-model="form.phone" placeholder="请输入手机号码" maxlength="11" />
    </el-form-item> -->
    <el-form-item>
      <el-button type="primary" v-hasPermi="['enterpriseUsers:kist']" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import router from '@/router'

import { profile_company } from "@/api/system/user"
import { setToken } from '@/utils/auth'
import useUserStore from '@/store/modules/user'
import usePermissionStore from '@/store/modules/permission'
import { isHttp } from '@/utils/validate'

const userStore = useUserStore()


const { proxy } = getCurrentInstance()

const props = defineProps({
  company: {
    type: Object
  }
})

const form = ref({
  name: undefined,
  address: undefined,
  legalPerson: undefined,
  // phone: undefined,
})

const rules = ref({
  name: [{ required: true, message: "公司名称不能为空", trigger: "blur" }, { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }],
  address: [{ required: true, message: "公司地址不能为空", trigger: "blur" }],
  legalPerson: [{ required: true, message: "法人不能为空", trigger: "blur" }, { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }],
  // phone: [{ required: true, message: "手机号码不能为空", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }]
})

/** 提交按钮 */
function submit () {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      profile_company(form.value).then(response => {
        setToken(response.token)
        proxy.$modal.msgSuccess("操作成功")
        userStore.getInfo().then(() => {
        })
        usePermissionStore()
          .generateRoutes()
          .then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                router.addRoute(route) // 动态添加可访问路由表
              }
            })
          })
        router.push({ path: "/" })
      })
    }
  })
}

// 回显当前登录用户信息
watch(() => props.company, company => {
  if (company) {
    form.value = { name: company.name, address: company.address, legalPerson: company.legalPerson }
  }
}, { immediate: true })

/** 关闭按钮 */
function close () {
  proxy.$tab.closePage()
}
</script>
