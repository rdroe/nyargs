import { AppArguments, Module } from '../../appTypes'
import db from '../../lib/store'
import { importDb } from '../../hooks'

export default {
    help: {
        commands: {},
        options: {},
        examples: {}
    },
    fn: async (args: AppArguments) => {
        const now = Date.now()
        const newId = await db.cache.add({
            commands: ['la', 'tra'],
            names: ['fa', 're'],
            value: 1,
            createdAt: now
        })
        await db.cache.delete(newId)

        const result = await importDb(args.path, args.filename, db.backendDB())
        await db.cache.delete(now)
        return result
    },
    yargs: {
        filename: {
            alias: 'f',

            type: 'string',
            default: `back-${Date.now()}.json`
        },
        path: {
            alias: 'p',
            type: 'string',
            default: `data`
        }
    }
} as Module
