import 'fake-indexeddb/auto'
import { Dexie as DexieCore } from 'dexie'
import { Cache } from '../../../appTypes'

export const Dexie = DexieCore

export class UiDb extends DexieCore {
    public cache: DexieCore.Table<Cache>

    public constructor() {
        super("UiDb")
        this.version(1).stores({
            cache: 'id++, *names, *commands, value, [commands+names], createdAt'
        });
        this.cache = this.table('cache')
    }
}


export const db = new UiDb;
