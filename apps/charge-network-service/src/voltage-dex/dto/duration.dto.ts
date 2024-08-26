import { IsOptional, ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator'

import dayjs from '@app/common/utils/dayjs'

export function ValidateDuration (validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'validateDuration',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate (value: any) {
          if (typeof value === 'number') {
            // Validate number input (assuming milliseconds)
            return !isNaN(dayjs.duration(value).asMilliseconds())
          } else if (typeof value === 'object') {
            // Validate object input
            try {
              dayjs.duration(value)
              return true
            } catch (error) {
              return false
            }
          } else if (typeof value === 'string') {
            // Validate ISO 8601 duration string
            try {
              dayjs.duration(value)
              return true
            } catch (error) {
              return false
            }
          }
          return false
        },
        defaultMessage (args: ValidationArguments) {
          return `${args.property} must be a valid duration (number of milliseconds, duration object, or ISO 8601 duration string)`
        }
      }
    })
  }
}
export class DurationDto {
  @IsOptional()
  @ValidateDuration()
    duration?: any
}
