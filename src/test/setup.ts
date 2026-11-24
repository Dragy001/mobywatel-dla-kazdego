import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
  window.sessionStorage.clear()
  window.location.hash = ''
})

import * as matchers from 'vitest-axe/matchers'
import { expect } from 'vitest'
expect.extend(matchers)
declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): T
  }
}
