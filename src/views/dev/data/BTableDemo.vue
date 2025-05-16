<script lang="ts" setup>
import { ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import HoverData from '@/views/project/intro/components/hoverData.vue'

const bTableRef = ref()
const inputRef = ref()

function generateColumns(length = 10, prefix = 'column-', props?: any) {
  return Array.from({ length }).map((_, columnIndex) => ({
    ...props,
    prop: `${prefix}${columnIndex}`,
    label: `Column ${columnIndex}`,
    width: 170,
    sortable: columnIndex === 1 || columnIndex === length - 1,
    align: columnIndex === length - 1 ? 'right' : 'left',
  }))
}

function generateData(columns: ReturnType<typeof generateColumns>, length = 200, prefix = 'row-') {
  return Array.from({ length }).map((_, rowIndex) => {
    return columns.reduce(
      (rowData, column, columnIndex) => {
        rowData[column.prop] = `Row ${rowIndex} - Col ${columnIndex}`
        return rowData
      },
      {
        id: `${prefix}${rowIndex}`,
        parentId: null,
      },
    )
  })
}

function tableColumnEdit(column: string, index: number) {
  bTableRef.value?.edit(column, index)
  setTimeout(() => {
    inputRef.value?.focus()
  }, 10)
}

const columns = generateColumns(5)
const data = generateData(columns, 100)
</script>

<template>
  <div class="b-table-demo">
    <h1>BTable 表格</h1>
    <p>基于 element-plus el-table 的封装，以下测试数据量 100 条。</p>

    <h2>基本用法</h2>
    <p>Column 4 列鼠标hover弹出框。</p>
    <br>
    <BTable
      :columns="columns"
      :data="data"
      :height="400"
      fixed
    >
      <template #hover-data="{ column }">
        <HoverData v-if="column.prop === 'column-4'" title="测试" :options="[{ color: 'blue', label: 'text', value: '100' }]" />
      </template>
    </BTable>

    <h2>自定义单元格渲染</h2>
    <p>列插槽名称：替换 <code>.</code> 为 <code>-</code> 的 prop 名称，例如：prop 值为 <code>column.0</code> 插槽名称则为：<code>column-0</code>。</p>
    <p>头部插槽名称：列插槽名称 + <code>-header</code>，例如：列插槽值为 <code>column-0</code> 头部插槽名称则为：<code>column-0-header</code>。</p>
    <br>
    <BTable
      ref="bTableRef"
      :columns="columns"
      :data="data"
      :height="400"
    >
      <template #column-0-header="{ column }">
        <ElTag>{{ column.label }} 自定义头部</ElTag>
      </template>

      <template #column-0="{ row, $index }">
        {{ row['column-0'] }}
        <ElButton
          type="primary" size="small" link @click="tableColumnEdit('column-0', $index)"
        >
          编辑
        </ElButton>
      </template>

      <template #column-1="{ row, $index }">
        <ElButton size="small" @click="bTableRef?.edit('column-1', $index)">
          {{ row['column-1'] }}
        </ElButton>
      </template>

      <template #hover-data="{ column }">
        <HoverData v-if="column.prop === 'column-4'" title="测试" :options="[{ color: 'blue', label: 'text', value: '100' }]" />
      </template>

      <template #edit="{ column, row }">
        <BInput2 v-if="column.prop === 'column-0'" ref="inputRef" v-model:value="row['column-0']" size="large" plain />
        <el-select v-else-if="column.prop === 'column-1'" v-model="row['column-0']" />
      </template>
    </BTable>
  </div>
</template>

<style lang="scss" scoped>
.b-table-demo {
  :deep(.b-table) {
    width: 850px;
  }
}
</style>
