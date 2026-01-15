<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container"
      @toggleClick="toggleSideBar" />
    <breadcrumb v-if="!settingsStore.topNav" id="breadcrumb-container" class="breadcrumb-container" />
    <top-nav v-if="settingsStore.topNav" id="topmenu-container" class="topmenu-container" />

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <el-tooltip content="企业认证" effect="dark" placement="bottom" v-if="!isCompany">
          <div class="right-menu-item hover-effect theme-switch-wrapper" @click="enterpriseRegistration">
            <el-icon>
              <Stamp />
            </el-icon>
          </div>
        </el-tooltip>

        <el-tooltip content="分享" effect="dark" placement="bottom">
          <div class="right-menu-item hover-effect theme-switch-wrapper" @click="getShareCode">
            <el-icon>
              <Share />
            </el-icon>
          </div>
        </el-tooltip>
        <header-search id="header-search" class="right-menu-item" />

        <!-- <el-tooltip content="源码地址" effect="dark" placement="bottom">
          <ruo-yi-git id="ruoyi-git" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="文档地址" effect="dark" placement="bottom">
          <ruo-yi-doc id="ruoyi-doc" class="right-menu-item hover-effect" />
        </el-tooltip> -->
        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="主题模式" effect="dark" placement="bottom">
          <div class="right-menu-item hover-effect theme-switch-wrapper" @click="toggleTheme">
            <svg-icon v-if="settingsStore.isDark" icon-class="sunny" />
            <svg-icon v-if="!settingsStore.isDark" icon-class="moon" />
          </div>
        </el-tooltip>

        <!-- <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip> -->
      </template>

      <el-dropdown @command="handleCommand" class="avatar-container right-menu-item hover-effect" trigger="hover">
        <div class="avatar-wrapper">
          <img :src="userStore.avatar" class="user-avatar" />
          <span class="user-nickname"> {{ userStore.nickName }} </span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/user/profile">
              <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
            <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
              <span>布局设置</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dialog v-model="dialog_share" :show-close="true" :close-on-click-modal="false" append-to-body title="分享">
        <div class="qr-code-container">
          <div id="codeImg" ref="qrcodeCanvas"
            style="padding:30px;display:flex;flex-direction: column;align-items: center;justify-content: center;">
            <div class="link-text" style="text-align: center;">您的专属"产品库分享码"已生成，通过此二维码注册"易拉报价平台"的用户， </div>
            <div class="link-text" style="text-align: center;margin-bottom: 20px;"> 将同步获得您"公司产品库内"的所有产品信息。 </div>
            <div style="">
              <QrcodeVue :value="share_url" :size="200" level="M" />
            </div>
            <h3 style="color:#000">邀请码：{{ code }}</h3>
            <p class="link-text" style="color:#ccc">由Yila.OpenHola.com智能设计驱动!</p>
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer" style="display:flex;justify-content: center;">
            <el-button type="primary" @click="downloadQRCode">下载二维码</el-button>
            <el-button type="primary" @click="copyCode">复制邀请码</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
const { proxy } = getCurrentInstance()
import { ElMessageBox } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import HeaderSearch from '@/components/HeaderSearch'
import RuoYiGit from '@/components/RuoYi/Git'
import RuoYiDoc from '@/components/RuoYi/Doc'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import { companyProduct_getShare } from "@/api/productManagement"

const shareUrl = ref(import.meta.env.VITE_APP_SHARE_URL) // 跳转地址


const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

const dialog_share = ref(false)
import QrcodeVue from 'qrcode.vue'
import html2canvas from 'html2canvas';
const qrcodeCanvas = ref(null);
const code = ref('');
const share_url = ref('https://example.com/share?room=123456')
import Cookies from "js-cookie"
const router = useRouter()

const isCompany = ref(Cookies.get("isCompany") === "true")


function toggleSideBar () {
  appStore.toggleSideBar()
}

function handleCommand (command) {
  switch (command) {
    case "setLayout":
      setLayout()
      break
    case "logout":
      logout()
      break
    default:
      break
  }
}

function logout () {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index'
    })
  }).catch(() => { })
}

const emits = defineEmits(['setLayout'])
function setLayout () {
  emits('setLayout')
}

function toggleTheme () {
  settingsStore.toggleTheme()
}


function enterpriseRegistration () {
  router.push({ name: 'Profile', params: { activeTab: 'enterpriseCertification' } })
}


const getShareCode = () => {
  console.log('分享');
  companyProduct_getShare().then(res => {
    share_url.value = shareUrl.value + '/register?invitationCode=' + res.data
    code.value = res.data
    dialog_share.value = true
  })

  //   share_url.value = 'https://yilaxcx.openhola.com?shareCode=' + response.data
  //   dialog_share.value = true
  // })
}

/** 下载二维码 */
const downloadQRCode = () => {
  html2canvas(qrcodeCanvas.value).then((canvas) => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = '分享.png';
    link.click();
  });
}
const copyCode = () => {
  copyToClipboard(code.value)
}

function copyToClipboard (text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      proxy.$modal.msgSuccess("邀请码已复制到剪贴板！")

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
  proxy.$modal.msgSuccess("复制成功")
}
onMounted(() => {
  console.log(isCompany.value, 2222)
})
</script>

<style lang='scss' scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: var(--navbar-bg);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }

      &.theme-switch-wrapper {
        display: flex;
        align-items: center;

        svg {
          transition: transform 0.3s;

          &:hover {
            transform: scale(1.15);
          }
        }
      }
    }

    .avatar-container {
      margin-right: 0px;
      padding-right: 0px;

      .avatar-wrapper {
        margin-top: 10px;
        right: 8px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          margin-right: 8px;
          border-radius: 50%;
        }

        .user-nickname {
          position: relative;
          left: 0px;
          bottom: 10px;
          font-size: 14px;
          font-weight: bold;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
