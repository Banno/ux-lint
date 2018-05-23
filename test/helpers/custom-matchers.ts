export const toBeLintError: jasmine.CustomMatcherFactory = (util, customEqualityTesters) => {
  return {
    compare: (actual: object) => {
      const expectedProps = [
        'character',
        'code',
        'description',
        'evidence',
        'file',
        'line',
        'plugin',
        'type'
      ]
      let actualProps = Object.keys(actual).sort()
      let result = {
        pass: util.equals(actualProps, expectedProps)
      }
      return result
    }
  }
}

const allMatchers: jasmine.CustomMatcherFactories = {
  toBeLintError
}

export default allMatchers
