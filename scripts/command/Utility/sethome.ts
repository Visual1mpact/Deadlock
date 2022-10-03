import { BeforeChatEvent } from "mojang-minecraft";
import { Base64 } from "../../util.js";

/**
 * @name sethome
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function sethome(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Are there arguements
    if (!args.length) {
        return void 0;
    }

    // Don't allow spaces
    if (args.length > 1 || args[0].trim().length === 0) {
        player.tell(`§2[§7Deadlock§2]§f No spaces in names please.`);
        return void 0;
    }

    // Get current location
    const { x, y, z } = player.location;

    const homex = x.toFixed(0);
    const homey = y.toFixed(0);
    const homez = z.toFixed(0);
    const b64HX = Base64.encode(homex);
    const b64HY = Base64.encode(homey);
    const b64HZ = Base64.encode(homez);

    // Get current Dimension
    let currentDimension: string;
    let b64CD: string;

    // Save which dimension they were in
    if (player.dimension.id === "minecraft:overworld") {
        currentDimension = "overworld";
        b64CD = Base64.encode(currentDimension);
    }
    if (player.dimension.id === "minecraft:nether") {
        currentDimension = "nether";
        b64CD = Base64.encode(currentDimension);
    }
    if (player.dimension.id === "minecraft:the_end") {
        return player.tell(`§2[§7Deadlock§2]§f Not allowed to set home in this dimension.`);
    }

    const homeSetting = args[0];
    const b64HS = Base64.encode(homeSetting);

    const playerSetting = `${b64HS}-${b64HX}-${b64HY}-${b64HZ}-${b64CD}`;
    const b64PS = "Deadlock-" + Base64.encode(playerSetting);

    let counter = 0;
    let verify = false;
    let divider: string[] = undefined;
    let tags = player.getTags();
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    const regex = /-/g;
    // Make sure this name doesn't exist already and it doesn't exceed limitations
    let i = tags.length - 1;
    for (; i >= 0; --i) {
        if (tags[i].startsWith("Deadlock-")) {
            // Check if its a valid base64
            const valid = base64regex.test(tags[i].replace("Deadlock-", ""));
            if (!valid) {
                player.removeTag(tags[i]);
                continue;
            }
            const base64Integrity = Base64.decode(tags[i].replace("Deadlock-", ""));
            const count = (base64Integrity.match(regex) || []).length;
            if (count !== 4) {
                player.removeTag(tags[i]);
                continue;
            }
            divider = base64Integrity.split("-");
            const home: string = Base64.decode(divider[0]);
            const px: number = Number(Base64.decode(divider[1]));
            const py: number = Number(Base64.decode(divider[2]));
            const pz: number = Number(Base64.decode(divider[3]));
            const pd: string = Base64.decode(divider[4]);
            // Validate strings and numbers
            if (typeof home !== "string" || isNaN(px) || isNaN(py) || isNaN(pz) || typeof pd !== "string") {
                player.removeTag(tags[i]);
                continue;
            }
            if (home === homeSetting) {
                verify = true;
                player.tell(`§2[§7Deadlock§2]§f Home with name '${homeSetting}' already exists.`);
                break;
            }
            counter = ++counter;
        }
        if (counter >= 5) {
            verify = true;
            player.tell(`§2[§7Deadlock§2]§f You can only have 5 saved locations at a time.`);
            break;
        }
    }
    if (verify === true) {
        verify = false;
        return void 0;
    }

    // Store their new home coordinates
    player.addTag(b64PS);

    player.tell(`§2[§7Deadlock§2]§f Home '${homeSetting}' has been set at ${homex} ${homey} ${homez}.`);
}
