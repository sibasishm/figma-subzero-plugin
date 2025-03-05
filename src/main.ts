import { showUI } from '@create-figma-plugin/utilities'
import { transformFigmaElement, generateCode } from './utils/transformer'
import { MessageToPlugin, MessageToUI } from './types'

export default function () {
  // Handle messages from UI
  figma.ui.onmessage = (msg: MessageToPlugin) => {
    if (msg.type === 'transform') {
      const selection = figma.currentPage.selection
      if (selection.length === 0) {
        figma.ui.postMessage({
          type: 'error',
          error: 'Please select at least one component'
        } as MessageToUI)
        return
      }

      try {
        const components = selection.map(node => transformFigmaElement(node))
          .filter((comp): comp is NonNullable<typeof comp> => comp !== null)
        const code = components.map(comp => generateCode(comp)).join('\n')

        figma.ui.postMessage({
          type: 'selection',
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
