import miscData from 'content/misc.json'

export type MiscLink = {
  title: string
  url: string
  note?: string
}

export const miscLinks: MiscLink[] = miscData.links
