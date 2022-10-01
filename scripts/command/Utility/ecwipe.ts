import { BeforeChatEvent, Player, world } from "mojang-minecraft";

/**
 * @name ecwipe
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided.
 */
export function ecwipe(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Are there arguements
    if (!args.length) {
        return void 0;
    }

    // try to find the player requested
    let member: Player;
    for (const pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
        }
    }

    if (!member) {
        return player.tell(`§2[§7Deadlock§2]§r Couldn't find that player!`);
    }

    // There are 30 slots ranging from 0 to 29
    for (let slot = 0; slot < 30; slot++) {
        /**
         * Try/Catch guard is needed since the container for the enderchest is not exposed for the API.
         * We have to use a function command to clear the chest and since we can't properly determine if slots
         * are empty or not this ultimately could report unnecessary outputs to the console. We want to ignore.
         */
        try {
            member.runCommand(`replaceitem entity @s slot.enderchest ${slot} air`);
        } catch (ignore) {}
    }
    return player.tell(`§2[§7Deadlock§2]§r Wiped ${member.name}'s enderchest.`);
}
