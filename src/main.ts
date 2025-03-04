import { once, showUI } from '@create-figma-plugin/utilities'
import { transformFigmaElement, generateCode } from './utils/transformer'
import { InsertCodeHandler, MessageToPlugin, MessageToUI } from './types'

export default function () {
  once<InsertCodeHandler>('INSERT_CODE', function (code: string) {
    figma.closePlugin(`Generated code: ${code}`)
  })

  // Handle selection changes
  figma.on('selectionchange', () => {
    const selection = figma.currentPage.selection

    if (selection.length === 0) {
      figma.ui.postMessage({
        type: 'selection',
        components: []
      } as MessageToUI)
      return
    }

    try {
      const components = selection.map(node => transformFigmaElement(node))
        .filter((comp): comp is NonNullable<typeof comp> => comp !== null)

      figma.ui.postMessage({
        type: 'selection',
        components
      } as MessageToUI)
    } catch (error: unknown) {
      figma.ui.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      } as MessageToUI)
    }
  })

  // Handle messages from UI
  figma.ui.onmessage = (msg: MessageToPlugin) => {
    if (msg.type === 'transform') {
      const selection = figma.currentPage.selection
      if (selection.length === 0) return

      try {
        const components = selection.map(node => transformFigmaElement(node))
          .filter((comp): comp is NonNullable<typeof comp> => comp !== null)

        const code = components.map(comp => generateCode(comp)).join('\n')
        figma.ui.postMessage({
          type: 'selection',
          components,
          code
        } as MessageToUI)
      } catch (error: unknown) {
        figma.ui.postMessage({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        } as MessageToUI)
      }
    }
  }

  showUI({
    width: 400,
    height: 600
  })
}
