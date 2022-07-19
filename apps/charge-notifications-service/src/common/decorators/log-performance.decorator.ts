import { performance } from 'perf_hooks'

export function logPerformance (
  logPrefix?: string
): MethodDecorator {
  return function decorator (
    target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ): void {
    const method = descriptor.value

    descriptor.value = async function wrapper (...args: any[]) {
      const start = performance.now()
      const result = await method.apply(this, args)
      const finish = performance.now()

      console.log(`${logPrefix} Execution time: ${finish - start} ms`)
      return result
    }
  }
}
