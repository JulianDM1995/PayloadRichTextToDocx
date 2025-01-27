import { lexicalToDocxParagraphs } from '@/lexical/docx'
import { CollectionWithRichTextField, DocxSetting } from '@/payload/payload-types'
import { Document, Footer, Header, Packer, Paragraph, Table } from 'docx'
import { saveAs } from 'file-saver'

function getDocxConfig(docxSettings: DocxSetting) {
  const orientation = docxSettings.orientation ?? 'portrait'
  const pageSize = docxSettings.pageSize ?? 'A4'
  const margins = docxSettings.margins ?? { top: 2, bottom: 2, left: 2, right: 2 }
  const style = docxSettings.style ?? {
    fontFamily: 'Arial',
    fontSize: 12,
    textColor: '#000000',
    lineSpacing: 1.15,
  }

  let pageWidth = 11906 // A4
  let pageHeight = 16838 // A4
  if (pageSize === 'Letter') {
    pageWidth = 12240
    pageHeight = 15840
  } else if (pageSize === 'Legal') {
    pageWidth = 12240
    pageHeight = 20160
  }
  if (orientation === 'landscape') {
    const temp = pageWidth
    pageWidth = pageHeight
    pageHeight = temp
  }

  const marginTop = (margins.top ?? 2) * 567
  const marginBottom = (margins.bottom ?? 2) * 567
  const marginLeft = (margins.left ?? 2) * 567
  const marginRight = (margins.right ?? 2) * 567
  const colorHex = (style.textColor ?? '#000000').replace('#', '')

  return {
    style,
    pageWidth,
    pageHeight,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    colorHex,
    header: docxSettings.header,
    footer: docxSettings.footer,
  }
}

async function createDocument(
  children: (Paragraph | Table)[],
  config: ReturnType<typeof getDocxConfig>,
) {
  const {
    style,
    pageWidth,
    pageHeight,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    colorHex,
    header,
    footer,
  } = config

  let headerParagraphs: Paragraph[] | undefined
  if (header) headerParagraphs = await lexicalToDocxParagraphs(header)

  let footerParagraphs: Paragraph[] | undefined
  if (footer) footerParagraphs = await lexicalToDocxParagraphs(footer)

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: style.fontFamily || undefined,
            color: colorHex,
            size: (style.fontSize ?? 12) * 2,
          },
          paragraph: {
            spacing: {
              line: (style.lineSpacing ?? 1.15) * 240,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: pageWidth,
              height: pageHeight,
            },
            margin: {
              top: marginTop,
              bottom: marginBottom,
              left: marginLeft,
              right: marginRight,
            },
          },
        },
        headers: headerParagraphs ? { default: new Header({ children: headerParagraphs }) } : {},
        footers: footerParagraphs ? { default: new Footer({ children: footerParagraphs }) } : {},
        children,
      },
    ],
  })
}

export async function exportCollectionWithRichTextToWord(
  collectionWithRichTextToWord: CollectionWithRichTextField,
  docxSettings: DocxSetting,
  filename: string,
) {
  const config = getDocxConfig(docxSettings)
  const paragraphs: Paragraph[] = []

  if (collectionWithRichTextToWord.richTextField) {
    const contentParagraphs = await lexicalToDocxParagraphs(
      collectionWithRichTextToWord.richTextField,
    )
    paragraphs.push(...contentParagraphs)
  }

  const doc = await createDocument(paragraphs, config)
  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}
