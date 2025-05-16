<script setup lang="ts">
import Sortable from 'sortablejs'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { type ScrollState, addCSSRules, disableScrollFromElement, getElementOrParentWithClass, removeCSSRules, restoreScrollState } from '@/utils/dom'

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  data: () => [],
  drag: false,
  offset: () => ({ x: 8, y: 8 }),
})

const emit = defineEmits(['dragEnd', 'dragUpdate'])

interface Column {
  sortable?: boolean
  prop: string
}

interface Props {
  columns: Column[] | null
  data: any[]
  drag?: boolean
  offset?: { x: number, y: number }
}

const bTableRef = ref()
const hoverDataRef = ref()
let lockScrollState: ScrollState[] | null
let lockScrollStyle: HTMLStyleElement | null
const state = reactive({
  hoverData: {
    row: null,
    column: null as Column | null,
    clientX: null as number | null,
    clientY: null as number | null,
  },
  editData: [] as any,
})

const hoverDataPosition = computed(() => {
  if (!hoverDataRef.value) {
    return {}
  }
  // 弹窗元素宽高
  const clientHeight = hoverDataRef.value.clientHeight
  const clientWidth = hoverDataRef.value.clientWidth
  let top = state.hoverData.clientY! + props.offset!.y
  let left = state.hoverData.clientX! + props.offset!.x
  // 弹窗元素底部、右侧位置
  const clientY = top + clientHeight
  const clientX = left + clientWidth

  // 如果元素右侧、底部超出可视区域，显示在左侧或上方
  if (clientY > window.innerHeight) {
    top = top - clientHeight - props.offset!.y * 2
  }
  if (clientX > window.innerWidth) {
    left = left - clientWidth - props.offset!.x * 2
  }
  return {
    top: `${top}px`,
    left: `${left}px`,
  }
})

const editDataLength = computed(() => state.editData.length)

watch(editDataLength, (n) => {
  if (n > 0) {
    lockScrollState = disableScrollFromElement(bTableRef.value.$el.querySelector('.el-table__body'))
    lockScrollStyle = addCSSRules([['.el-scrollbar__bar', 'opacity: 0 !important;transition: 0.3s;']])
  }
  else {
    if (lockScrollState && lockScrollStyle) {
      restoreScrollState(lockScrollState)
      lockScrollState = null
      removeCSSRules(lockScrollStyle)
      lockScrollStyle = null
    }
  }
})

onMounted(() => {
  nextTick(() => {
    if (props.drag) {
      initSortable()
    }
    // bTableRef.value.$el.addEventListener('click', cellClickEvent, { passive: true })
    bTableRef.value.$el.addEventListener('mousemove', cellMoveEvent, { passive: true })
    bTableRef.value.$el.addEventListener('mouseleave', clearHoverData, { passive: true })
  })
})

onBeforeUnmount(() => {
  // bTableRef.value.$el.removeEventListener('click', cellClickEvent)
  bTableRef.value.$el.removeEventListener('mousemove', cellMoveEvent)
  bTableRef.value.$el.addEventListener('mouseleave', clearHoverData)
})

function initSortable() {
  const tbody = bTableRef.value.$el.querySelector('.el-table__body-wrapper tbody')
  console.log(tbody)
  if (tbody) {
    Sortable.create(tbody, {
      forceFallback: true,
      animation: 400,
      dragClass: 'b-table-drag',
      chosenClass: 'b-table-chosen-row',
      handle: '.b-table-drag-btn',

      onEnd(event: Sortable.SortableEvent) {
        emit('dragEnd', event)
      //   if ((oldIndex || oldIndex === 0) && (newIndex || newIndex === 0)) {
      //     const arr = cloneDeep(props.data)
      //     const currentRow = arr && arr.splice(oldIndex, 1)[0]
      //     arr.splice(newIndex, 0, currentRow)
      //     emit('update:data', arr)
      //   }
      },
      onUpdate(event: Sortable.SortableEvent) {
        emit('dragUpdate', event)
      },
    })
  }
}

function onCellStyle({ column }: { column: any }) {
  return { width: `${column.width || column.realWidth}px` }
}

// function cellClickEvent(ev: MouseEvent) {
//   const currentData = getCurrentColumnAndRow(ev)
//   if (currentData) {
//     state.clickData.push(currentData)
//     console.log(state.clickData)
//   }
//   else {
//     clearClickData()
//   }
// }

function cellMoveEvent(ev: MouseEvent) {
  const currentData = getCurrentColumnAndRow(ev)
  if (currentData) {
    state.hoverData = currentData
  }
  else {
    clearHoverData()
  }
}

function getCurrentColumnAndRow(ev: MouseEvent) {
  const elTableRow = getElementOrParentWithClass(ev.target as HTMLElement, 'el-table__row')
  // console.log(elTableRow)
  const elTableCell = getElementOrParentWithClass(ev.target as HTMLElement, 'el-table__cell')
  // console.log(elTableCell)
  const elTableBody = getElementOrParentWithClass(ev.target as HTMLElement, 'el-table__body')
  if (elTableRow && elTableCell && elTableBody) {
    let columnIndex
    for (let i = 0; i < elTableRow.children.length; i++) {
      if (elTableRow.children[i] === elTableCell) {
        columnIndex = i
        break
      }
    }
    const tbody = elTableBody.querySelector('tbody')!.children!
    let rowIndex
    for (let i = 0; i < tbody.length; i++) {
      if (tbody[i] === elTableRow) {
        rowIndex = i
        break
      }
    }

    // console.log(`第 ${columnIndex} 列： ${props.columns[columnIndex as number].prop}， 第 ${rowIndex} 行`)
    return { column: props.columns![columnIndex as number], row: props.data[rowIndex as number], clientX: ev.clientX, clientY: ev.clientY }
  }
  return null
}

// function clearClickData() {
//   state.clickData.column = null
//   state.clickData.row = null
//   state.clickData.clientX = null
//   state.clickData.clientY = null
// }

function clearHoverData() {
  state.hoverData.column = null
  state.hoverData.row = null
  state.hoverData.clientX = null
  state.hoverData.clientY = null
}

// function clickOutside(d: Options, i: number) {
//   if (d.clickOutside === false) { componentRef.value[i]?.clickOutside?.() }
//   else {
//     const index = findItem(d)
//     if (index > -1)
//       removeItem(index)
//   }
// }

function edit(prop: string, rowIndex: number) {
  setTimeout(() => {
  // 1. 获取目标单元格 dom
    let columnIndex = 0
    const column = props.columns!.find((item, index) => {
      columnIndex = index
      return item.prop === prop
    })!
    // console.log(columnIndex, rowIndex)
    const body = bTableRef.value.$el.querySelector('.el-table__body tbody') as HTMLElement
    const rowDom = body.children[rowIndex]
    const cell = rowDom.children[columnIndex]
    // console.log(cell)

    // 2. 获取单元格位置
    const rect = cell.getBoundingClientRect()
    // console.log(rect)

    // 3. 获取行数据, 列在👆🏻有了
    const row = props.data[rowIndex]

    // 4. 向数组中插入编辑区
    state.editData.push({
      id: Date.now(),
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      column,
      row,
    })
  }, 10)
}

function clickEditOutside(editData: any) {
  const index = state.editData.findIndex((item: any) => item.id === editData.id)
  if (index > -1) {
    state.editData.splice(index, 1)
  }
}

function exitEditById(id: number) {
  const index = state.editData.findIndex((item: any) => item.id === id)
  if (index > -1) {
    state.editData.splice(index, 1)
  }
}

defineExpose({ edit, exitEditById })
</script>

<template>
  <el-table ref="bTableRef" v-bind="$attrs" :data="$props.data" :cell-style="onCellStyle" class="b-table">
    <el-table-column
      v-for="(d, index) in $props.columns" :key="d.prop" v-bind="d"
    >
      <template v-if="$slots[`${d.prop.replace(/\./g, '-')}-header`]" #header="scope">
        <slot :name="`${d.prop.replace(/\./g, '-')}-header`" v-bind="scope" />
      </template>
      <template v-else #header="scope">
        <slot name="header" v-bind="scope">
          {{ scope.column.label }}<p
            v-if="d.sortable" class=" inline-flex flex-col w13 h-full top-0 justify-center absolute"
          >
            <span class="w13 flex-row-center asc-icon">
              <svg-icon name="sort-asc" color="#bfbfbf" size="7" />
            </span>
            <span class="w13 flex-row-center desc-icon">
              <svg-icon name="sort-desc" color="#bfbfbf" size="7" />
            </span>
          </p>
        </slot>
      </template>
      <template v-if="$slots[d.prop.replace(/\./g, '-')]" #default="scope">
        <DragBtn v-if="index === 0 && $props.drag" name="b-table-drag-btn" />
        <slot :name="d.prop.replace(/\./g, '-')" v-bind="scope" />
      </template>
    </el-table-column>

    <template v-if="$slots.header" #header="scope">
      <slot name="header" v-bind="scope" />
    </template>

    <template #empty>
      <slot name="empty">
        无数据
      </slot>
    </template>
  </el-table>
  <template
    v-if="state.hoverData.column"
  >
    <Teleport to="body">
      <div
        ref="hoverDataRef"
        :style="{ top: hoverDataPosition.top, left: hoverDataPosition.left }"
        class="b-table-hover-data fixed z-50"
      >
        <slot name="hover-data" :column="state.hoverData.column" :row="state.hoverData.row" />
      </div>
    </Teleport>
  </template>

  <Teleport to="body">
    <div
      v-for="d in state.editData" :key="d.id"
      v-click-outside="() => clickEditOutside(d)"
      :style="{ left: `${d.x}px`, top: `${d.y}px`, width: `${d.width}px`, height: `${d.height}px` }"
      class="b-table__edit-container fixed z-50 bg-white"
    >
      <slot :id="d.id" :column="d.column" :row="d.row" name="edit" />
    </div>
    <Teleport to="body" />
  </teleport>
</template>

<style lang="scss">
.b-table {
  --el-table-border-color: #f2f3f5;
  --el-table-border: 1px solid var(--el-table-border-color);
  --el-table-row-hover-bg-color: rgba(24, 62, 118, 0.03);
  --el-table-header-text-color: #808080;
  --el-table-text-color: #333;
  .el-table__header-wrapper {
    font-size: 13px;
    border-top: var(--el-table-border);
    .el-table__cell {
      &.is-sortable {
        .caret-wrapper {
          width: 13px;
          height: 14px;
          opacity: 0;
          .sort-caret {
            left: 0;
          }
        }
        &.ascending .asc-icon,
        &.descending .desc-icon {
          .svg-icon {
            use {
              fill: #666666;
            }
          }
        }
      }
    }
  }
  .cell {
    line-height: 24px;
  }
}
.b-table-chosen-row {
  box-shadow: 0px -2px 0 #1d74f5;
  position: relative;
  z-index: 999;
}
.b-table-drag.el-table__row {
  opacity: 1 !important;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.06);
}
.b-table__edit-container {
  box-shadow: 0 0 0 2px #1d74f5 inset;
  // padding: 2px;
}
</style>
