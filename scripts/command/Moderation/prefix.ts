import { BeforeChatEvent, world } from "mojang-minecraft";

/**
 * @name prefix
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function prefix(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Are there arguements
    if (!args.length) {
        return void 0;
    }

    // Check if array contains the string 'reset'
    let argcheck = args.includes("reset");

    // Reset prefix
    if (argcheck === true && player.getDynamicProperty("privatePrefix") !== undefined) {
        player.setDynamicProperty("privatePrefix", world.getDynamicProperty("prefix"));
        return;
    }

    if (args[0][0] == "/") {
        return player.tell(`§2[§7Deadlock§2]§r Using prefix '/' is not allowed! Please try another one.`);
    }

    // Change Prefix command under conditions
    if (args[0].length <= 1 && args[0].length >= 1) {
        player.tell(`§2[§7Deadlock§2]§r Prefix has been changed to '${args[0]}'.`);
        return player.setDynamicProperty("privatePrefix", args[0]);
    } else {
        player.tell(`§2[§7Deadlock§2]§r Prefix length cannot be more than 1 character.`);
    }
}
