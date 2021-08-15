import yargs, { CommandModule, Argv } from 'yargs'
import matchCmd from './commands/match'
import stringArgv from 'string-argv'
import loop from './loop'

const match: CommandModule = matchCmd

// one-shot (default) nested runner.
export default async (modules: CommandModule[]) => {
    yargs.usage("$0 command")
    const allModules: CommandModule[] = modules
    allModules.push(match)
    const moduleProms = allModules.map(async (module: CommandModule) => {
        return yargs.command(module)
    })

    await Promise.all(moduleProms)

    yargs.demand(1, "You must provide a valid command")
        .help("h")
        .alias("h", "help")
        .argv

    return true
}

export const repl = async (modules: CommandModule[]) => {
    return await loop(modules, repl_)
}

const harvestResults = async (awaited: any) => {

    // For now, the imported  modules must always assign "result" on the argv object, which we process here.
    // This is a bit of a hack ; not sure how to return the result properly by means of yargs calls to Command module submodules
    const json = JSON.parse(
        awaited.result
    )
    delete awaited.result

    return json
}

async function repl_(modules: CommandModule[], input: string = '') {

    const simArgv = stringArgv(input)
    const universalOpts = {
        'c':
        {
            alias: 'cache',
            global: true,
            default: '.',
            describe: 'filter for limiting the cached portion of results'
        }
    }
    yargs
        .options(universalOpts)
        .exitProcess(false)
        .usage("$0 command")

    const allModules: CommandModule[] = modules
    allModules.push(match)
    const moduleProms = allModules.map(async (module: CommandModule) => yargs.command(module))

    await Promise.all(moduleProms)

    yargs
        .exitProcess(false)
        .demand(1,
            "You must provide a valid command")
        .help("h")
        .alias("h", "help")


    // Use the afterParse function to effect the yargs call; which requires a bit of specialized massaging to work asynchronously
    try {

        const parseRes: any = await yargs.parse(simArgv, {}, afterParse)
        console.log('parser res argv', parseRes)
        if (!parseRes.result) throw new Error('no result is attached.')

        const json = await harvestResults(parseRes)
        return { result: json, argv: parseRes }
    } catch (e) {
        console.error('Error!!' + e.message)
        return ({ result: { message: e.message }, argv: {} })
    }
}


/* 

   Helper function that finished up yargs parsing 
*/
async function afterParse(err: Error, arg2: any): Promise<any> {

    if (err) {
        console.error('Error during yargs-based parsing: ', err.message)
        return ({ ...arg2, result: { message: err.message } })
    }
    console.log('returning from after parse', arg2)
    return await arg2


}


