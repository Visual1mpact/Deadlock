import { BeforeChatEvent, Player, world } from "mojang-minecraft";
import config from "../../data/config.js";
import { crypto, UUID } from "../../util.js";

/**
 * @name op
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function op(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Are there arguements
    if (!args.length) {
        return void 0;
    }

    // try to find the player requested
    let member: Player = undefined;
    if (args.length) {
        let pl: Player = undefined;
        for (pl of world.getPlayers()) {
            if (pl.nameTag.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
            }
        }
    }

    if (!member) {
        return player.tell(`§2[§7Deadlock§2]§r Couldn't find that player!`);
    }

    // Check for hash/salt and validate password
    let memberHash = member.getDynamicProperty("hash");
    let memberSalt = member.getDynamicProperty("salt");
    // If no salt then create one
    if (memberSalt === undefined) {
        member.setDynamicProperty("salt", UUID.generate());
    }
    // If no hash then create one
    if (memberHash === undefined) {
        const encode = crypto(memberSalt, config.permission.password);
        member.setDynamicProperty("hash", encode);
    }
    member.tell(`§2[§7Deadlock§2]§r You have permission to use Deadlock.`);
}
