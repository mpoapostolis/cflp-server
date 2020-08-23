import { differenceInCalendarYears } from 'date-fns'

export type Coords = [number, number]

export function groupByAge(date: Date) {
  const age = differenceInCalendarYears(new Date(), new Date(date))

  switch (true) {
    case age < 18:
      return 'age_13_17'
    case age < 25:
      return 'age_18_24'
    case age < 35:
      return 'age_25_34'
    case age < 45:
      return 'age_35_44'
    case age < 56:
      return 'age_45_54'
    case age < 65:
      return 'age_55_64'
    case age > 64:
      return 'age_65_plus'

    default:
      return 'age_unkown'
  }
}
