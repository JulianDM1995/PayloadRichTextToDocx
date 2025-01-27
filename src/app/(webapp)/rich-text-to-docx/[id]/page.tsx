import config from '@payload-config'
import { getPayload } from 'payload'
import { ExportButton } from './ExportButton'

export default async function Page({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const id = (await params).id

  const payload = await getPayload({ config })

  const collectionWithRichText = await payload.findByID({
    collection: 'collection-with-rich-text-fields',
    id: id,
    draft: true,
  })

  const docxSettings = await payload.findGlobal({
    slug: 'docx-settings',
  })

  if (!collectionWithRichText || !docxSettings) {
    return <div></div>
  }

  return (
    <>
      <h1>Export to Word</h1>
      <ExportButton
        collectionWithRichTextField={collectionWithRichText}
        docxSettings={docxSettings}
      />
    </>
  )
}
