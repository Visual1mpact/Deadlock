import { world, BeforeChatEvent, EntityInventoryComponent, ItemEnchantsComponent, MinecraftEnchantmentTypes, Enchantment, Player } from "mojang-minecraft";
import { enchantmentSlot } from "../../data/enchantment.js";
import { toCamelCase } from "../../util.js";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}enchant [options]
     §fEnchants items and shows list of allowed enchantments for items.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-t <username>, --target <username>
     §fTargets a specific player.
 §2|  §7-e <enchantment>, --enchant <enchantment>
     §fSelects enchantment type for items.
 §2|  §7-l <enchant level>, --level <enchant level>
     §fSelects enchantment level for items.
 §2|  §7-ll, --list
     §fLists allowed enchantments for items.

`;

    return help;
}

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
        // Is this item allowed to have this enchantment
        const enchantLevel = enchantedSlot[enchants];
        if (enchantLevel) {
            player.tell(` | §7Type: §2[§f${enchants}§2]§r §7=>§r §7Level: §2[§f${enchantLevel}§2]§r`);
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

    // Get players selected slot
    const hand = player.selectedSlot;

    // Get prefix from player
    let prefix = String(player.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    // Are there arguements
    if (!args.length) {
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}enchant -h for command options.`);
    }

    /**
     * Define variable outside the scope of a loop.
     * Conditionally check non positional parameters.
     */
    let i: number = args.length - 1;
    let caseOne: boolean = false;
    let caseTwo: boolean = false;
    let caseThree: boolean = false;
    let caseFour: boolean = false;
    let caseFive: boolean = false;
    let enchantType: string = undefined;
    let target: string = undefined;
    let level: number = undefined;
    for (; i >= 0; --i) {
        switch (true) {
            case ["-h", "--help"].includes(args[i].toLowerCase()):
                caseOne = true;
                player.tell(usage(prefix));
                break;
            case ["-t", "--target"].includes(args[i].toLowerCase()):
                caseTwo = true;
                target = args[i + 1];
                break;
            case ["-e", "--enchant"].includes(args[i].toLowerCase()):
                caseThree = true;
                enchantType = args[i + 1];
                break;
            case ["-l", "--level"].includes(args[i].toLowerCase()):
                caseFour = true;
                level = Number(args[i + 1]);
                break;
            case ["-ll", "--list"].includes(args[i].toLowerCase()):
                caseTwo = true;
                caseThree = true;
                caseFour = true;
                caseFive = true;
                enchantIntegrityList(player, hand);
                break;
        }
    }
    if (caseOne) {
        return;
    }
    if (!caseTwo) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -t | --target.\n              See ${prefix}enchant -h for more information.`);
    }
    if (!caseThree) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -e | --enchant.\n              See ${prefix}enchant -h for more information.`);
    }
    if (!caseFour) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -l | --level.\n              See ${prefix}enchant -h for more information.`);
    }
    if (caseFive) {
        return;
    }

    // try to find the player requested
    let pl: Player = undefined;
    let member: Player = undefined;
    for (pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(target.toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    if (!member) {
        return player.tell(`§2[§7Deadlock§2]§f Couldn't find that player!`);
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
    const invComponent = member.getComponent("minecraft:inventory") as EntityInventoryComponent;
    const invContainer = invComponent.container;
    const item = invContainer.getItem(hand);
    // If no item exists in the selected slot then abort
    if (!item) {
        if (member.name !== player.name) {
            player.tell(`§2[§7Deadlock§2]§f They must select an item in their hotbar.`);
        }
        return member.tell(`§2[§7Deadlock§2]§f Please select an item in your hotbar.`);
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
