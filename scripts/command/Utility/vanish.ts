import { BeforeChatEvent, MinecraftEffectTypes } from "mojang-minecraft";

/**
 * @name vanish
 * @param {BeforeChatEvent} message - Message object
 */
export function vanish(message: BeforeChatEvent) {
    message.cancel = true;

    const player = message.sender;

    // Disable
    if (player.hasTag("vanish") === true && player.getDynamicProperty("vanish") === true) {
        player.setDynamicProperty("vanish", false);
        player.removeTag("vanish");
        player.triggerEvent("unvanish");
        if (player.getEffect(MinecraftEffectTypes.invisibility) !== undefined || player.getEffect(MinecraftEffectTypes.nightVision) !== undefined) {
            player.runCommand(`effect @s clear`);
        }
        return player.tell(`§2[§7Deadlock§2]§r You are no longer vanished.`);
    }

    // Enable
    if (player.hasTag("vanish") === false && (player.getDynamicProperty("vanish") === false || player.getDynamicProperty("vanish") === undefined)) {
        player.setDynamicProperty("vanish", true);
        player.addTag("vanish");
        player.triggerEvent("vanish");
        return player.tell(`§2[§7Deadlock§2]§r You are now vanished.`);
    }

    // Did something go wrong? Fix it.
    if (
        (player.hasTag("vanish") === true && (player.getDynamicProperty("vanish") === false || player.getDynamicProperty("vanish") === undefined)) ||
        (!player.hasTag("vanish") === false && (player.getDynamicProperty("vanish") === true || player.getDynamicProperty("vanish") === undefined))
    ) {
        player.setDynamicProperty("vanish", false);
        player.removeTag("vanish");
        player.triggerEvent("unvanish");
        if (player.getEffect(MinecraftEffectTypes.invisibility) !== undefined || player.getEffect(MinecraftEffectTypes.nightVision) !== undefined) {
            player.runCommand(`effect @s clear`);
        }
        return player.tell(`§2[§7Deadlock§2]§r Something was wrong with vanish. Please try again.`);
    }
}
