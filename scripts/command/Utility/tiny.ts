import { BeforeChatEvent } from "mojang-minecraft";

/**
 * @name tiny
 * @param {BeforeChatEvent} message - Message object
 */
export function tiny(message: BeforeChatEvent) {
    message.cancel = true;

    const player = message.sender;

    // Enable
    if (player.getDynamicProperty("tiny") === false || player.getDynamicProperty("tiny") === undefined) {
        player.setDynamicProperty("tiny", true);
        player.tell(`§2[§7Deadlock§2]§r You have been made bite size.`);
        // Check if player is vanished to prevent conflicts
        if (player.getDynamicProperty("vanish") === true) {
            return void 0;
        }
        return player.triggerEvent("scaledown");
    }

    // Disable
    if (player.getDynamicProperty("tiny") === true) {
        player.setDynamicProperty("tiny", false);
        player.tell(`§2[§7Deadlock§2]§r Your original size has been restored.`);
        // Check if player is vanished to prevent conflicts
        if (player.getDynamicProperty("vanish") === true) {
            return void 0;
        }
        return player.triggerEvent("scaleup");
    }
}
