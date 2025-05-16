import * as echarts from 'echarts/core'
import {
  DataZoomComponent,
  GridComponent,
  type GridComponentOption,
  LegendComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { BarChart, type BarSeriesOption } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'
import type { ProjectModuleListItem } from '@/api/interface'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
  UniversalTransition,
  DataZoomComponent,
  MarkPointComponent,
  LegendComponent,
  SVGRenderer,
])

type EChartsOption = echarts.ComposeOption<GridComponentOption | BarSeriesOption>

class FormatData {
  public data: ProjectModuleListItem[]
  constructor(data: ProjectModuleListItem[]) {
    this.data = data
  }

  public getData() {
    const xAxisData: string[] = []
    const completedData: number[] = []
    const todoData: number[] = []
    const emptyData: number[] = []
    this.data.forEach((item) => {
      xAxisData.push(item.workObjectName)
      const completed = (
        ((Number(item.total) - Number(item.processing)) / Number(item.total))
        * 1000
      ).toFixed(0)
      const todo = 1000 - Number(completed)
      completedData.push(Number(completed))
      todoData.push(todo)
      if (item.total === '0' && todo !== 0)
        emptyData.push(1000)
      else
        emptyData.push(0)
    })
    return { xAxisData, completedData, todoData, emptyData }
  }
}

export function useLineChart(chartDom: HTMLElement, data: any[]) {
  const { x, y } = data
  let defaultOption = null

  const dataZoomEnd = x.length <= 12 ? 100 : (12 / x.length) * 100

  const myChart = echarts.init(chartDom) || null
  const spOption: EChartsOption = { dataZoom: [] }
  const dataLen = x.length

  if (dataLen > 12) {
    spOption.dataZoom = [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        showDetail: false,
        start: 0,
        end: dataZoomEnd,
        width: 'auto',
        height: 8,
        left: 6,
        right: 4,
        bottom: 0,
        borderRadius: 0,
        borderColor: '#fff',
        brushSelect: false,
        fillerColor: '#E2E3E5',
        handleIcon: 'path://M2,0A2,2,0,1,1,-2,0A2,2,0,1,1,2,0Z',
        handleSize: '50%',
        handleStyle: {
          borderWidth: 1,
          color: '#e2e3e5',
          borderColor: '#e2e3e5',
        },
        dataBackground: {
          lineStyle: {
            opacity: 0,
          },
          areaStyle: {
            opacity: 0,
          },
        },
        selectedDataBackground: {
          lineStyle: {
            opacity: 0,
          },
          areaStyle: {
            opacity: 0,
          },
        },
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
      },
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: dataZoomEnd,
        zoomOnMouseWheel: false,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
      },
    ]
  }
  defaultOption = {
    xAxis: {
      boundaryGap: false,
      type: 'category',
      offset: 5,
      data: x,
      axisLabel: {
        formatter: '{value}',
        color: '#bfbfbf',
        fontSize: 12,
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false, // 隐藏 x 轴的线
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitNumber: 5,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#EDEEF0',
        },
      },
      axisLabel: {
        formatter: '{value} %',
        color: '#bfbfbf',
        fontSize: 12,
      },

    },
    grid: {
      left: '1%',
      right: '2%',
      bottom: '7%',
      top: '20%',
      containLabel: true,
    },
    legend: {
      itemGap: 8,
      itemHeight: 12,
      itemWidth: 12,
      data: [
        {
          name: '版本2',
          icon: 'circle',
          itemStyle: {
            color: '#1D74F5',
          },
          textStyle: {
            color: '#bfbfbf',
            fontSize: 13,
            padding: [0, -1],
          },
        },
        {
          name: '版本1',
          icon: 'circle',
          itemStyle: {
            color: '#FF9800',
          },
          textStyle: {
            color: '#bfbfbf',
            fontSize: 13,
            padding: [0, -1],
          },
        },
      ],
      right: 18,
      top: 5,
    },
    series: [
      {
        name: '版本2',
        data: y,
        lineStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            {
              offset: 0,
              color: '#7DD9FA', // 0% 处的颜色
            },
            {
              offset: 1,
              color: '#1D74F5', // 100% 处的颜色
            },
          ]),
          width: 2, // 设置线宽为 2px
        },
        symbol: 'none',
        type: 'line',
        smooth: true,
      },
      {
        name: '版本1',
        data: [10, 60, 24, 30, 45, 50, 35],
        lineStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            {
              offset: 0,
              color: '#FFDB66', // 0% 处的颜色
            },
            {
              offset: 1,
              color: '#FF9900', // 100% 处的颜色
            },
          ]),
          width: 2, // 设置线宽为 2px
        },
        symbol: 'none',
        type: 'line',
        smooth: true,
      },
    ],
  }

  const mergeOption = { ...defaultOption, ...spOption }

  myChart.setOption(mergeOption)
}

export function useCircleProgessChart(chartDom: HTMLElement, data: any) {
  const { color1, color2, val, status } = data
  const myChart = echarts.init(chartDom) || null
  let option = null
  option = {
    series: [
      {
        type: 'gauge',
        center: ['50%', '75%'],
        radius: '110%', // 调整 gauge 的半径大小
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        pointer: {
          show: false,
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 10,
            color: [[1, '#f2f3f5']],
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        title: {
          show: false,
        },
        detail: {
          width: '100%%',
          offsetCenter: [0, '-22%'],
          formatter(value: number) {
            return `{firstLine|${status}}\n{secondLine|项目进度${value}%}`
          },
          rich: {
            firstLine: {
              color: '#333',
              fontSize: 18,
              fontWeight: 'bold',
              lineHeight: 18,
            },
            secondLine: {
              color: '#999',
              fontSize: 13,
              lineHeight: 30,
            },
          },
        },
        data: [
          {
            value: val,
          },
        ],
      },
      {
        type: 'gauge',
        center: ['50%', '75%'],
        radius: '114%', // 调整 gauge 的半径大小
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        pointer: {
          show: false,
        },
        progress: {
          show: true,
          roundCap: true,
          width: 15,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              {
                offset: 0,
                color: color2,
              },
              {
                offset: 1,
                color: color1,
              },
            ]),
            shadowBlur: 10, // 模糊大小
            shadowColor: '#edeef0', // 阴影的颜
            borderWidth: 1, // 设置边框宽度
            borderColor: '#fff', // 设置边框颜色为白色
          },
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        title: {
          show: false,
        },
        detail: {
          show: false,
        },
        data: [
          {
            value: val,
          },
        ],
      },
    ],
  }

  option && myChart.setOption(option)
}

export function useBaseChart(chartDom: HTMLElement, data: ProjectModuleListItem[], option = {}) {
  const myChart = echarts.init(chartDom) || null
  const formatData = new FormatData(data).getData()
  const series: any = [
    {
      name: '已完成任务',
      type: 'bar',
      stack: 'total',
      barWidth: '16px',
      label: {
        show: false,
      },
      data: formatData.completedData,
    },
    {
      name: '待办任务',
      type: 'bar',
      stack: 'total',
      barWidth: '16px',
      label: {
        show: false,
      },
      data: formatData.todoData,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
      },
    },
    {
      name: '暂无任务',
      type: 'bar',
      stack: 'total',
      barWidth: '16px',
      label: {
        show: false,
      },
      data: formatData.emptyData,

      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        // 鼠标悬停时柱子的颜色
        emphasis: {
          color: '#EDEEF0',
        },
      },
    },
  ]

  const dataZoomEnd = data.length <= 12 ? 100 : (12 / data.length) * 100

  const initOption: EChartsOption = {
    title: {
      text: '模块任务分布图',
      left: '38%',
      textStyle: {
        color: '#333',
        fontSize: 12,
        fontWeight: 400,
      },
    },
    color: ['#00A773', '#FFAA33', '#f5f6f7'],
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      padding: [0, 0, 0, 0],
      borderWidth: 0,
      borderRadius: 8,
      confine: true,
      enterable: true,
      formatter(value: any) {
        const rawData = data[value.dataIndex]
        let result = 0
        switch (value.seriesIndex) {
          case 1:
            result = Number(rawData.processing)
            break
          case 0:
            result = Number(rawData.total) - Number(rawData.processing)
        }
        return `
          <div class="custom-echart-tooltip">
            <div class="label">${rawData.workObjectName}</div>
            <div class="value">
              <p class="circle" style="background: ${value.color}"></p>
              <p class="text">
                ${value.seriesName}
                <span>${result}</span>
              </p>
            </div>
          </div>
        `
      },
    },
    grid: {
      left: '0%',
      right: '0%',
      bottom: '3%',
      top: '14.5%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: formatData.xAxisData,
        axisLine: {
          lineStyle: {
            type: 'dashed',
            color: '#edeef0',
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          interval: 0,
          width: 70,
          lineHeight: 20,
          overflow: 'truncate',
          color: '#999999',
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          formatter() {
            return ''
          },
        },
        axisLine: {
          // y轴线条样式
          lineStyle: {
            color: '#EDEEF0',
            type: 'dashed',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#EDEEF0',
            type: 'dashed',
          },
        },
      },
    ],
    legend: {
      left: '47.5%',
      selectedMode: false,
      itemHeight: 12,
      itemWidth: 12,
      textStyle: {
        color: '#999999',
        fontSize: 12,
      },
    },
    series,
  }

  if (data.length > 12) {
    initOption.dataZoom = [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        showDetail: false,
        start: 0,
        end: dataZoomEnd,
        width: 'auto',
        height: 8,
        left: 6,
        right: 4,
        bottom: 0,
        borderRadius: 0,
        borderColor: '#fff',
        brushSelect: false,
        fillerColor: '#E2E3E5',
        handleIcon: 'path://M2,0A2,2,0,1,1,-2,0A2,2,0,1,1,2,0Z',
        handleSize: '50%',
        handleStyle: {
          borderWidth: 1,
          color: '#e2e3e5',
          borderColor: '#e2e3e5',
        },
        dataBackground: {
          lineStyle: {
            opacity: 0,
          },
          areaStyle: {
            opacity: 0,
          },
        },
        selectedDataBackground: {
          lineStyle: {
            opacity: 0,
          },
          areaStyle: {
            opacity: 0,
            color: 'red',
          },
        },
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
      },
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: dataZoomEnd,
        zoomOnMouseWheel: false,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
      },
    ]
  }
  else {
    initOption.dataZoom = [
      {
        type: 'slider',
        show: false,
      },
    ]
  }

  if (initOption && myChart)
    myChart.setOption({ ...initOption, ...option })
  // if (update) {
  //   myChart.resize();
  // }
}

export default { useBaseChart, useCircleProgessChart }
