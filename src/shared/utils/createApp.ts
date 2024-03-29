import { setDictionary } from 'commands/program'
import isNode from './isNode'
import { ConfigOptions, Modules } from './types'
export const platformIsNode = isNode()
type Main = typeof import('../../server/exports') | typeof import('../../browser/exports')


const importPlatform = async (): Promise<{
    main: Main
}> => {
    if (platformIsNode) {

        // @ts-ignore
        const main = await import('../../server/exports')
        // @ts-ignore
        await import('fake-indexeddb/auto')

        return { main }
    }
    // @ts-ignore
    const main = (await import('../../browser/exports'))
    // @ts-ignore
    return { main }


}

export type CreateAppArg = (main: Main) => void

type AppCreator = (fnOrModules: CreateAppArg | Modules, configurators?: {
    config?: { [Settable in keyof ConfigOptions]: ConfigOptions[Settable] },
    programs?: Parameters<typeof setDictionary>[0]
}, prompt?: string) => Promise<void>


type AppCreator1 = (main: Main, fn: CreateAppArg) => Promise<void>

type AppCreator2 = (main: Main, modules: Modules, configurators?: {
    config?: { [Settable in keyof ConfigOptions]: ConfigOptions[Settable] },
    programs?: Parameters<typeof setDictionary>[0]
}, prompt?: string) => Promise<void>



const createAppFromFn: AppCreator1 = async (main, fn) => {
    return fn(main)
}

const createAppFromObj: AppCreator2 = async (main, modules, configurators, prompt) => {

    const { cache, program, test, repl, setDictionary, configure, nest, element, match, last } = main

    const { config = {}, programs = {} } = configurators
    setDictionary(programs)
    Object.entries(config).forEach(
        ([configurable, configVal]) => configure(configurable as keyof typeof config, configVal))

    repl({ ...modules, match, cache, program, test, nest, element, last }, prompt)
}

const createApp: AppCreator = async (fnOrModules: CreateAppArg | Modules, configurators?: {
    config?: { [Settable in keyof ConfigOptions]: ConfigOptions[Settable] },
    programs?: Parameters<typeof setDictionary>[0]
}, prompt?: string) => {

    if (!platformIsNode) {

        let init

        if (configurators) {
            init = configurators.config.init
        }

        if (!init) {
            init = (await import('../../browser/init')).default
        }

        await init()
    }

    const { main } = await importPlatform()
    if (typeof fnOrModules === 'function') {
        return createAppFromFn(main, fnOrModules)
    }
    return createAppFromObj(main, fnOrModules, configurators, prompt)

}

export default createApp
