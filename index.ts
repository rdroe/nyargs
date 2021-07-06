
import setUp from './src/setUp'
import { get as apiGet, post as apiPost, SaveRequest as SR, QueryParams as QP } from './src/lib/api/call'
import { AppOptions as AO, Action as A, AppArgv as AA } from './src/appTypes'

export default setUp
export type SaveRequest = SR
export type QueryParams = QP
export const post = apiPost
export const get = apiGet
export type AppOptions = AO
export type Action = A
export type AppArgv = AA

