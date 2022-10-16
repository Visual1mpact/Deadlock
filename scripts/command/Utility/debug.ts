import { BeforeChatEvent, world } from "mojang-minecraft";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}debug [options]
     §fDisplay information for debugging.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-e, --enable
     §fEnables debugging information.
 §2|  §7-d, --disable
     §fDisables debugging information.

`;

    return help;
}

/**
 * @name debug
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function debug(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Get prefix from player
    let prefix = String(player.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    // Are there arguements
    if (!args.length) {
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}debug -h for command options.`);
    }

    /**
     * Define variable outside the scope of a loop.
     * Conditionally check non positional parameters.
     */
    let i: number = args.length - 1;
    let caseOne: boolean = false;
    let caseTwo: boolean = false;
    let caseThree: boolean = false;
    for (; i >= 0; --i) {
        switch (true) {
            case ["-h", "--help"].includes(args[i].toLowerCase()):
                caseOne = true;
                player.tell(usage(prefix));
                break;
            case ["-d", "--disable"].includes(args[i].toLowerCase()):
                caseTwo = true;
                world.setDynamicProperty("debug", false);
                world.say(`§2[§7Deadlock§2]§f Debug has been turned off by ${player.name}.`);
                break;
            case ["-e", "--enable"].includes(args[i].toLowerCase()):
                caseThree = true;
                world.setDynamicProperty("debug", true);
                world.say(`§2[§7Deadlock§2]§f Debug has been turned on by ${player.name}.`);
                break;
        }
    }
    if (caseOne) {
        return;
    }
    if (!caseTwo && !caseThree) {
        return player.tell(`§2[§7Deadlock§2]§f Please specify if enabling or disabling this feature.\n              See ${prefix}debug -h for more information.`);
    }
}
