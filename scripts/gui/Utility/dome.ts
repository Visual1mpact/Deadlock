import { BlockLocation, Dimension, MinecraftBlockTypes, Player } from "mojang-minecraft";
import { ModalFormResponse } from "mojang-minecraft-ui";
import { toCamelCase } from "../../util";

function outerSphere(outerSurface: any, blockType: string, dim: Dimension) {
    let blockCreation = [];
    for (const [x, y, z] of outerSurface) {
        blockCreation.push(dim.getBlock(new BlockLocation(x, y, z)));
    }
    outerSurface = [];
    for (const resurrect of blockCreation) {
        resurrect.setType(MinecraftBlockTypes[blockType]);
    }
    blockCreation = [];
}

export function guiDome(opResult: ModalFormResponse, source: Player) {
    const [slider, textField, toggle] = opResult.formValues;

    // Set sphere or hemisphere
    let shape: number = undefined;
    let radiusMax: number = slider;
    if (toggle) {
        shape = -slider;
    } else {
        shape = 0;
    }

    const blockType = toCamelCase(textField.replace("minecraft:", ""));
    const blockType2 = textField.replace("minecraft:", "");

    const blockTypeVerification = MinecraftBlockTypes.get("minecraft:" + blockType2);
    if (blockTypeVerification == undefined) {
        return source.tell(`§2[§7Deadlock§2]§f Unknown block '${blockType}'.`);
    }

    const { x: cx, y: cy, z: cz } = source.location,
        dim = source.dimension;

    const radiusMin = radiusMax - 1;
    const radiusMax2 = radiusMax ** 2,
        radiusMin2 = radiusMin ** 2;

    let outerSurface: [number, number, number][] = [];

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
                        outerSurface.push([cx + x, cy + y, cz + z]);
                    }
                }

                // inner sphere
                else if (radiusMin2 > dist) {
                    for (const [x, y, z] of locations) {
                        let integrity = dim.getBlock(new BlockLocation(cx + x, cy + y, cz + z));
                        if (!integrity) {
                            continue;
                        }
                        integrity.setType(MinecraftBlockTypes["air"]);
                    }
                }
            }
        }
    }
    outerSphere(outerSurface, blockType, dim);
    outerSurface = [];
}
