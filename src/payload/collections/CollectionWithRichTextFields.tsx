import { CollectionConfig } from 'payload'

export const CollectionWithRichTextFields: CollectionConfig = {
  slug: 'collection-with-rich-text-fields',
  admin: {
    livePreview: {
      url: ({ data }) => `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/rich-text-to-docx/${data.id}`,
    },
  },
  fields: [
    {
      name: 'richTextField',
      type: 'richText',
      required: true,
    },
  ],
}
