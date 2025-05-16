// uno.config.ts
import { defineConfig } from 'unocss'

const directionMap = {
  t: 'top',
  r: 'right',
  b: 'bottom',
  l: 'left',
}

function createDirectionalStyle(property, dir, num) {
  const direction = directionMap[dir]
  return { [`${property}-${direction}`]: `${num}px` }
}

export default defineConfig({
  rules: [
    [/^w([.\d]+)$/, ([_, num]) => ({ width: `${num}px` })],
    [/^maxw([.\d]+)$/, ([_, num]) => ({ 'max-width': `${num}px` })],
    [/^maxwi([.\d]+)$/, ([_, num]) => ({ 'max-width': `${num}px !important` })],
    [/^h([.\d]+)$/, ([_, num]) => ({ height: `${num}px` })],
    [/^m([trbl])([.\d]+)$/, ([_, dir, num]) => createDirectionalStyle('margin', dir, num)],
    [/^p([trbl])([.\d]+)$/, ([_, dir, num]) => createDirectionalStyle('padding', dir, num)],
    [/^p([.\d]+)$/, ([_, num]) => ({ padding: `${num}px` })],
    [/^px([.\d]+)$/, ([_, num]) => ({ 'padding-left': `${num}px`, 'padding-right': `${num}px` })],
    [/^py-([.\d]+)$/, ([_, num]) => ({ 'padding-top': `${num}px`, 'padding-bottom': `${num}px` })],
    [/^text([.\d]+)$/, ([_, num]) => ({ 'font-size': `${num}px` })],
    [/^line([.\d]+)$/, ([_, num]) => ({ 'line-height': `${num}px` })],
    [/^gap([.\d]+)$/, ([_, num]) => ({ gap: `${num}px` })],
    [/^br([.\d]+)$/, ([_, num]) => ({ 'border-radius': `${num}px` })],
    [/^ty([.\d]+)$/, ([_, num]) => ({ transform: `translateY(+ ${num}px)` })],
  ],
})
