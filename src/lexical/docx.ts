import {
  IS_BOLD,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_UNDERLINE,
  IS_SUPERSCRIPT,
  IS_SUBSCRIPT,
  IS_HIGHLIGHT,
  SerializedEditorState,
} from '@payloadcms/richtext-lexical/lexical'
import { ImageRun, Paragraph, TextRun } from 'docx'

export const lexicalToDocxParagraphs = async (
  data: SerializedEditorState,
): Promise<Paragraph[]> => {
  if (!data || typeof data !== 'object' || !('root' in data)) {
    return []
  }

  const { root } = data
  if (!root?.children || !Array.isArray(root.children)) {
    return []
  }

  const docxParagraphs: Paragraph[] = []

  for (const node of root.children) {
    const paragraphsForNode = await convertNodeToDocx(node)
    docxParagraphs.push(...paragraphsForNode)
  }

  return docxParagraphs
}

const convertNodeToDocx = async (node: any): Promise<Paragraph[]> => {
  switch (node.type) {
    case 'paragraph':
      return [convertParagraphNode(node)]
    case 'text':
      return [
        new Paragraph({
          children: [convertTextNode(node)],
        }),
      ]
    case 'upload':
      const imageUrl = `${node.value.url}`
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      return [
        new Paragraph({
          children: [
            new ImageRun({
              data: uint8Array,
              transformation: {
                height: 100,
                width: 100,
              },
              type: 'jpeg',
              fallback: uint8Array,
            } as any),
          ],
        }),
      ]
    default:
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: `[Unknown Lexical node: ${JSON.stringify(node)}]`,
              bold: true,
            }),
          ],
        }),
      ]
  }
}

const convertParagraphNode = (node: any): Paragraph => {
  const childRuns = (node.children || []).map((childNode: any) => {
    if (childNode.type === 'text') {
      return convertTextNode(childNode)
    }
    return new TextRun({ text: `[child.type=${childNode.type}]` })
  })

  return new Paragraph({
    children: childRuns,
  })
}

const convertTextNode = (node: any): TextRun => {
  const isBold = Boolean(node.format & IS_BOLD)
  const isItalic = Boolean(node.format & IS_ITALIC)
  const isUnderline = Boolean(node.format & IS_UNDERLINE)
  const isStrikethrough = Boolean(node.format & IS_STRIKETHROUGH)
  const isSuperscript = Boolean(node.format & IS_SUPERSCRIPT)
  const isSubscript = Boolean(node.format & IS_SUBSCRIPT)
  const isHighlight = Boolean(node.format & IS_HIGHLIGHT)

  return new TextRun({
    text: node.text || '',
    bold: isBold,
    italics: isItalic,
    underline: isUnderline ? {} : undefined,
    strike: isStrikethrough,
    superScript: isSuperscript ? true : undefined,
    subScript: isSubscript ? true : undefined,
    highlight: isHighlight ? 'yellow' : undefined,
  })
}
