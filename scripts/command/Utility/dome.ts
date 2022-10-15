import { BeforeChatEvent, BlockLocation, Dimension, Location, MinecraftBlockTypes, world } from "mojang-minecraft";
import { toCamelCase } from "../../util";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}dome [options]
     §fCreates a sphere or hemisphere around the player.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-r <radius>, --radius <radius>
     §fSets the radius size (Max is 30).
 §2|  §7-s, --sphere
     §fSets the dome to be a sphere (Hemisphere is default).
 §2|  §7-b, --block
     §fSets the block type to use when generating a sphere or hemisphere.

`;

    return help;
}

function outerSphere(outerSurface: any, blockType: string, dim: Dimension) {
    let blockCreation = [];
    for (const coordinates of outerSurface) {
        blockCreation.push(dim.getBlock(new BlockLocation(coordinates.x, coordinates.y, coordinates.z)));
    }
    outerSurface = [];
    for (const resurrect of blockCreation) {
        resurrect.setType(MinecraftBlockTypes[blockType]);
    }
    blockCreation = [];
}

/*
function innerSphere(innerSurface: any, dim: Dimension) {
    let blockCreation = [];
    // House keeping. Clean up crew is in the house.
    for (const coordinates of innerSurface) {
        blockCreation.push(dim.getBlock(new BlockLocation(coordinates.x, coordinates.y, coordinates.z)));
    }
    innerSurface = [];
    for (const cleanUp of blockCreation) {
        cleanUp.setType(MinecraftBlockTypes["air"]);
    }
    blockCreation = [];
}
*/

export function dome(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;
    let radiusMax: number = undefined;
    let blockType: string = undefined;
    let blockType2: string = undefined;

    // Get prefix from player
    let prefix = String(player.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    // Are there arguements
    if (!args.length) {
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}dome -h for command options.`);
    }

    /**
     * Define variable outside the scope of a loop.
     * Conditionally check non positional parameters.
     */
    let i: number = args.length - 1;
    let caseOne: boolean = false;
    let caseTwo: boolean = false;
    let caseThree: boolean = false;
    let caseFour: boolean = false;
    let shape: number = undefined;
    for (; i >= 0; --i) {
        switch (true) {
            case ["-h", "--help"].includes(args[i]):
                caseOne = true;
                player.tell(usage(prefix));
                break;
            case ["-r", "--r"].includes(args[i]):
                caseTwo = true;
                radiusMax = args[i + 1] as unknown as number;
                break;
            case ["-s", "--sphere"].includes(args[i]):
                caseThree = true;
                break;
            case ["-b", "--block"].includes(args[i]):
                caseFour = true;
                blockType = toCamelCase(args[i + 1]);
                blockType2 = args[i + 1];
                break;
        }
    }
    if (caseOne) {
        return;
    }
    if (!caseTwo) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -r | --radius.\n              See ${prefix}dome -h for more information.`);
    }
    if (radiusMax > 30) {
        return player.tell(`§2[§7Deadlock§2]§f Radius cannot be set higher than 30.\n              See ${prefix}dome -h for more information.`);
    }
    if (!caseFour) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -b | --block.\n              See ${prefix}dome -h for more information.`);
    }
    if (caseThree) {
        shape = -radiusMax;
    } else {
        shape = 0;
    }

    const blockTypeVerification = MinecraftBlockTypes.get("minecraft:" + blockType2);
    if (blockTypeVerification == undefined) {
        return player.tell(`§2[§7Deadlock§2]§f Unknown block '${blockType}'.`);
    }

    const { x: cx, y: cy, z: cz } = player.location,
        dim = player.dimension;

    const radiusMin = radiusMax - 1;
    const radiusMax2 = radiusMax ** 2,
        radiusMin2 = radiusMin ** 2;

    let outerSurface = [];
    /*
    let innerSurface = [];
    */

    // checks for every coordinate in the ++X +Z part
    for (let y = shape; y <= radiusMax; y++) {
        for (let x = 0; x <= radiusMax; x++) {
            for (let z = 0; z <= x; z++) {
                const dist = x * x + y * y + z * z;

                // test if dist is out of range
                if (dist > radiusMax2) continue;

                // symmetrical
                const locations: [number, number, number][] = [
                    [x, y, z],
                    [-x, y, z],
                    [x, y, -z],
                    [-x, y, -z],
                    [z, y, x],
                    [-z, y, x],
                    [z, y, -x],
                    [-z, y, -x],
                ];

                // outer sphere
                if (radiusMin2 <= dist && dist < radiusMax2) {
                    for (const [x, y, z] of locations) {
                        outerSurface.push(new Location(cx + x, cy + y, cz + z));
                        //dim.getBlock(new BlockLocation(cx + x, cy + y, cz + z)).setType(blockType);
                    }
                }

                // inner sphere
                else if (radiusMin2 > dist) {
                    for (const [x, y, z] of locations) {
                        let integrity = dim.getBlock(new BlockLocation(cx + x, cy + y, cz + z));
                        if (integrity.type.id === "minecraft:air") {
                            continue;
                        }
                        integrity.setType(MinecraftBlockTypes["air"]);
                        /*
                        innerSurface.push(new Location(cx + x, cy + y, cz + z));
                        */
                    }
                }
            }
        }
    }
    outerSphere(outerSurface, blockType, dim);
    outerSurface = [];
    /*
    innerSphere(innerSurface, dim);
    innerSurface = [];
    */
}
