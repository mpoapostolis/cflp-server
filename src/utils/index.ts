import { differenceInCalendarYears } from 'date-fns'

export type AgeGroup = {
  unkown: number
  '13-17': number
  '18-24': number
  '25-34': number
  '35-44': number
  '45-54': number
  '55-64': number
  '65+': number
}

export type Coords = [number, number]

export type ItemAnalytics = {
  purchased: number
  male: number
  female: number
  ageGroup: AgeGroup
}

export const itemAnalytics = {
  purchased: 0,
  male: 0,
  female: 0,
  ageGroup: {
    unknown: 0,
    '13-17': 0,
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45-54': 0,
    '55-64': 0,
    '65+': 0,
  },
}
export function groupByAge(date: Date) {
  console.log(date)
  const age = differenceInCalendarYears(new Date(), new Date(date))

  switch (true) {
    case age < 18:
      return '13-17'
    case age < 25:
      return '18-24'
    case age < 35:
      return '25-34'
    case age < 45:
      return '35-44'
    case age < 56:
      return '45-54'
    case age < 65:
      return '55-64'
    case age > 64:
      return '65+'

    default:
      return 'uknown'
  }
}
