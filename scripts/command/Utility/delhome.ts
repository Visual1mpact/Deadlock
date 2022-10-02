import { BeforeChatEvent } from "mojang-minecraft";
import { Base64 } from "../../util.js";

/**
 * @name delhome
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function delhome(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Are there arguements
    if (!args.length) {
        return void 0;
    }

    // Don't allow spaces
    if (args.length > 1) {
        player.tell(`§2[§7Deadlock§2]§f No spaces in names please.`);
        return void 0;
    }

    // Find and delete this saved home location
    let verify = false;
    let divider: string[] = undefined;
    const homeSetting = args[0];
    let tags = player.getTags();
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    const regex = /-/g;
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
            if (home === homeSetting) {
                verify = true;
                player.removeTag(tags[i]);
                player.tell(`§2[§7Deadlock§2]§f Successfully deleted home '${homeSetting}'.`);
                break;
            }
        }
    }
    if (verify === true) {
        return void 0;
    } else {
        player.tell(`§2[§7Deadlock§2]§f Home '${homeSetting}' does not exist.`);
    }
}
