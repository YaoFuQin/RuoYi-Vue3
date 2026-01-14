<template>
  <div>
    <visui-tabs v-model="activeType" :list="flexTabs" full></visui-tabs>

    <template v-if="activeType === 'style'">
      <visui-item label="设备图片" class="mt-16">
        <visui-select-image v-model="state.src" @open="handleOpenImg" @input="handleStatePreview"
          @change="handleStateChange"></visui-select-image>
      </visui-item>
      <template v-if="isShow">
        <visui-item label="设备名称">
          <visui-input v-model="state.style.device.name" @change="handleStateChange" />
        </visui-item>
        <visui-item label="设备位置">
          <div style="display: flex;">
            <visui-select v-model="state.style.device.region" allow-create class="full-width" filterable
              @change="handleStateChange">
              <visui-option v-for="item in region_list" :key="item.value" :label="item.label" :value="item.value" />
            </visui-select>
            <div style="margin-left: 5px;">
              <el-tooltip class="box-item" effect="light" content="输入可自定义添加房间" placement="top-start">
                <el-icon size="26">
                  <CirclePlus />
                </el-icon>
              </el-tooltip>

            </div>
          </div>
        </visui-item>
        <visui-item label="设备数量">
          <visui-input-number suffix="台" v-model="state.style.device.num" @change="handleStateChange" />
        </visui-item>
        <visui-item label="设备价格">
          <visui-input-number suffix="元" v-model="state.style.device.price" @change="handleStateChange" />
        </visui-item>
        <visui-item label="成本价格">
          <visui-input-number suffix="元" disabled v-model="state.style.device.costPrice" :min="0"
            @change="handleStateChange" />
        </visui-item>
        <!-- <visui-item label="设备折扣">
          <visui-input-number suffix="%" v-model="state.style.device.discountPrice" @change="handleStateChange" />
        </visui-item> -->
        <visui-item label="备注">
          <visui-input v-model="state.style.device.remark" type="textarea" @change="handleStateChange" />
        </visui-item>
      </template>
      <!-- <visui-item label="图片适应">
        <visui-select v-model="state.style.objectFit" class="full-width" @change="handleStateChange">
          <visui-option v-for="item in fitTypes" :key="item.value" :label="item.label" :value="item.value" />
        </visui-select>
      </visui-item> -->
      <!-- <visui-item label="边框宽度">
        <visui-input-number suffix="px" v-model="state.style.borderWidth" @change="handleStateChange" />
      </visui-item>
      <visui-item label="边框类型">
        <visui-select v-model="state.style.borderStyle" class="full-width" @change="handleStateChange">
          <visui-option v-for="item in borderTypes" :key="item.value" :label="item.label" :value="item.value" />
        </visui-select>
      </visui-item>
      <visui-item label="边框颜色">
        <visui-select-color v-model="state.style.borderColor" @recover="handleStateRecover" @input="handleStatePreview"
          @change="handleStateChange" />
      </visui-item> -->
      <!-- <visui-item label="透明度">
        <visui-slider class="opacity" :min="0" :max="100" :step="1" v-model="computedOpacity" show-input
          controls-position="right" suffix="%" :format-tooltip="formatRate"
          @change="handleAttrsChange(['opacity'], node, true)" />
      </visui-item> -->
      <!-- <visui-item label="背景颜色">
        <visui-select-color v-model="state.style.backgroundColor" @recover="handleStateRecover"
          @input="handleStatePreview" @change="handleStateChange" />
      </visui-item> -->
      <!-- <div class="filter-config-box single-setting-box" title="滤镜">
        <visui-item label="滤镜">
          <visui-checkbox v-model="node.filter.enable" @change="handleFilterEnableChange">启用</visui-checkbox>
        </visui-item>
        <template v-if="node.filter.enable">
          <visui-item label="色相">
            <visui-checkbox v-model="node.filter.hueRotate.enable" @change="handleFilterChange"></visui-checkbox>
            <visui-slider class="hue-rotate" :min="-180" :max="180" :step="1" v-model="node.filter.hueRotate.value"
              show-input controls-position="right" suffix="%" :format-tooltip="formatRate"
              @change="handleFilterChange" />
          </visui-item>
          <visui-item label="饱和度">
            <visui-checkbox v-model="node.filter.saturate.enable" @change="handleFilterChange"></visui-checkbox>
            <visui-slider class="saturate" :min="0" :max="200" :step="1" v-model="node.filter.saturate.value" show-input
              controls-position="right" suffix="%" :format-tooltip="formatRate" @change="handleFilterChange" />
          </visui-item>
          <visui-item label="亮度">
            <visui-checkbox v-model="node.filter.brightness.enable" @change="handleFilterChange"></visui-checkbox>
            <visui-slider class="brightness" :min="0" :max="200" :step="1" v-model="node.filter.brightness.value"
              show-input controls-position="right" suffix="%" :format-tooltip="formatRate"
              @change="handleFilterChange" />
          </visui-item>
          <visui-item label="对比度">
            <visui-checkbox v-model="node.filter.contrast.enable" @change="handleFilterChange"></visui-checkbox>
            <visui-slider class="contrast" :min="0" :max="200" :step="1" v-model="node.filter.contrast.value" show-input
              controls-position="right" suffix="%" :format-tooltip="formatRate" @change="handleFilterChange" />
          </visui-item>
          <visui-item label="灰度">
            <visui-checkbox v-model="node.filter.grayscale.enable" @change="handleFilterChange"></visui-checkbox>
            <visui-slider class="grayscale" :min="0" :max="100" :step="1" v-model="node.filter.grayscale.value"
              show-input controls-position="right" suffix="%" :format-tooltip="formatRate"
              @change="handleFilterChange" />
          </visui-item>
        </template>
</div> -->
    </template>

    <div class="single-setting-box" v-if="activeType === 'animation'">
      <visui-item label="旋转">
        <visui-switch v-model="node.rotate" @change="handleAttrsChange(['rotate'], node, true)"> </visui-switch>
      </visui-item>

      <template v-if="node.rotate">
        <visui-item label="反转" v-if="node.rotate">
          <visui-switch v-model="node.reverse" @change="handleAttrsChange(['reverse'], node, true)"> </visui-switch>
        </visui-item>
        <visui-item label="旋转时间(s)" v-if="node.rotate">
          <visui-input-number v-model="node.duration" controls-position="right"
            @change="handleAttrsChange(['duration'], node, true)"></visui-input-number>
        </visui-item>
        <visui-item label="倾斜角度" v-if="node.rotate">
          <visui-select v-model="node.skewAngle" @change="handleAttrsChange(['skewAngle'], node, true)" clearable>
            <visui-option v-for="item in angleOption" :key="item.value" :label="item.label" :value="item.value">
            </visui-option>
          </visui-select>
        </visui-item>
      </template>
    </div>

    <!-- 选择设备弹框 -->


    <visui-state-name-dialog ref="stateNameDialogRef"
      @finish="handleFinishStateNameDialog($event, node, stateNameDialogRef)"></visui-state-name-dialog>
  </div>
</template>

<script lang="ts" setup>
const componentName = 'customWidgetImageProp'
defineOptions({
  name: componentName
})
import { ref, reactive, computed, onUnmounted } from 'vue'
const baseUrl = ref(import.meta.env.VITE_APP_VIEW_IMG_URL) // 图片预览地址

import emitter from '../../../../../../../utils/eventBus'

const { proxy } = getCurrentInstance()
const { region_list } = proxy.useDict("region_list")

// @ts-ignore
import { handleAttrsChange, handleAttrsRecover, handleFinishStateNameDialog } from '../../datavis'
import { eventTypes, pageOperationTypes } from '../../../utils/eventTypes'
const props = defineProps({
  node: {
    type: Object,
    default: () => {
      return {
        stateIndex: 0,
        states: []
      }
    }
  }
})
const isShow = ref(false)
const computedOpacity = computed({
  get: () => {
    return props.node.opacity * 100
  },
  set: (val: any) => {
    props.node.opacity = val / 100
  }
})
const activeType = ref('style')
const flexTabs = [
  {
    label: '设备数据',
    value: 'style'
  },
  // {
  //   label: '样式',
  //   value: 'style'
  // },
  // {
  //   label: '动画',
  //   value: 'animation'
  // }
]

const state: any = computed(() => props.node.states[props.node.stateIndex])
const device: any = {}
const stateNameDialogRef = ref()
// const device: any = {
//   price: 0,
//   discountPrice: 0,
//   num: 1,
//   region: ''
// }

// if (state.value.style.device) {
// } else {

//   //   setTimeout(() => {
//   //     state.value.style['device'] = state.value.style.device
//   //     console.log(state.value.style.device, 'props.node=====');
//   //   }, 1000);
// }

const angleOption = [
  {
    label: '不倾斜',
    value: 'rotating'
  },
  {
    label: '45度',
    value: 'rotating_45'
  },
  {
    label: '50度',
    value: 'rotating_50'
  },
  {
    label: '55度',
    value: 'rotating_55'
  },
  {
    label: '60度',
    value: 'rotating_60'
  },
  {
    label: '65度',
    value: 'rotating_65'
  },
  {
    label: '70度',
    value: 'rotating_70'
  }
]

const borderTypes = ref([
  { value: 'solid', label: '实线' },
  { value: 'dashed', label: '虚线' }
])
const fitTypes = ref([
  { value: 'fill', label: '填充满' },
  { value: 'contain', label: '保持比例' },
  { value: 'cover', label: '剪切' }
])

const formatRate = (val: number) => {
  return `${val}%`
}

const handleFilterEnableChange = (val: boolean) => {
  props.node.filter.enable = val
  props.node.filter.hueRotate.enable = val
  props.node.filter.contrast.enable = val
  props.node.filter.saturate.enable = val
  props.node.filter.brightness.enable = val
  props.node.filter.grayscale.enable = val
  handleFilterChange()
}
const handleFilterChange = () => {
  handleAttrsChange(['filter'], props.node, true)
}
const handleStateRecover = () => {
  handleAttrsRecover(['stateIndex', 'states'], props.node)
}

const handleStateChange = () => {
  handleAttrsChange(['stateIndex', 'states'], props.node, true)
}

const handleStatePreview = () => {
  handleAttrsChange(['stateIndex', 'states'], props.node, false)
}

function onSiblingEvent(payload) {
  isShow.value = false
  console.log('兄弟事件收到：', payload)
  device.value = payload
  state.value.src = baseUrl.value + payload.iconUrl
  payload['num'] = 1
  payload['remark'] = ""
  payload['discountPrice'] = 0
  // setTimeout(() => {
  // payload['region'] = region_list.value[0].label
  payload['region'] = '其他'
  // }, 200)
  state.value.style['device'] = payload
  state.value.style['borderWidth'] = 3
  state.value.style['borderColor'] = '#5182D5'
  setTimeout(() => {
    isShow.value = true
  }, 250)
  handleStateChange()
  // console.log(state.value.style.device.name, 2020202);
}
setTimeout(() => {
  isShow.value = true
}, 250)
emitter.on('siblingEvent', onSiblingEvent)

onUnmounted(() => {
  emitter.off('siblingEvent', onSiblingEvent)
})

// 打开素材弹窗
const handleOpenImg = () => {
  props.node.editor.fire(eventTypes.pageOperation, {
    type: pageOperationTypes.imagePicker,
    data: {
      callback: ({ url }: any) => {
        handleImageChange(url)
      }
    },
    source: componentName,
    isProductImg: true
  })
}

// 切换背景图
const handleImageChange = (value: string) => {
  state.value.src = value
  handleStateChange()
}
</script>

<style lang="scss">
.filter-config-box {
  height: calc(100% - 40px);

  .visui-Item__content {
    justify-content: space-between;
  }

  .refresh-text-btn {
    float: right;
  }

  .el-slider .el-slider__bar {
    background: transparent !important;
  }

  .hue-rotate .el-slider .el-slider__runway {
    background: linear-gradient(270deg,
        #ff0129 0%,
        #ff00c4 21%,
        #0b02ff 41%,
        rgba(0, 0, 0, 0) 52%,
        #02ffc7 62%,
        #fdff00 77%,
        #ff2203 100%) !important;
    // background: linear-gradient(270deg, #02FFC7 0%, #FDFF00 21%, #FF2203 41%, #FF0129 62%, #FF00C4 77%, #0B02FF 100%) !important;
  }

  .saturate .el-slider .el-slider__runway {
    background: linear-gradient(270deg, #fd0402 0%, #6e6e6d 100%) !important;
  }

  .brightness .el-slider .el-slider__runway {
    background: linear-gradient(270deg, #f8f8f8 0%, #030303 100%) !important;
  }

  .contrast .el-slider .el-slider__runway {
    background: rgba(255, 255, 255, 0.1) !important;
  }

  .opacity .el-slider .el-slider__runway {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.4) 0%, #000000 100%) !important;
  }

  .grayscale .el-slider .el-slider__runway {
    background: rgba(255, 255, 255, 0.1) !important;
  }
}
</style>
