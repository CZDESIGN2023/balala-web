<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, shallowReactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { TagItem } from '@/api/interface'
import { useSpaceStore } from '@/stores/modules/space'
import { getTextLength, splitList } from '@/utils'
import { useProjectStore } from '@/stores/modules/project'
import { createTag } from '@/api/project'
import { usePermission } from '@/hooks/usePermission'
import { Perm } from '@/enum/permission'

defineOptions({ name: 'BTag' })

const props = withDefaults(defineProps<Props>(), {
  list: () => [],
  copyList: () => [],
  spaceId: 0,
})
const emits = defineEmits(['onEdit', 'onDelete', 'onSelect', 'onRefresh'])
const projectStore = useProjectStore()
const { checkPerm } = usePermission()

const addTagVal = ref('')
const isAddTag = ref(false)
// 标签新增
const tagAddInput = ref<HTMLDivElement>()

// 当前弹框是否显示
const popupVisible = ref<boolean>(false)

interface TSTagSRt {
  selectId: string
}

const tagSRt = shallowReactive<TSTagSRt>({
  selectId: '',
})
interface Props {
  list: TagItem[]
  copyList: TagItem[]
  spaceId?: number
}
const createPermission = ref<boolean>(true)
let focusTimer: ReturnType<typeof setTimeout> | null = null
let animateTimer: ReturnType<typeof setTimeout> | null = null
let cacheKey: string
const tagListRef = ref()
const tagGrid = ref<any[]>()

const deleteDialogVisible = ref<boolean>(false)
const refList: any = reactive<HTMLDivElement[]>([])
const currentItem = ref<TagItem>()
const addTagTextAnimate = ref<boolean>(true)
watch(isAddTag, (newVal) => {
  if (newVal) {
    addTagTextAnimate.value = !newVal
    return
  }
  if (focusTimer)
    clearTimeout(focusTimer)
  if (animateTimer)
    clearTimeout(animateTimer)

  animateTimer = setTimeout(() => {
    addTagTextAnimate.value = !newVal
  }, 30)
  focusTimer = setTimeout(() => {
    tagAddInput.value?.blur()
  }, 400)
})

// 设置多个模块ref
function setItemRef(el: any, id: string | number) {
  if (el)
    refList[`tagInput${id}`] = el
}

function showArrowDot(arr: any) {
  return arr.filter((item: any) => item.id === tagSRt.selectId).length > 0
}

// 修改输入框状态
const currentIndex = ref<number[]>([])
function changeTagInputStatu(item: TagItem, index: number, arrIndex: number) {
  currentIndex.value = [arrIndex, index]
  item.readonly = false
  item.focus = true
  setTimeout(() => {
    refList[`tagInput${item.id}`].children[0].children[0].focus()
  }, 30)
}

// 恢复数据
function restoreList(item: TagItem, arrIndex: number, index: number, msg?: string) {
  if (!tagGrid.value)
    return
  const oldVal = JSON.parse(JSON.stringify(props.copyList.find(find => find.id === item.id)))
  tagGrid.value[arrIndex][index] = oldVal

  // 错误提示
  if (!msg)
    return
  message.error(msg)
}

// 输入框失焦
async function tagInputBlur(item: TagItem, arrIndex: number, index: number) {
  const length = getTextLength(item.tagName)
  const isRepeat = Boolean(props.copyList.filter(i => i.tagName === item.tagName.trim())[0])
  const filterItem = props.copyList.filter(i => i.id === item.id)[0]
  if (filterItem.tagName === item.tagName && item.tagName) {
    item.readonly = true
    item.focus = false
  }
  else if (!(length >= 2 && length <= 12) || !item.tagName) {
    restoreList(item, arrIndex, index, '请输入有效格式(2 ~ 12个字符)')
  }
  else if (isRepeat) {
    restoreList(item, arrIndex, index, '标签名称重复')
  }
  else {
    item.readonly = true
    item.focus = false
    emits('onEdit', item)
  }
}

// 输入框按下回车
function tagInputEnter(item: TagItem, isClose?: boolean) {
  setTimeout(() => {
    refList[`tagInput${item.id}`].children[0].children[0].blur()
    // 关闭右侧气泡框
    if (isClose)
      popupVisible.value = false
  }, 30)
}

// 标签删除
function deleteTag(item: TagItem) {
  currentItem.value = item
  popupVisible.value = false
  deleteDialogVisible.value = true
}

// 确认删除标签
function confirmDelete() {
  emits('onDelete', currentItem.value)
  projectStore.setTagData(cacheKey, '')
  deleteDialogVisible.value = false
}

function clearTagInput() {
  addTagVal.value = ''
}

function judgeCreatePermission(val: boolean) {
  createPermission.value = val
}

// 监听是否显示其他标签
function changePopup(visible: boolean) {
  closeEditStu(visible)
  if (!visible)
    return
  popupVisible.value = visible
}

/**
 * 控制编辑悬浮框的显示状态。
 * @param {boolean} visible - 悬浮框当前的显示状态。
 */
function closeEditStu(visible: boolean) {
  // 悬浮框为显示状态/不在编辑状态
  if (tagGrid.value?.[1].some((find: TagItem) => find.focus)) {
    popupVisible.value = true
    return
  }
  if (visible || !tagGrid.value?.[1].some((find: TagItem) => find.focus)) {
    popupVisible.value = false
    return
  }

  const arrIndex = currentIndex.value[0]
  const index = currentIndex.value[1]
  const item = tagGrid.value?.[arrIndex][index]
  tagInputEnter(item, true)
  currentIndex.value = []
}

// 点击选择
function tapItem(item: TagItem) {
  if (!item.readonly)
    return

  tagSRt.selectId = tagSRt.selectId === item.id ? '' : (item.id as string)
  updateData()
  setTagData()
}

const tagList = ref<TagItem[]>([])

function getRenderList() {
  const sideWidth = 244
  const addBtnWidth = 78
  setTimeout(() => {
    const width
      = window.innerWidth
      - (document.getElementById('projectName') as HTMLElement)?.offsetWidth
      - sideWidth
      - addBtnWidth

    tagGrid.value = splitList(props.list, width)
  }, 100)
}

watch(
  () => props.list,
  (newVal) => {
    tagList.value = JSON.parse(JSON.stringify(newVal))
    // getTagView()

    getRenderList()
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  getRenderList()
  window.addEventListener('resize', getRenderList)
})

function updateData(isChange = true) {
  emits(
    'onSelect',
    tagSRt.selectId
      ? {
          field: 'tags',
          values: [tagSRt.selectId],
          operator: 'IN',
          spaceId: '0',
        }
      : undefined,
    isChange,
  )
}

function setTagData() {
  //
  const cacheId = cacheKey.match(/\d+/)?.[0] || ''
  if (cacheId)
    window.localStorage.setItem(`projectTab${cacheId}`, 'table')

  projectStore.setTagData(cacheKey, tagSRt.selectId)
}

function setCacheData(cacheData: string) {
  cacheKey = cacheData

  tagSRt.selectId = projectStore.getTagData(cacheKey)

  updateData(false)
}

function clearOption() {
  projectStore.setTagData(cacheKey)
}

defineExpose({
  setCacheData,
  clearOption,
})

function addTagClick() {
  isAddTag.value = true
  nextTick(() => {
    tagAddInput.value?.focus()
  })
}

// 离开焦点
const isError = ref(false)
const errorTip = ref('')
async function tagAddInputBlur() {
  const length = getTextLength(addTagVal.value)
  const isRepeat = Boolean(props.copyList.filter(i => i.tagName === addTagVal.value.trim())[0])
  // 点击关闭按钮且有值时
  if (!createPermission.value && addTagVal.value) {
    addTagVal.value = ''
    isAddTag.value = false
    isError.value = false
    tagAddInput.value?.focus()
    return
  }
  if (!addTagVal.value) {
    if (isAddTag.value) {
      isAddTag.value = false
      isError.value = false
      tagAddInput.value?.focus()
    }
  }
  else if (!(length >= 2 && length <= 12)) {
    errorTip.value = '请输入有效格式(2 ~ 12个字符)'
    tagAddInput.value?.focus()
    isError.value = true
  }
  else if (isRepeat) {
    errorTip.value = '标签名称重复'
    tagAddInput.value?.focus()
    isError.value = true
  }
  else {
    isAddTag.value = false
    isError.value = false
    await createTag(props.spaceId, addTagVal.value)
    message.success('标签创建成功')
    addTagVal.value = ''
    emits('onRefresh')
  }
}

function handleTagInput() {
  isError.value = false
}

function tagPressInput() {
  setTimeout(() => {
    tagAddInput.value?.blur()
  }, 30)
}
</script>

<template>
  <div class="b-tag flex-row-start b-tag-mw">
    <div v-if="checkPerm(Perm.CreateSpaceTag)" class="flex-row-center input-wrapper" :class="{ 'wrapper-animate': isAddTag }">
      <p
        v-if="addTagTextAnimate"
        class="add-btn w66 h28 br4 pointer flex-row-center flex-shrink-0 text12 primary-color animate__animated animate__fadeIn"
        @mouseover="judgeCreatePermission(true)"
        @click="addTagClick"
      >
        添加标签
      </p>
      <a-input
        ref="tagAddInput"
        v-model:value="addTagVal"
        allow-clear
        class="tag-add-input"
        :class="{ borderRed: isError }"
        :bordered="false"
        placeholder="请输入标签内容"
        @blur="tagAddInputBlur"
        @change="handleTagInput"
        @press-enter="tagPressInput"
      >
        <template #clearIcon>
          <el-tooltip effect="dark" placement="top" :show-after="100">
            <svg-icon class="clear-close" name="task-search-clear" size="13" />
            <template #content>
              清空
            </template>
          </el-tooltip>
        </template>
      </a-input>
      <el-tooltip v-if="isAddTag" :show-after="100" effect="dark" placement="top">
        <div class="input-close flex-row-center" @click="clearTagInput" @mouseover="judgeCreatePermission(false)" @mouseleave="judgeCreatePermission(true)">
          <svg-icon name="task-search-close" size="16" color="#666" />
        </div>
        <template #content>
          取消添加
        </template>
      </el-tooltip>
      <p v-if="isError && isAddTag" class="error-tip">
        {{ errorTip }}
      </p>
    </div>

    <div v-if="tagList.length > 0" ref="tagListRef" class="list flex-row-start ml10">
      <div
        v-for="(item, index) in tagGrid && tagGrid[0]"
        :id="`${index}`"
        :key="item.id"
        :ref="(el: any) => setItemRef(el, item.id)"
        class="b-tag-item tag-item"
        :class="{
          'noPadding': item.focus,
          'is-active': tagSRt.selectId === item.id,
          'is-unvisible': item.isIntersecting,
          'is-visible': !item.isIntersecting,
        }"
        @click="tapItem(item)"
      >
        <a-dropdown
          :align="{ offset: [0, 3] }"
          :disabled="!checkPerm(Perm.ModifySpaceTag)"
          placement="bottom"
        >
          <div class="flex-row-center">
            <span v-if="item.readonly" class="ant-input ant-input-disabled flex-row-center">
              {{ item.tagName }}
            </span>
            <a-input
              v-else
              :ref="`tagInput${item.id}`"
              v-model:value="item.tagName"
              v-autowidth
              :class="{ focus: item.focus, error: item.error }"
              :bordered="false"
              @blur="tagInputBlur(item, 0, index)"
              @press-enter="tagInputEnter(item)"
            />

            <!-- <span v-if="!item.focus" class="num text12 h28 flex-row-center mt1">
              {{ Number(item.tagRelationNum) > 99 ? '99+' : item.tagRelationNum }}
            </span> -->
          </div>
          <template #overlay>
            <div
              v-if="
                !tagGrid?.[0].some((find: TagItem) => find.focus)
                  && !tagGrid?.[1].some((find: TagItem) => find.focus)
              "
              class="tag-dropdown-box flex-row-between"
            >
              <svg-icon
                class="tag-edit-icon pointer"
                name="edit-tag"
                size="16"
                color="#666666"
                @click="changeTagInputStatu(item, index, 0)"
              />
              <svg-icon
                class="tag-delete-icon pointer"
                name="delete-tag"
                size="16"
                color="#666666"
                @click="deleteTag(item)"
              />
            </div>
          </template>
        </a-dropdown>
      </div>

      <t-popup
        v-if="tagGrid && tagGrid[1].length > 0"
        content="文字提示仅展示文本内容"
        destroy-on-close
        placement="bottom-right"
        :visible="popupVisible"
        overlay-class-name="b-tag-wrap"
        :on-visible-change="changePopup"
      >
        <template #content>
          <el-scrollbar max-height="294px" always>
            <div class="more w468">
              <div class="flex-row-start flex-wrap">
                <div
                  v-for="(item, index) in tagGrid && tagGrid[1]"
                  :key="item.id"
                  :ref="(el: any) => setItemRef(el, item.id)"
                  class="b-tag-item flex-row-start"
                  :class="{
                    'noPadding': item.focus,
                    'is-active': tagSRt.selectId === item.id,
                  }"
                  @click="tapItem(item)"
                >
                  <a-dropdown
                    :align="{ offset: [0, 3] }"
                    placement="bottom"
                    :disabled="!checkPerm(Perm.ModifySpaceTag)"
                    :get-popup-container="(triggerNode: any) => triggerNode.parentNode"
                  >
                    <div class="flex-row-center">
                      <span
                        v-if="item.readonly"
                        class="ant-input ant-input-disabled flex-row-center"
                      >
                        {{ item.tagName }}
                      </span>
                      <a-input
                        v-else
                        :ref="`tagInput${item.id}`"
                        v-model:value="item.tagName"
                        v-autowidth
                        :class="{ focus: item.focus }"
                        :bordered="false"
                        @blur="tagInputBlur(item, 1, index)"
                        @press-enter="tagInputEnter(item)"
                      />
                      <!-- <span v-if="!item.focus" class="num text12 h28 flex-row-center mt1">{{
                        Number(item.tagRelationNum) > 99 ? '99+' : item.tagRelationNum
                      }}</span> -->
                    </div>
                    <template #overlay>
                      <div
                        v-if="
                          !tagGrid?.[0].some((find: TagItem) => find.focus)
                            && !tagGrid?.[1].some((find: TagItem) => find.focus)
                        "
                        class="tag-dropdown-box flex-row-between"
                      >
                        <svg-icon
                          class="tag-edit-icon pointer"
                          name="edit-tag"
                          size="16"
                          color="#666666"
                          @click.stop="changeTagInputStatu(item, index, 1)"
                        />
                        <svg-icon
                          class="tag-delete-icon pointer"
                          name="delete-tag"
                          size="16"
                          color="#666666"
                          @click.stop="deleteTag(item)"
                        />
                      </div>
                    </template>
                  </a-dropdown>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </template>
        <div class="b-tag-item arrow-item" :class="{ active: showArrowDot(tagGrid?.[1]), rotate: popupVisible }">
          <svg-icon name="arrow-b" :size="24" color="#666" />
        </div>
      </t-popup>
    </div>
    <!-- 删除标签二次确认 -->
    <b-dialog
      v-model:dialogVisible="deleteDialogVisible"
      width="448px"
      title-icon="warning.svg"
      :title="
        Number(currentItem?.tagRelationNum) > 0
          ? `<p>当前标签已关联任务 <span class='minor-color'>${currentItem?.tagRelationNum}</span> ，确认删除此标签？</p>`
          : '确认删除此标签'
      "
      confirm-btn-color="danger"
      confirm-btn-text="删除"
      @on-confirm="confirmDelete"
    />
  </div>
</template>

<style lang="scss" scoped>
.wrapper-animate {
  .tag-add-input {
    width: 240px !important;
    opacity: 1 !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}
.input-wrapper {
  width: 272px;
  height: 28px;
  position: relative;
  .error-tip {
    position: absolute;
    bottom: -25px;
    left: 0;
    color: #fd4c4c;
    font-size: 13px;
    font-weight: initial;
  }
}
.input-close {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: $tool-hover-bg;
  }
}
.tag-add-input {
  position: absolute;
  right: 35px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  opacity: 0;
  border: none;
  padding: 3px 0px;
  border-radius: 4px;
  background: rgba(29, 116, 245, 0.08);
  box-shadow: none !important;
  transition:
    width 0.4s cubic-bezier(0.4, 0, 0, 1),
    opacity 0.4s cubic-bezier(0.4, 0, 0, 1);
  &.ant-input-affix-wrapper-focused {
    border: 2px solid #1d74f5;
    background: #fff !important;
    :deep() {
      .ant-input-suffix {
        opacity: 1;
        pointer-events: auto;
      }
      .ant-input {
        color: rgba(0, 0, 0, 0.88) !important;
      }
    }
  }
  :deep() {
    .ant-input-suffix {
      opacity: 0;
      pointer-events: none;
    }
    .ant-input-clear-icon {
      color: rgba(0, 0, 0, 0.35);
      &:hover {
        color: $tool-close-icon-hover;
      }
    }
    .ant-input {
      color: #1d74f5 !important;
    }
  }
}
.borderRed {
  border: 2px solid #fd4c4c !important;
}
</style>

<style lang="scss">
.b-tag {
  // max-width: 960px;
  // min-width: 560px;
  .add-btn {
    position: absolute;
    right: 0;
    &:hover {
      background: $color-bg-hover;
    }
  }
}
.tag-dropdown-box {
  width: 64px;
  height: 32px;
  border-radius: 4px;
  padding: 8px;
  background: #ffffff;
  border: 1px solid $tool-drop-box-border;
  box-shadow: $tool-drop-box-shadow;
  position: relative;
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 1px;
    height: 14px;
    background-color: $color-border-main;
  }
}
.b-tag-item {
  width: max-content;
  height: 28px;
  font-size: 12px;
  font-weight: initial;
  color: $color-title;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  border: 1px solid $color-border-main;
  margin-right: 8px;
  // &:first-child {
  //   margin-left: 10px;
  // }
  &:last-child {
    margin-right: 0;
  }
  &.noPadding {
    padding: 0;
  }
  .num {
    color: $color-minor;
    margin-left: 4px;
  }
  .ant-input {
    width: auto;
    height: 28px;
    padding: 0 11px;
    font-size: 12px;
    text-align: center;
    border-radius: 4px;
    &.focus {
      border: 2px solid $color-primary;
      min-width: 56px !important;
      padding: 0 7.5px;
      &:hover {
        background: none;
      }
    }
    &.error {
      border: 2px solid $color-error;
      min-width: 56px !important;
      padding: 0 7.5px;
      &:hover {
        background: none;
      }
    }
    &:hover {
      background: none;
    }
    &.ant-input-disabled {
      cursor: pointer;
      color: $color-title;
    }
  }
  .t-popup__content {
    margin-bottom: 4px;
  }
  &:hover {
    background: #f5f5f5;
    border: 1px solid #f5f5f5;
  }
  &.is-active {
    background: rgba(29, 116, 245, 0.08);
    border-color: transparent;

    // .num,
    .ant-input {
      color: #1d74f5;
    }
  }
  &.noPadding {
    padding: 0;
    &:hover {
      background: none;
    }
  }
  &.arrow-item {
    width: 24px;
    height: 24px;
    padding: 0;
    margin-top: -2px;
    border: 0;
    border: 1px solid transparent;
    .svg-icon {
      transition: 0.4s;
      transition-delay: 0.1s;
    }
    &:hover {
      background: #fff;
      border: 1px solid #f7f8fa;
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.06);
      border-radius: 4px;
      .svg-icon {
        transform: rotate(180deg);
      }
    }
    &.active {
      background: rgba(29, 116, 245, 0.08);
      box-shadow: none;
      .svg-icon {
        use {
          fill: $color-primary !important;
        }
      }
      &::after {
        content: '';
        width: 6px;
        height: 6px;
        background: $color-primary;
        border-radius: 50%;
        position: absolute;
        right: -3px;
        top: -3px;
      }
    }
    &.rotate {
      .svg-icon {
        transform: rotate(180deg);
      }
    }
  }
}

.tag-edit-icon {
  &:hover {
    use {
      fill: $color-primary !important;
    }
  }
}

.tag-delete-icon {
  &:hover {
    use {
      fill: $color-error !important;
    }
  }
}

.b-tag-wrap {
  .t-popup__content {
    padding: 0;
    box-shadow: $tool-drop-box-shadow2 !important;
    border: 1px solid $tool-drop-box-border !important;
    margin-top: 7px !important;
  }
  .more {
    padding: 12px;
    padding-bottom: 4px;
    .b-tag-item {
      margin-bottom: 8px;
    }
  }
}
</style>
