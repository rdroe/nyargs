import * as setUp from './src/setUp'
import * as loop_ from './src/loop'
import * as hooks_ from './src/hooks'
import * as store_ from './src/lib/store'
export * as browser from './src/lib/input/browser'

export { cache, match, program } from './src/commands'
export * from './src/lib/dynamic'

export const isNode = new Function("try {return this===global;}catch(e){return false;}")

export default setUp
export const hooks = hooks_
export { AppOptions, Action, AppArgv, AppArguments, Module, UserArgs } from './src/appTypes'


export { repl } from './src/setUp'
export { get, post, QueryParams, SaveRequest } from './src/lib/api/call'
export const loop = loop_
export const store = store_
