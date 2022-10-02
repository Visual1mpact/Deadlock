import { BeforeChatEvent, world } from "mojang-minecraft";

/**
 * @name debug
 * @param {BeforeChatEvent} message - Message object
 */
export function debug(message: BeforeChatEvent) {
    message.cancel = true;

    const player = message.sender;

    const debug = world.getDynamicProperty("debug");

    // Disable
    if (debug) {
        world.setDynamicProperty("debug", false);
        world.say(`§2[§7Deadlock§2]§f Debug has been turned off by ${player.name}.`);
    }

    // Enable
    if (!debug) {
        world.setDynamicProperty("debug", true);
        world.say(`§2[§7Deadlock§2]§f Debug has been turned on by ${player.name}.`);
    }
}
