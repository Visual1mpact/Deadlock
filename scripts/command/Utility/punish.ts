import { world, ItemStack, MinecraftItemTypes, Player, BeforeChatEvent, EntityInventoryComponent } from "mojang-minecraft";

/**
 * @name punish
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function punish(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Are there arguements
    if (!args.length) {
        return void 0;
    }

    // Try to find the player requested
    let member: Player = undefined;
    if (args.length) {
        for (const pl of world.getPlayers()) {
            if (pl.nameTag.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
            }
        }
    }

    // Are they online?
    if (!member) {
        return player.tell(`§2[§7Deadlock§2]§r Couldn't find that player!`);
    }

    // Make sure they don't punish themselves
    if (member === player) {
        return player.tell(`§2[§7Deadlock§2]§r You cannot punish yourself.`);
    }

    // There are 30 slots ranging from 0 to 29
    // Let's clear out that ender chest
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

    // Get requested player's inventory so we can wipe it out
    const inventoryContainer = member.getComponent("minecraft:inventory") as EntityInventoryComponent;
    const inventory = inventoryContainer.container;
    for (let i = 0; i < inventory.size; i++) {
        const inventory_item = inventory.getItem(i);
        if (!inventory_item) {
            continue;
        }
        inventory.setItem(i, new ItemStack(MinecraftItemTypes.air, 1));
    }
    // Notify the player that they have been punished.
    member.tell(`§2[§7Deadlock§2]§r You have been punished for your behavior.`);
    // Notify the executor that the player has been punished.
    return player.tell(`§2[§7Deadlock§2]§r ${member.nameTag}§r has been punished.§r`);
}
