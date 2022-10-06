import { BeforeChatEvent, EntityInventoryComponent, ItemEnchantsComponent, MinecraftEnchantmentTypes, Enchantment, Player } from "mojang-minecraft";
import { enchantmentSlot } from "../../data/enchantment.js";
import { toCamelCase } from "../../util.js";

/**
 * We call this function to print off all enchantment types allowed
 * for the targeted item from the players selected slot.
 * @param player
 * @param hand
 * @returns
 */
function enchantIntegrityList(player: Player, hand: number) {
    let enchants: string = undefined;
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
    // List items on screen from here
    player.tell(`§2[§7Deadlock§2]§f Allowed Enchantments §2(§7${item.id.replace("minecraft:", "")}§2)§r`);
    let verify = false;
    for (enchants in MinecraftEnchantmentTypes) {
        const changeCase = toCamelCase(enchants);
        // Is this item allowed to have this enchantment
        const enchantLevel = enchantedSlot[changeCase];
        if (enchantLevel) {
            player.tell(` | §7Type: §2[§f${changeCase.toLowerCase()}§2]§r §7=>§r §7Level: §2[§f${enchantLevel}§2]§r`);
            verify = true;
        }
    }
    // If no enchantments are allowed on the item then inform them of this
    if (!verify) {
        player.tell(` | §7Type: §2[§fnone§2]§r §7=>§r §7Level: §2[§f0§2]§r`);
    }
}

/**
 * @name enchant
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function enchant(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    const enchantType = args[0];
    const level = Number(args[1]);

    // Get players selected slot
    const hand = player.selectedSlot;

    // Get list of enchantments allowed for the selected items
    if (args[0] === "list") {
        return enchantIntegrityList(player, hand);
    }

    // Are there arguements
    if (args.length !== 2) {
        return void 0;
    }

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
