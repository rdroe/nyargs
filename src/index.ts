export * from "./shared/utils/types"
export * from './shared/utils/validation'
export * from "./shared/helpers"

export { getSingleton, setSingleton } from './shared/utils/singletons'
import isNode_ from './shared/utils/isNode'
import createAppFn from './shared/utils/createApp'

export const isNode = isNode_
export const platformIsNode = isNode()
export const createApp = createAppFn
export * as const from './shared/utils/const'
export * as  tauAdaptors from './shared/utils/tauAdaptors'


