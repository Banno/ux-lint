interface Stub {
  [file: string]: any
}

declare namespace jasmine {
  interface Matchers<T> {
    toBeLintError(): boolean
  }
}
