<script lang="ts" setup>
import { h } from 'vue'
import { type Column, ElButton, ElIcon, ElTag, ElTooltip, TableV2FixedDir, dayjs } from 'element-plus'
import { Timer } from '@element-plus/icons-vue'

function generateColumns(length = 10, prefix = 'column-', props?: any) {
  return Array.from({ length }).map((_, columnIndex) => ({
    ...props,
    key: `${prefix}${columnIndex}`,
    dataKey: `${prefix}${columnIndex}`,
    title: `Column ${columnIndex}`,
    width: 150,
  }))
}

function generateData(columns: ReturnType<typeof generateColumns>, length = 200, prefix = 'row-') {
  return Array.from({ length }).map((_, rowIndex) => {
    return columns.reduce(
      (rowData, column, columnIndex) => {
        rowData[column.dataKey] = `Row ${rowIndex} - Col ${columnIndex}`
        return rowData
      },
      {
        id: `${prefix}${rowIndex}`,
        parentId: null,
      },
    )
  })
}

const columns = generateColumns(10)
const data = generateData(columns, 1000)

const columns2: Column<any>[] = [
  {
    key: 'date',
    title: 'Date',
    dataKey: 'date',
    width: 150,
    fixed: TableV2FixedDir.LEFT,
    cellRenderer: ({ cellData: date }) => h(ElTooltip, {
      content: dayjs(date).format('YYYY/MM/DD'),
    }, {
      default: () => h('span', { class: 'flex items-center' }, [
        h(ElIcon, { class: 'mr-3' }, () => h(Timer)),
        dayjs(date).format('YYYY/MM/DD'),
      ]),
    }),
  },
  {
    key: 'column-0',
    title: 'Column 0',
    dataKey: 'column-0',
    width: 150,
    align: 'center',
  },
  {
    key: 'column-1',
    title: 'Column 1',
    dataKey: 'column-1',
    width: 150,
    align: 'center',
    cellRenderer: ({ cellData: name }) => h(ElTag, null, () => name),
  },
  {
    key: 'operations',
    title: 'Operations',
    cellRenderer: () => h('div', {}, [
      h(ElButton, { size: 'small' }, () => 'Edit'),
      h(ElButton, { size: 'small', type: 'danger' }, () => 'Delete'),
    ]),
    width: 150,
    align: 'center',
  },
]
</script>

<template>
  <h1>BTable 表格</h1>
  <p>基于 element-plus el-table-v2的封装，以下测试数据量 1000 条。</p>

  <h2>基本用法</h2>
  <BTable
    :columns="columns"
    :data="data"
    :width="700"
    :height="400"
    fixed
  />

  <h2>插槽、自定义单元格渲染器 用法</h2>
  <p>支持原组件 el-table-v2 的插槽，下面是自定义页脚的插槽、自定义单元格渲染。</p>
  <BTable
    :columns="columns2"
    :data="data"
    :row-height="40"
    :width="700"
    :height="400"
    :footer-height="50"
    fixed
  >
    <template #footer>
      <div
        class="flex items-center"
        style="
          justify-content: center;
          height: 100%;
          background-color: var(--el-color-primary-light-7);
        "
      >
        Display a message in the footer
      </div>
    </template>
  </BTable>
</template>
