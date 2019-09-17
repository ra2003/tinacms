import * as React from 'react'
import { defaultBlockSchema } from './schema'
import { MarkdownTranslator } from './Translator'
import { EditorView } from 'prosemirror-view'
import { createEditorState } from './state'
let schema = defaultBlockSchema
let translator = MarkdownTranslator.fromSchema(schema, {})

export function useTinaProsemirror(input: {
  value: string
  onChange(value: string): void
}): React.RefObject<Node> {
  /**
   * A reference to the DOM Node where the prosemirror editor will be added.
   */
  const targetNode = React.useRef<Node>(null)

  React.useEffect(
    function setupEditor() {
      /**
       * Exit early if the target Node has not yet been set.
       */
      if (!targetNode.current) return

      /**
       * Create a new Prosemirror EditorView on in the DOM
       */
      let editorView = new EditorView(targetNode.current, {
        /**
         * The initial state of the Wysiwyg
         */
        state: createEditorState(schema, translator, input.value),
        /**
         * Call input.onChange with the translated content after updating
         * the Prosemiror state.
         * @param tr
         */
        dispatchTransaction(tr) {
          const nextState: any = editorView.state.apply(tr as any)

          editorView.updateState(nextState as any)

          if (tr.docChanged) {
            input.onChange(translator!.stringFromNode(tr.doc))
          }
        },
      })
      /**
       * Destroy the EditorView to prevent duplicates
       */
      return () => editorView.destroy()
    },
    /**
     * Rerender if the target Node has changed.
     */
    [targetNode.current]
  )

  return targetNode
}