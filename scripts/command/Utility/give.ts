import { BeforeChatEvent, EntityInventoryComponent, Player, world, MinecraftItemTypes, ItemStack } from "mojang-minecraft";
import maxItemStack, { defaultMaxItemStack } from "../../data/maxstack.js";
import { toCamelCase } from "../../util.js";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}give [options]
     §fGives a player an item.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-t <username>, --target <username>
     §fTargets a specific player.
 §2|  §7-i <type>, --item <type>
     §fSets item type.
 §2|  §7-a <number>, --amount <number>
     §fSets total amount for item type.
 §2|  §7-d <number>, --data <number>
     §fSets variant for item type if one exists.

`;

    return help;
}

/**
 * @name give
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function give(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    let member: Player = undefined;

    // Get prefix from player
    let prefix = String(player.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    // Are there arguements
    if (!args.length) {
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}give -h for command options.`);
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
    let target: string = undefined;
    let selectedItem: string = undefined;
    let amount: number = undefined;
    let data: number = undefined;
    for (; i >= 0; --i) {
        switch (true) {
            case ["-h", "--help"].includes(args[i]):
                caseOne = true;
                player.tell(usage(prefix));
                break;
            case ["-t", "--target"].includes(args[i]):
                caseTwo = true;
                target = args[i + 1];
                break;
            case ["-i", "--item"].includes(args[i]):
                caseThree = true;
                selectedItem = args[i + 1];
                break;
            case ["-a", "--amount"].includes(args[i]):
                caseFour = true;
                amount = Number(args[i + 1]);
                break;
            case ["-d", "--data"].includes(args[i]):
                data = Number(args[i + 1]);
                break;
        }
    }
    if (caseOne) {
        return;
    }
    if (!caseTwo) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -t | --target.\n              See ${prefix}give -h for more information.`);
    }
    if (!caseThree) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -i | --item.\n              See ${prefix}give -h for more information.`);
    }
    if (!caseFour) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -a | --amount.\n              See ${prefix}give -h for more information.`);
    }

    // try to find the player requested
    let pl: Player = undefined;
    for (pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(target.toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
        }
    }

    if (!member) {
        return player.tell(`§2[§7Deadlock§2]§f Couldn't find that player!`);
    }

    /**
     * Verify if the parameters are valid to prevent errors
     */
    let confirmItem = false;
    const itemStringConvert = toCamelCase(selectedItem);
    let itemValidate: string = undefined;
    for (itemValidate in MinecraftItemTypes) {
        if (itemStringConvert === itemValidate) {
            confirmItem = true;
            break;
        }
    }
    if (confirmItem) {
        if (isNaN(amount)) {
            /**
             * This parameter is invalid so we will remove it and add a default value of 1.
             */
            let modification = String(amount);
            amount = Number(modification.replace(modification, "1"));
        }
        if (isNaN(data) || data === undefined) {
            /**
             * This parameter is invalid
             */
            let modification = String(amount);
            data = Number(modification.replace(modification, "0"));
        }
        const maxStack = maxItemStack[itemStringConvert.replace(itemStringConvert, "minecraft:" + selectedItem)] ?? defaultMaxItemStack;
        if (maxStack >= amount) {
            const invContainer = member.getComponent("inventory") as EntityInventoryComponent;
            const inv = invContainer.container;
            const item = new ItemStack(MinecraftItemTypes[itemStringConvert], amount, data);
            inv.addItem(item);
            return player.tell(`§2[§7Deadlock§2]§f ${member.name} was given ${selectedItem} x${amount}.`);
        } else {
            return player.tell(`§2[§7Deadlock§2]§f This stack is too high! ${maxStack} is the max. Try again.`);
        }
    } else {
        return player.tell(`§2[§7Deadlock§2]§f This item could not be found! Try again.`);
    }
}
