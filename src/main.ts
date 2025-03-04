import { once, showUI } from '@create-figma-plugin/utilities'
import { transformFigmaElement, generateCode } from './utils/transformer'
import { InsertCodeHandler, MessageToPlugin, MessageToUI } from './types'

export default function () {
  console.clear() // Clear previous logs
  console.log('🚀 Subzero Plugin Started')

  once<InsertCodeHandler>('INSERT_CODE', function (code: string) {
    console.log('📋 Copying code:', code)
    figma.closePlugin(`Generated code: ${code}`)
  })

  // Handle selection changes
  figma.on('selectionchange', () => {
    const selection = figma.currentPage.selection
    console.log('🎯 Selection changed:', selection.length, 'items')

    if (selection.length === 0) {
      figma.ui.postMessage({
        type: 'selection',
        components: []
      } as MessageToUI)
      return
    }

    try {
      const components = selection.map(node => {
        console.log('🔄 Processing node:', node.name, node.type)
        return transformFigmaElement(node)
      }).filter((comp): comp is NonNullable<typeof comp> => comp !== null)

      console.log('✅ Transformed components:', components.length)
      figma.ui.postMessage({
        type: 'selection',
        components
      } as MessageToUI)
    } catch (error: unknown) {
      console.error('❌ Error:', error)
      figma.ui.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      } as MessageToUI)
    }
  })

  // Handle messages from UI
  figma.ui.onmessage = (msg: MessageToPlugin) => {
    console.log('📨 Received message:', msg.type)

    if (msg.type === 'transform') {
      const selection = figma.currentPage.selection
      if (selection.length === 0) return

      try {
        const components = selection.map(node => transformFigmaElement(node))
          .filter((comp): comp is NonNullable<typeof comp> => comp !== null)

        const code = components.map(comp => generateCode(comp)).join('\n')
        console.log('🎨 Generated code for', components.length, 'components')

        figma.ui.postMessage({
          type: 'selection',
          components,
          code
        } as MessageToUI)
      } catch (error: unknown) {
        console.error('❌ Error:', error)
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
