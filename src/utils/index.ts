import { differenceInCalendarYears } from 'date-fns'

export type AgeGroup = {
  group_age_unkown: number
  group_age_13_17: number
  group_age_18_24: number
  group_age_25_34: number
  group_age_35_44: number
  group_age_45_54: number
  group_age_55_64: number
  group_age_65_plus: number
}

export type Coords = [number, number]

export type ItemAnalytics = {
  purchased: number
  male: number
  female: number
  ageGroup: AgeGroup
}

export const analytics = {
  purchased: 0,
  male: 0,
  female: 0,
  ageGroup: {
    group_age_unkown: 0,
    group_age_13_17: 0,
    group_age_18_24: 0,
    group_age_25_34: 0,
    group_age_35_44: 0,
    group_age_45_54: 0,
    group_age_55_64: 0,
    group_age_65_plus: 0,
  },
}
export function groupByAge(date: Date) {
  const age = differenceInCalendarYears(new Date(), new Date(date))

  switch (true) {
    case age < 18:
      return 'group_age_13_17'
    case age < 25:
      return 'group_age_18_24'
    case age < 35:
      return 'group_age_25_34'
    case age < 45:
      return 'group_age_35_44'
    case age < 56:
      return 'group_age_45_54'
    case age < 65:
      return 'group_age_55_64'
    case age > 64:
      return 'group_age_65_plus'

    default:
      return 'group_age_unkown'
  }
}
