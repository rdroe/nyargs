import { JsonObjects, Module } from '../../shared/utils/types'
import { Entry, put } from '../../runtime/store'


export const m: Module<{
    scalar: number | string | boolean,
    object: JsonObjects
}> = {

    help: {
        description: 'get cache variables',
        options: {
            'c:c or commands': 'array of command namespaces to which to store data (see db structure in store.ts)',
            'c:n or names': 'array of "names" namespaces to  which to store data (see db structure in store.ts)',
            'filters': 'using the filter-pipeline language, drill down into the specified data to put a subset',
            'scalar': 'specify a scalar value to put into the cache',
            'object': 'specify an object (user types a json string) to put into the cache'
        },
        examples: {
            "--c:c data fetch --object '{}'": 'put an empty object into cache with "commands" index of ["data", "fetch"] (as if the user had called a command "data fetch" and received an empty object as result)',
            "--c:c data fetch --object '{\"foo\": \"bar\", \"baz\": \"bar\"}' --filters .foo --c:n name1 name2'": "put the string 'bar' into cache with commands index of [\"data\", \"fetch\"] (as if the user had called 'data fetch...' and received a result) and a names index of [\"name1\", \"name2\"]"
        }
    },
    fn: async (argv) => {
        const {
            'c:c': commands,
            'c:n': names,
            scalar,
            object,
            filters: jqQuery
        } = argv

        const arrObject: any[] = []

        if (object.length > 0) {
            object.forEach((json: string) => {
                const obj = JSON.parse(json)
                arrObject.push(obj)
            })
        }

        return Promise.all(
            arrObject
                .concat(scalar ?? [])
                .map((ev) => {
                    const entry: Entry = {
                        commands,
                        names,
                        value: ev,
                        filters: jqQuery
                    }
                    return put(entry)
                }))

    }
}
export default m
