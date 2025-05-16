export function getParentElementByClass(dom: HTMLElement, className: string) {
  const currentClassName = dom.parentElement?.className
  const exist = typeof currentClassName === 'string' ? currentClassName.includes(className) : false
  if (exist)
    return dom.parentElement
  else if (dom.parentElement?.parentElement)
    return getParentElementByClass(dom.parentElement, className)
  else
    return null
}
/**
 * 根据 className 获取父节点，从当前节点起开始查找
 * @param dom HTMLElement
 * @param className string
 * @returns HTMLElement | null
 */
export function getElementOrParentWithClass(dom: HTMLElement, className: string): HTMLElement | null {
  // 首先检查当前元素是否包含指定的类名
  if (dom.classList.contains(className)) {
    return dom
  }
  // 如果当前元素不包含，则递归检查父元素
  return getParentElementByClass(dom, className)
}
/**
 * 将字符串中的尖括号、引号、& 移除，简单解决 xss 问题
 * @param str strin
 * @returns string
 */
export function escapeHTML(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// 定义一个类型来存储滚动状态
export interface ScrollState {
  element: HTMLElement
  overflowX: string
  overflowY: string
}

// 方法: 1/2 添加CSS规则
export function addCSSRules(rules: [string, string][]): HTMLStyleElement {
  // 创建一个新的样式表
  const styleSheet: HTMLStyleElement = document.createElement('style')
  styleSheet.type = 'text/css'
  document.head.appendChild(styleSheet)

  // 获取样式表
  const sheet: CSSStyleSheet = styleSheet.sheet as CSSStyleSheet

  // 添加规则
  rules.forEach(([selector, rule]) => {
    if (sheet.insertRule) {
      sheet.insertRule(`${selector} { ${rule} }`, sheet.cssRules.length)
    }
    else if ((sheet as any).addRule) { // addRule 是 IE 的旧方法，不建议使用
      (sheet as any).addRule(selector, rule)
    }
  })

  return styleSheet
}

// 方法: 2/2 删除CSS规则
export function removeCSSRules(styleSheet: HTMLStyleElement, rules?: [string, string][]): void {
  const sheet: CSSStyleSheet = styleSheet.sheet as CSSStyleSheet
  const cssRules: CSSRuleList = sheet.cssRules || (sheet as any).rules

  if (rules) {
    rules.forEach(([selector]) => {
      for (let i = 0; i < cssRules.length; i++) {
        const rule = cssRules[i] as CSSStyleRule
        if (rule.selectorText === selector) {
          sheet.deleteRule(i)
          break
        }
      }
    })
  }
  else {
    // 删除所有规则
    while (sheet.cssRules.length > 0) {
      sheet.deleteRule(0)
    }
  }

  // 删除样式表
  document.head.removeChild(styleSheet)
}

// 方法1/2: 向上查找，锁定滚动
export function disableScrollFromElement(element: HTMLElement): ScrollState[] {
  const scrollStates: ScrollState[] = []

  while (element) {
    const overflowY = window.getComputedStyle(element).overflowY
    const overflowX = window.getComputedStyle(element).overflowX

    if (overflowY === 'scroll' || overflowY === 'auto' || overflowX === 'scroll' || overflowX === 'auto') {
      scrollStates.push({
        element,
        overflowX,
        overflowY,
      })
      element.style.overflowY = 'hidden'
      element.style.overflowX = 'hidden'
    }
    element = element.parentElement as HTMLElement
  }

  return scrollStates
}

// 方法2/2：恢复滚动状态
export function restoreScrollState(scrollStates: ScrollState[]): void {
  scrollStates.forEach(({ element, overflowX, overflowY }) => {
    element.style.overflowY = overflowY
    element.style.overflowX = overflowX
  })
}
