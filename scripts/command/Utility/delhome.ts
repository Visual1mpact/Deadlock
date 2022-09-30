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
        player.tell(`No spaces in names please.`);
        return void 0;
    }

    // Find and delete this saved home location
    let verify = false;
    let divider: string[] = undefined;
    const homeSetting = args[0];
    let tags = player.getTags();
    for (let i = tags.length - 1; i >= 0; i--) {
        if (tags[i].startsWith("Deadlock-")) {
            let base64Integrity = Base64.decode(tags[i].replace("Deadlock-", ""));
            divider = base64Integrity.split("-");
            const home: string = Base64.decode(divider[0]);
            if (home === homeSetting) {
                verify = true;
                player.removeTag(tags[i]);
                player.tell(`Successfully deleted home '${homeSetting}'.`);
                break;
            }
        }
    }
    if (verify === true) {
        return void 0;
    } else {
        player.tell(`Home '${homeSetting}' does not exist.`);
    }
}
