'use client'

import { CollectionWithRichTextField, DocxSetting } from '@/payload/payload-types'
import { exportCollectionWithRichTextToWord } from './exportToWord'

export const ExportButton = ({
  collectionWithRichTextField,
  docxSettings,
}: {
  collectionWithRichTextField: CollectionWithRichTextField
  docxSettings: DocxSetting
}) => {
  return (
    <button
      onClick={() =>
        exportCollectionWithRichTextToWord(
          collectionWithRichTextField,
          docxSettings,
          'collection-with-rich-text-fields.docx',
        )
      }
    >
      Export
    </button>
  )
}
