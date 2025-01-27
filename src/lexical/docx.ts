// src/lexical/docx/index.ts

import {
  IS_BOLD,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_UNDERLINE,
  SerializedEditorState,
} from '@payloadcms/richtext-lexical/lexical'
import { ImageRun, Paragraph, TextRun } from 'docx'

export const lexicalToDocxParagraphs = async (
  data: SerializedEditorState,
  prefixTextRun?: TextRun,
): Promise<Paragraph[]> => {
  if (!data || typeof data !== 'object' || !('root' in data)) {
    return []
  }

  const { root } = data
  if (!root?.children || !Array.isArray(root.children)) {
    return []
  }

  let docxParagraphs: Paragraph[] = []
  let isFirstParagraph = true // Para saber cuándo inyectar el prefijo

  // Utilizar for...of para iterar y esperar cada operación asíncrona
  for (const node of root.children) {
    const paragraphsForNode = await convertNodeToDocx(
      node,
      isFirstParagraph ? prefixTextRun : undefined,
    )
    isFirstParagraph = false
    docxParagraphs.push(...paragraphsForNode)
  }

  // Si no se generó ni un solo párrafo y hay un prefijo, creamos uno
  if (docxParagraphs.length === 0 && prefixTextRun) {
    docxParagraphs = [
      new Paragraph({
        children: [prefixTextRun],
      }),
    ]
  }

  return docxParagraphs
}

const convertNodeToDocx = async (node: any, prefixTextRun?: TextRun): Promise<Paragraph[]> => {
  switch (node.type) {
    case 'paragraph':
      return [convertParagraphNode(node, prefixTextRun)]
    case 'text':
      // Texto "huérfano" => lo envolvemos en un párrafo
      return [
        new Paragraph({
          children: prefixTextRun
            ? [prefixTextRun, convertTextNode(node)]
            : [convertTextNode(node)],
        }),
      ]
    case 'upload':
      const imageUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}${node.value.url}`
      console.log('imageUrl', imageUrl)
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
              type: 'jpeg', // Indicar el tipo correcto de imagen
              fallback: uint8Array, // Proveer un fallback (aunque no se use para JPEG)
            } as any), // Si aún hay conflictos de tipo, se puede usar un type cast puntual
          ],
        }),
      ]

    default:
      // Nodo desconocido => placeholder
      return [
        new Paragraph({
          children: [
            prefixTextRun,
            new TextRun({
              text: `[Nodo Lexical desconocido: ${JSON.stringify(node)}]`,
              bold: true,
            }),
          ].filter((child): child is TextRun => child !== undefined), // para evitar null si prefixTextRun es undefined
        }),
      ]
  }
}

const convertParagraphNode = (node: any, prefixTextRun?: TextRun): Paragraph => {
  const childRuns = (node.children || []).map((childNode: any) => {
    if (childNode.type === 'text') {
      return convertTextNode(childNode)
    }
    return new TextRun({ text: `[child.type=${childNode.type}]` })
  })

  if (prefixTextRun) {
    childRuns.unshift(prefixTextRun)
  }

  return new Paragraph({
    children: childRuns,
  })
}

const convertTextNode = (node: any): TextRun => {
  const isBold = Boolean(node.format & IS_BOLD)
  const isItalic = Boolean(node.format & IS_ITALIC)
  const isUnderline = Boolean(node.format & IS_UNDERLINE)
  const isStrikethrough = Boolean(node.format & IS_STRIKETHROUGH)

  return new TextRun({
    text: node.text || '',
    bold: isBold,
    italics: isItalic,
    underline: isUnderline ? {} : undefined,
    strike: isStrikethrough,
  })
}
