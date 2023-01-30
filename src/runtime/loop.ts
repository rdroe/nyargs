import { cache } from './cache'
import { parseCacheInstructions } from './store'
import { firstReaders, getInput, _getInput } from './input'
import {
    Module,
    Modules,
    ResultWithBaseArgs
} from '../shared/utils/types'
import { get } from '../shared/index'
import { program } from '../shared/utils/queue'
import { getConfig } from '../shared/index'
import { RESULT_KEY } from '../shared/utils/const'

const DO_LOG = true

const log = (...args: any[]) => {
    if (DO_LOG) { console.log(...args) }
}

const PROMPT = 'nyargs > '
let userPrompt = PROMPT
const JQ_DEFAULT = 'l'
const containsInterrupt = (rawInput: string) => {
    if (rawInput && rawInput.includes && (rawInput.includes('davo:dismiss') || rawInput.includes('davo:dis'))) {
        return true
    }
    return false
}


/** Given input verified by verifyAndExecuteCli, force the running of the typed command. */
const getExecuteCli = async (modules: { [moduleName: string]: Module }, yargsCaller: Executor) => async (input: string): Promise<ResultWithBaseArgs> => {
    return (await yargsCaller(modules, input || '')) || undefined
}


// This is the primary loop logic. it  makes use of the above direct executor function, but also runs the loop in which the executor and the verification is run repeatedly.
async function verifyAndExecuteCli(
    modules: Modules,
    forwardedInput: string | null,
    id: number,
    executor: (arg0: string) => Promise<ResultWithBaseArgs>,
    tempPrompt: string = userPrompt
): Promise<{ argv: object, [RESULT_KEY]: object }> {
    if (typeof RESULT_KEY !== 'string') throw new Error(`String required as RESULT_KEY`)
    const processResult = getConfig('processResult')
    let rawInput: string
    let didUseProgram: boolean = false
    const printResult = await get('printResult')
    // Obtain input and execute. 
    // If this is a recursion, with input already present, feed that forward.

    // If a program is being run, take the next line (if there is one)
    // as the user command.

    if (program.array.length) {
        rawInput = program.array.shift()

        didUseProgram = true // track that a program was used; may need to treat it specially on expansion.
    }


    if (typeof rawInput === 'undefined') {
        rawInput = forwardedInput
            ? await getInput(modules, tempPrompt, id, forwardedInput)
            : await getInput(modules, tempPrompt, id)
    }

    if (containsInterrupt(rawInput)) {
        return { [RESULT_KEY]: {}, argv: {} }
    }

    if (!rawInput || !rawInput.split) {

        return verifyAndExecuteCli(modules, null, id, executor)

    }
    // Run the raw input through jq calls and cache-replacing
    const input = (await parseCacheInstructions(rawInput, JQ_DEFAULT)).replace(/\{\{/g, '{{')

    // If it is different (if cache-replacing was used) verify to run.

    if (!didUseProgram && input !== rawInput) {
        return verifyAndExecuteCli(modules, input, id, executor, 'AUGMENTED > ') // loop, also giving chance to enter new input 
    } else {
        if (didUseProgram && input !== rawInput) {
            console.log('program line expanded: ', input)
        }


        // if raw matches new, just replace.
        const ret = await executor(input)
        await printResult(ret.argv, ret)
        // look at the arguments and results, cache if appropriate.
        await processResult(ret)

        await cache(ret.argv, ret)
        // start fresh
        return verifyAndExecuteCli(modules, null, id, executor)
    }
}


export type Executor = (modules: { [moduleName: string]: Module }, input: string) => Promise<ResultWithBaseArgs>

// Given a list of modules and a yargs executer-helper, provide a repl-like environment for working on command lines and running them.
const repl = (
    modules: Modules,
    caller: Executor,
    id: number,
    prompt?: string
): Promise<any> => {
    userPrompt = prompt ? prompt : userPrompt
    // Set up the direct evaluator of the cli, which runs after conversation with the user such as "are you sure you want to use this command line string" and background caching behavior.

    const executeCli = getExecuteCli(modules, caller)
    executeCli.then((execCliRes) => {
        verifyAndExecuteCli(modules, null, id, execCliRes)
    })

    return firstReaders[id]


}

export default repl
