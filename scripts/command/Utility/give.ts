import { BeforeChatEvent, EntityInventoryComponent, Player, world, MinecraftItemTypes, ItemStack } from "mojang-minecraft";
import maxItemStack, { defaultMaxItemStack } from "../../data/maxstack.js";
import { toCamelCase } from "../../util.js";

/**
 * @name give
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function give(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Are there arguements
    if (!args.length) {
        return void 0;
    }

    // Try to find the player requested
    let member: Player = undefined;
    if (args.length) {
        let pl: Player = undefined;
        for (pl of world.getPlayers()) {
            if (pl.nameTag.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
            }
        }
    }

    // Are they online?
    if (!member) {
        return player.tell(`§2[§7Deadlock§2]§r Couldn't find that player!`);
    }

    /**
     * Verify if the parameters are valid to prevent errors
     * args[0] = username
     * args[1] = item
     * args[2] = amount
     * args[3] = data (optional)
     */
    let confirmItem = false;
    const itemStringConvert = toCamelCase(args[1]);
    let itemValidate: string = undefined;
    for (itemValidate in MinecraftItemTypes) {
        if (itemStringConvert === itemValidate) {
            confirmItem = true;
            break;
        }
    }
    if (confirmItem) {
        if (isNaN(Number(args[2]))) {
            /**
             * This parameter is invalid so we will remove it and add a default value of 1.
             */
            args.splice(2, 1, "1");
        }
        if (isNaN(Number(args[3]))) {
            /**
             * This parameter is invalid
             */
            args.splice(3, 1, "0");
        }
        const maxStack = maxItemStack[itemStringConvert.replace(itemStringConvert, "minecraft:" + args[1])] ?? defaultMaxItemStack;
        if (maxStack >= Number(args[2])) {
            const invContainer = member.getComponent("inventory") as EntityInventoryComponent;
            const inv = invContainer.container;
            const item = new ItemStack(MinecraftItemTypes[itemStringConvert], Number(args[2]), Number(args[3]));
            inv.addItem(item);
            return player.tell(`§2[§7Deadlock§2]§r ${member.name} was given ${args[1]} x${args[2]}.`);
        } else {
            return player.tell(`§2[§7Deadlock§2]§r This stack is too high! ${maxStack} is the max. Try again.`);
        }
    } else {
        return player.tell(`§2[§7Deadlock§2]§r This item could not be found! Try again.`);
    }
}
