import { BaseArguments, Module } from '../../shared/utils/types'
import jquery from 'jquery'

const $ = jquery

type BrowserArgs = {
    action: string,
    tag: string,
    class: string,
    parent?: string,
    style: string
}

/**
   arr1: defined as unnecessary
   arr2: analyzed against the defined arr1
 */
const includes = (arr1: any[], arr2: any[]) => {
    return arr2.find((elemIn2: any) => arr1.includes(elemIn2))
}

const warnExtra = (unnecessaries: string[], args: BaseArguments & { action: string }): string | false => {
    const doesInclude = includes(unnecessaries, Object.keys(args))
    return doesInclude
        ? `Warning; the action ${args.action} does not make use of ${unnecessaries.join(", ")}`
        : false
}
const CREATE = 0
const REMOVE = 1
const READ = 2

const actions = ['create', 'remove', 'read']
const ret: {
    data: any[],
    warnings: string[]
} = { data: [], warnings: [] }

const browser: Module<{ action: 'create' | 'remove' | 'read', parent: any, class: any, tag: any, style: any, json: boolean }>['fn'] = async (args): Promise<typeof ret> => {
    // const objStyle: null | Json = args.style ? JSON.parse(args.style) : null
    console.log('element fn', args)
    if (args.action === actions[CREATE]) {
        console.log('creating an elem')
        let parent = document.body
        if (args.parent) {
            parent = document.querySelector(args.parent)
        }
        const elem = document.createElement(args.tag)
        elem.setAttribute('class', args.class)
        if (args.style) {
            elem.setAttribute('style', args.style)
        }
        console.log('append elem', elem, 'on', parent)
        parent.appendChild(elem)

    } else if (args.action === actions[REMOVE]) {
        let parent = document.body
        const elem = document.querySelector(args.class)
        parent.removeChild(elem)
        const warning = warnExtra(['tag', 'parent', 'style'], args)
        if (warning) {
            ret.warnings.push(warning)
        }
    } else if (args.action === actions[READ]) {
        const elem = document.querySelector(args.class)
        if (elem) {
            if (elem.tagName === 'TEXTAREA') {
                const val = (elem as HTMLTextAreaElement).value
                if (args.json) {
                    ret.data.push(JSON.parse(val))
                } else {
                    ret.data.push(val)
                }
            } else {
                ret.warnings.push(`Cannot read from element or nothing to read; selector was ${args.class}`)
            }
        } else {
            ret.warnings.push(`That element was not found (tried query selector "${args.class}")`)
        }
        const warning = warnExtra(['tag', 'parent', 'style'], args)
        if (warning) {
            ret.warnings.push(warning)
        }
    } else {
        ret.warnings.push(`Warning: No valid action was found; choose one of ${actions.join('; ')}`)
    }

    return ret
}

const elementModule: Module = {
    help: {
        'description': 'create or remove an html element',
        examples: {
            '--action create --tag textarea --class input-1': 'create a textarea element with the given class name',
            '--action create --tag textarea --class input-1 --parent .some-parent --style "width: 180px; height: 50px;"': 'create a textarea element with the given class name, on the designated parent via querySelector arg, and with the specified styles',
            '--action read --class .input-1': "read the textContent or value accessor of the element with the given selector",
            '--action read --class .input-1 --json': "read the textContent or value accessor of the element with the given selector; parse it as json"

        }
    },
    fn: browser
}

export default elementModule
