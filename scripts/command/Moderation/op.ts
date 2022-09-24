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

    // Check for hash/salt and validate password
    let hash = player.getDynamicProperty("hash");
    let salt = player.getDynamicProperty("salt");
    let encode: string = undefined;
    // If no salt then create one
    if (salt === undefined && args[0] === config.permission.password) {
        player.setDynamicProperty("salt", UUID.generate());
        salt = player.getDynamicProperty("salt");
    }
    // If no hash then create one
    if (hash === undefined && args[0] === config.permission.password) {
        encode = crypto(salt, config.permission.password);
        player.setDynamicProperty("hash", encode);
        hash = player.getDynamicProperty("hash");
    } else {
        try {
            encode = crypto(salt, config.permission.password);
        } catch (error) {}
    }
    // Make sure the user has permissions to run the command
    if (hash === undefined || config.permission.password === "PutPasswordHere" || (hash !== encode && args[0] !== config.permission.password)) {
        return player.tell(`You do not have permission to use this command.`);
    } else if (hash === encode && args[0] === config.permission.password) {
        player.tell(`You have permission to use Deadlock.`);
        return;
    }

    // Are there arguements
    if (!args.length) {
        return void 0;
    }

    // try to find the player requested
    let member: Player = undefined;
    if (args.length) {
        for (const pl of world.getPlayers()) {
            if (pl.nameTag.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
            }
        }
    }

    if (!member) {
        return player.tell(`Couldn't find that player!`);
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
    member.tell(`You have permission to use Deadlock.`);
}
