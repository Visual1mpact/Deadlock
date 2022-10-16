import { BeforeChatEvent, ItemStack, MinecraftItemTypes, Player, world } from "mojang-minecraft";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}listitems [options]
     §fPrints every item in the game and their max stack according to Gametest.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.

`;

    return help;
}

/**
 * @name listitems
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function listitems(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Get prefix from player
    let prefix = String(player.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    /**
     * Define variable outside the scope of a loop.
     * Conditionally check non positional parameters.
     */
    let i: number = args.length - 1;
    let caseOne: boolean = false;
    for (; i >= 0; --i) {
        switch (true) {
            case ["-h", "--help"].includes(args[i].toLowerCase()):
                caseOne = true;
                player.tell(usage(prefix));
                break;
        }
    }
    if (caseOne) {
        return void 0;
    }

    for (const item in MinecraftItemTypes) {
        let itemInfo = new ItemStack(MinecraftItemTypes[item]);
        itemInfo.amount = 255;
        console.log("'" + itemInfo.id + "': " + itemInfo.amount + ",");
    }
    return player.tell(`§2[§7Deadlock§2]§f List completed. Check console logs.`);
}
