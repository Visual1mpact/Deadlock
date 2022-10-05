import { BeforeChatEvent, EntityInventoryComponent, ItemEnchantsComponent, MinecraftEnchantmentTypes, Enchantment } from "mojang-minecraft";
import { enchantmentSlot } from "../../data/enchantment.js";
import { toCamelCase } from "../../util.js";

/**
 * @name enchant
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function enchant(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Are there arguements
    if (args.length !== 2) {
        return void 0;
    }

    const enchantType = args[0];
    const level = Number(args[1]);

    // Get players selected slot
    const hand = player.selectedSlot;

    // Make sure enchantment type even exists
    if (!(enchantType in MinecraftEnchantmentTypes)) {
        player.tell(`§2[§7Deadlock§2]§f ${enchantType} is not a valid enchantment.`);
    }
    // Make sure level is not NaN
    if (isNaN(level)) {
        return player.tell(`§2[§7Deadlock§2]§f ${args[1]} is not a valid number.`);
    }

    // Modify string
    const changeCase = toCamelCase(enchantType);

    // Get item from players inventory if selected slot contains an item
    const invComponent = player.getComponent("minecraft:inventory") as EntityInventoryComponent;
    const invContainer = invComponent.container;
    const item = invContainer.getItem(hand);
    // If no item exists in the selected slot then abort
    if (!item) {
        return player.tell(`§2[§7Deadlock§2]§f Please select an item in your hotbar.`);
    }
    // Get component for enchantments
    const itemComponent = item.getComponent("minecraft:enchantments") as ItemEnchantsComponent;
    // Get collection of enchantments
    const itemEnchantments = itemComponent.enchantments;
    // List of allowed enchantments on item
    const enchantedSlot = enchantmentSlot[itemEnchantments.slot];
    // Is this item allowed to have this enchantment
    const enchantLevel = enchantedSlot[changeCase];
    // Get properties of this enchantment
    const enchantData = itemEnchantments.getEnchantment(MinecraftEnchantmentTypes[changeCase]);
    if (!enchantLevel) {
        return player.tell(`§2[§7Deadlock§2]§f ${item.id.replace("minecraft:", "")} doesn't allow ${changeCase}.`);
    }
    // Does it exceed level limitations for this enchantment
    if ((enchantLevel && level > enchantLevel) || level < 0) {
        return player.tell(`§2[§7Deadlock§2]§f ${item.id.replace("minecraft:", "")} doesn't allow ${changeCase} at level ${level}.`);
    }
    // Add enchantment
    itemEnchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes[changeCase], level));
    itemComponent.enchantments = itemEnchantments;
    invComponent.container.setItem(hand, item);
}
