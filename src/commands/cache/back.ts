import { AppArguments, Module } from '../../appTypes'
import db from '../../lib/store'
import { exportDb } from '../../hooks'

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
        const dbBack = db.backendDB()
        return exportDb(args.p, args.f, dbBack)
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
