import { BeforeChatEvent, Player, world } from "mojang-minecraft";
import config from "../../data/config.js";
import { crypto } from "../../util.js";

/**
 * @name deop
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function deop(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Are there arguements
    if (!args.length) {
        return void 0;
    }

    // try to find the player requested
    let member: Player;
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

    // Check for hash/salt and validate password from member
    let memberHash = member.getDynamicProperty("hash");
    let memberSalt = member.getDynamicProperty("salt");
    let memberEncode: string;
    try {
        memberEncode = crypto(memberSalt, config.permission.password);
    } catch (error) {}

    if (memberHash !== undefined && memberHash === memberEncode) {
        member.removeDynamicProperty("hash");
        member.removeDynamicProperty("salt");
        player.tell(`§2[§7Deadlock§2]§r ${member.name} had permissions removed from Deadlock.`);
        return member.tell(`§2[§7Deadlock§2]§r Permissions for Deadlock are revoked.`);
    }
    return player.tell(`§2[§7Deadlock§2]§r ${member.name} never had permission to use Deadlock.`);
}
