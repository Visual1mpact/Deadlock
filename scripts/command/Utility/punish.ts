import { world, ItemStack, MinecraftItemTypes, Player, BeforeChatEvent, EntityInventoryComponent } from "mojang-minecraft";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}punish [options]
     §fClear players ender chest and inventory.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-t <username>, --target <username>
     §fTargets a specific player.

`;

    return help;
}

/**
 * @name punish
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function punish(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Get prefix from player
    let prefix = String(player.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    // Are there arguements
    if (!args.length) {
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}punish -h for command options.`);
    }

    /**
     * Define variable outside the scope of a loop.
     * Conditionally check non positional parameters.
     */
    let i: number = args.length - 1;
    let caseOne: boolean = false;
    let caseTwo: boolean = false;
    let target: string = undefined;
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
        }
    }
    if (caseOne) {
        return;
    }
    if (!caseTwo) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -t | --target.\n              See ${prefix}punish -h for more information.`);
    }

    // Try to find the player requested
    let member: Player = undefined;
    let pl: Player = undefined;
    for (pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(target.toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    // Are they online?
    if (!member) {
        return player.tell(`§2[§7Deadlock§2]§f Couldn't find that player!`);
    }

    // Make sure they don't punish themselves
    if (member.name === player.name) {
        return player.tell(`§2[§7Deadlock§2]§f You cannot punish yourself.`);
    }

    // There are 30 slots ranging from 0 to 29
    // Let's clear out that ender chest
    let slot = 29;
    for (; slot >= 0; --slot) {
        /**
         * Try/Catch guard is needed since the container for the enderchest is not exposed for the API.
         * We have to use a function command to clear the chest and since we can't properly determine if slots
         * are empty or not this ultimately could report unnecessary outputs to the console. We want to ignore.
         */
        try {
            member.runCommandAsync(`replaceitem entity @s slot.enderchest ${slot} air`);
        } catch (ignore) {}
    }

    // Get requested player's inventory so we can wipe it out
    const inventoryContainer = member.getComponent("minecraft:inventory") as EntityInventoryComponent;
    const inventory = inventoryContainer.container;
    let i2 = inventory.size;
    for (; i2 >= 0; --i2) {
        const inventory_item = inventory.getItem(i);
        if (!inventory_item) {
            continue;
        }
        inventory.setItem(i2, new ItemStack(MinecraftItemTypes.air, 1));
    }
    // Notify the player that they have been punished.
    member.tell(`§2[§7Deadlock§2]§f You have been punished for your behavior.`);
    // Notify the executor that the player has been punished.
    return player.tell(`§2[§7Deadlock§2]§f ${member.nameTag}§r has been punished.§r`);
}
