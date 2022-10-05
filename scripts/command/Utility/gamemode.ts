import { BeforeChatEvent } from "mojang-minecraft";

/**
 * @name gamemode
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function gamemode(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Are there arguements
    if (!args.length) {
        return void 0;
    }

    // Let's change their gamemode
    switch (true) {
        case args[0].toLowerCase() === "survival" || args[0].toLowerCase() === "s":
            player.tell(`§2[§7Deadlock§2]§f Your game mode has been updated to Survial.`);
            player.runCommandAsync(`gamemode s`);
            break;
        case args[0].toLowerCase() === "creative" || args[0].toLowerCase() === "c":
            player.tell(`§2[§7Deadlock§2]§f Your game mode has been updated to Creative.`);
            player.runCommandAsync(`gamemode c`);
            break;
        case args[0].toLowerCase() === "adventure" || args[0].toLowerCase() === "a":
            player.tell(`§2[§7Deadlock§2]§f Your game mode has been updated to Adventure.`);
            player.runCommandAsync(`gamemode a`);
            break;
        default:
            return player.tell(`§2[§7Deadlock§2]§f ${args[0]} is not a game mode. Try again.`);
    }
}
