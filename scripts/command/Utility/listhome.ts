import { BeforeChatEvent } from "mojang-minecraft";
import { Base64 } from "../../util.js";

/**
 * @name listhome
 * @param {BeforeChatEvent} message - Message object
 */
export function listhome(message: BeforeChatEvent) {
    message.cancel = true;

    const player = message.sender;

    let divider: string[] = undefined;
    let verify = false;
    let tags = player.getTags();
    const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    const regex = /-/g;
    player.tell(`§l§2[§7List Of Homes§2]§r`);
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
            player.tell(` | §2[§f${home}§2]§r §7=>§r ${px} ${py} ${pz} §7<=§r §2[§f${pd}§2]§r`);
            verify = true;
        }
    }
    if (!verify) {
        // If we reached this point then it doesn't exist
        return player.tell(`You have no saved locations.`);
    }
}
