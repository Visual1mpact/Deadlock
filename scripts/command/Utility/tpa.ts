import { world, Player, BeforeChatEvent } from "mojang-minecraft";

/**
 * @name tpa
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function tpa(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Are there arguements
    if (!args.length) {
        return void 0;
    }

    let artificalPlayer: Player;
    let member: Player;

    // Try to find the player requested
    for (const pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
            artificalPlayer = pl;
        }
        if (pl.nameTag.toLowerCase().includes(args[1].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
        }
        if (artificalPlayer && member) {
            break;
        }
    }
    // Are they online?
    if (!member) {
        return player.tell(`§2[§7Deadlock§2]§r Couldn't find that player!`);
    }

    // Check if teleporting to them or vice versa then set it up
    if (args[0] && args[1]) {
        // Let's teleport you to that player
        artificalPlayer.teleport(member.location, member.dimension, 0, 0);
        // Let you know that you have been teleported
        return player.tell(`§2[§7Deadlock§2]§r Teleported ${artificalPlayer.name} to ${member.name}`);
    } else {
        // Need to specify from and where
        return player.tell(`§2[§7Deadlock§2]§r You forgot to mention 'from' and 'where' to teleport.`);
    }
}
