import { User } from '../models/users'

export type AgeGroup = {
  unkown: number
  '16-17': number
  '18-24': number
  '25-34': number
  '35-44': number
  '45-55': number
  '56+': number
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
    '16-17': 0,
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45-55': 0,
    '56+': 0,
  },
}

function groupByAge(age: number) {
  switch (true) {
    case age < 18:
      return '16-17'
    case age < 25:
      return '18-24'
    case age < 35:
      return '25-34'
    case age < 45:
      return '35-44'
    case age < 56:
      return '45-55'
    case age < 18:
      return '56+'

    default:
      return 'uknown'
  }
}

export function groupUser(user: User) {
  const gender = user.gender
  const groupAge = groupByAge(user.age)
  return { gender, groupAge }
}
