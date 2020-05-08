import { ValidationErrorItem } from '@hapi/joi'

export const makeErrObj = (errors: ValidationErrorItem[]) => {
  const errorObj = {}
  errors.map((err) => {
    errorObj[err.context.key] = err.message
  })
  return errorObj
}
