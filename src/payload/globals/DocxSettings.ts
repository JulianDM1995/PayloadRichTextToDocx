import { GlobalConfig } from 'payload'

const PageOrientationOptions = [
  { label: 'Vertical (Portrait)', value: 'portrait' },
  { label: 'Horizontal (Landscape)', value: 'landscape' },
]

const PageSizeOptions = [
  { label: 'A4', value: 'A4' },
  { label: 'Letter', value: 'Letter' },
  { label: 'Legal', value: 'Legal' },
]

export const DocxSettings: GlobalConfig = {
  slug: 'docx-settings',
  label: 'DOCX Settings',
  admin: {
    group: 'Document Customization',
    description: 'Global settings for exported .docx documents',
  },
  fields: [
    {
      name: 'header',
      label: 'Header',
      type: 'richText',
    },
    {
      name: 'footer',
      label: 'Footer',
      type: 'richText',
    },
    {
      name: 'orientation',
      label: 'Page Orientation',
      type: 'select',
      defaultValue: 'portrait',
      options: PageOrientationOptions,
      admin: {
        description: 'Portrait or Landscape',
      },
    },
    {
      name: 'pageSize',
      label: 'Page Size',
      type: 'select',
      defaultValue: 'A4',
      options: PageSizeOptions,
      admin: {
        description: 'A4, Letter, etc.',
      },
    },
    {
      name: 'margins',
      label: 'Margins',
      type: 'group',
      fields: [
        {
          name: 'top',
          label: 'Top (cm)',
          type: 'number',
          defaultValue: 2,
        },
        {
          name: 'bottom',
          label: 'Bottom (cm)',
          type: 'number',
          defaultValue: 2,
        },
        {
          name: 'left',
          label: 'Left (cm)',
          type: 'number',
          defaultValue: 2,
        },
        {
          name: 'right',
          label: 'Right (cm)',
          type: 'number',
          defaultValue: 2,
        },
      ],
    },
    {
      name: 'style',
      label: 'General Styles',
      type: 'group',
      fields: [
        {
          name: 'fontFamily',
          label: 'Default Font',
          type: 'text',
          defaultValue: 'Arial',
        },
        {
          name: 'fontSize',
          label: 'Font Size (pt)',
          type: 'number',
          defaultValue: 12,
        },
        {
          name: 'textColor',
          label: 'Text Color (hex)',
          type: 'text',
          defaultValue: '#000000',
        },
        {
          name: 'lineSpacing',
          label: 'Line Spacing',
          type: 'number',
          defaultValue: 1.15,
          admin: {
            description: '1 = single, 1.15 = default, 1.5 = 1.5, etc.',
          },
        },
      ],
    },
  ],
}
