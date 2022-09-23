import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js"
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js"
import "@babylonjs/core/Culling"
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js"
import { Color3 } from "@babylonjs/core/Maths/math.color.js"
import { getters } from '../ui/engine'
import { Module, } from "nyargs"
import { Animation } from "@babylonjs/core"



const makeTorus = (
    x: number, y: number, z: number,
    options: {
        id?: string,
        color?: [number, number, number],
        size?: number
        animationPositions?: [number, number, number][]
        animationFrames?: number[],
        thickness?: number
    }
) => {
    const {
        id: ident = Math.random().toString().split('.')[1],
        color: col = randColor(),
        size = 0.5,
        animationPositions = [],
        animationFrames = [],
        thickness = 0.3
    } = options

    const mesh = MeshBuilder.CreateTorus(ident,
        { diameter: size, thickness }, getters.scene())
    mesh.position.x = x
    mesh.position.y = y
    mesh.position.z = z
    mesh.isPickable = true
    const color = new StandardMaterial("groundMat");

    color.diffuseColor = new Color3(
        ...col
    );
    mesh.material = color
    let maxFrame = 0
    if (animationPositions.length > 1) {

        const piAnimate = new Animation(`animation-${ident}`, "position", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE);
        const keyFrames = animationFrames.map((turnNum, idx) => {

            const frame = Math.round(turnNum)
            maxFrame = Math.max(maxFrame, frame)
            return {
                frame,
                value: new Vector3(...animationPositions[idx])
            }
        })

        piAnimate.setKeys(keyFrames)
        mesh.animations.push(piAnimate)
        getters.scene().beginAnimation(mesh, 0, maxFrame + 30, true);
    }
}

const randColor = (): [number, number, number] => [
    Math.random(),
    Math.random(),
    Math.random()
]
const frameRegex = /([0-9]+)\=([0-9])\,([0-9])\,([0-9])/
const requireValidFrameArg = (str: string) => {
    if (str.match(frameRegex)) {
        return
    }
    throw new Error(`cli arg ${str} does not match the required pattern for a frame, e.g. 1=0,1,2`)
}

const parseFrameArg = (str: string): [number, [number, number, number]] => {
    requireValidFrameArg(str)
    const [, frame, x, y, z] = str.match(frameRegex)

    return [parseInt(frame), [parseInt(x), parseInt(y), parseInt(z)]]
}


const parseFrames = (frames: string[]) => {
    return frames.reduce((accum, str) => {
        const [frameIdxs, torusPositions] = accum ?? [[], []]
        const [newFrameIdx, newTorusPositions] = parseFrameArg(str)
        return [frameIdxs.concat(newFrameIdx), torusPositions.concat([newTorusPositions])]
    }, [[], []])
}

const torus: Module<{ positional: number[], thickness: number, color: [number, number, number], frames: string[] }> = {
    help: {
        description: 'create a colored, optionally animated torus onscreen',
        options: {
            'x y z': 'required; these three numbers will be the (start) coordinates of the torus presented onscreen',
            color: 'e.g. torus ... --color 100 0 100 : 3 numbers should be provided, which will be the rgb of the torus presented',

            frames: 'An array of special-form keyframe args, e.g. "torus ... --frames 10=1,1,1 20=2,2,2". If you added that argument, the torus would begin at its initial position, animate to 1,1,1 by the 10th frame, then to 2,2,2 by its 20th frame ',
            thickness: "Thickness of the 'tube' that constitutes the torus"
        },
        examples: {
            '0 0 0': `
Add a torus (with some random color) at x,y,z position 0 0 0 (the default origin in Babylon JS).
`,
            '1 2 1 --color 100 100 100': `
Add a white torus at x,y,z position 1 2 1.
`,
            '0 0 0 --frames 10=1,1,1 20=2,2,2': 'begin at its initial position (which is 0,0,0) then animate to 1,1,1 by the 10th frame, then to 2,2,2 by its 20th frame. The torus would snap back to its origin and restart after some constant number of frames had passed',
            '0 0 0 --thickness 0.2': 'present a torus of random color onscreen at the origin with a thickness of 0.2 units'
        },
    },
    yargs: {
        frames: {
            alias: 'f',
            array: true
        },
        color: {
            alias: 'c',
            array: true,
            type: 'number'
        },
        thickness: {
            alias: 't',
            array: false,
            type: 'number'
        }
    },
    fn: async ({ positional, color, frames, thickness }) => {
        const [x, y, z] = positional
        const [animationFrames = [], animationPositions = []] = frames ? parseFrames([`0=${x},${y},${z}`, ...frames]) : []
        return makeTorus(x, y, z, { color, animationFrames, animationPositions, thickness })
    },
}

export default torus
