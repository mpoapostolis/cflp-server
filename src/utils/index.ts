export type AgeGroup = {
  '16-17': number
  '18-24': number
  '25-34': number
  '35-44': number
  '45-55': number
  '54+': number
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
    '16-17': 0,
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45-55': 0,
    '54+': 0,
  },
}
