import { BeforeChatEvent, Player, world } from "mojang-minecraft";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}tiny [options]
     §fChange size of the player.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-t <username>, --target <username>
     §fTargets a specific player.
 §2|  §7-d, --disable
     §fRestores original size of the player.
 §2|  §7-e, --enable
     §fShrinks the player to bite size.

`;

    return help;
}

/**
 * @name tiny
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function tiny(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Get prefix from player
    let prefix = String(player.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    // Are there arguements
    if (!args.length) {
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}tiny -h for command options.`);
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
            case ["-d", "--disable"].includes(args[i].toLowerCase()):
                caseThree = true;
                break;
            case ["-e", "--enable"].includes(args[i].toLowerCase()):
                caseFour = true;
                break;
        }
    }
    if (caseOne) {
        return;
    }
    if (!caseTwo) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -t | --target.\n              See ${prefix}tiny -h for more information.`);
    }
    if (!caseThree && !caseFour) {
        return player.tell(`§2[§7Deadlock§2]§f Are you disabling or enabling this?\n              See ${prefix}tiny -h for more information.`);
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

    // Enable
    if (caseFour) {
        member.setDynamicProperty("tiny", true);
        if (player.name !== member.name) {
            player.tell(`§2[§7Deadlock§2]§f ${member.name} is now bite size.`);
        }
        member.tell(`§2[§7Deadlock§2]§f You have been made bite size.`);
        // Check if player is vanished to prevent conflicts
        if (member.getDynamicProperty("vanish") === true) {
            return void 0;
        }
        return member.triggerEvent("scaledown");
    }

    // Disable
    if (caseThree) {
        member.setDynamicProperty("tiny", false);
        if (player.name !== member.name) {
            player.tell(`§2[§7Deadlock§2]§f ${member.name} had original size restored.`);
        }
        member.tell(`§2[§7Deadlock§2]§f Your original size has been restored.`);
        // Check if player is vanished to prevent conflicts
        if (member.getDynamicProperty("vanish") === true) {
            return void 0;
        }
        return member.triggerEvent("scaleup");
    }
}
