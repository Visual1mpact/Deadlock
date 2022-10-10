import { world, Player, BeforeChatEvent } from "mojang-minecraft";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}tpa [options]
     §fTelports player to another player.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-f <username>, --from <username>
     §fTargets player set to be teleported.
 §2|  §7-t <username>, --to <username>
     §fTargets player set to be teleported to.

`;

    return help;
}

/**
 * @name tpa
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function tpa(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Get prefix from player
    let prefix = String(player.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    // Are there arguements
    if (!args.length) {
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}tpa -h for command options.`);
    }

    /**
     * Define variable outside the scope of a loop.
     * Conditionally check non positional parameters.
     */
    let i: number = args.length - 1;
    let caseOne: boolean = false;
    let caseTwo: boolean = false;
    let caseThree: boolean = false;
    let targetOne: string = undefined;
    let targetTwo: string = undefined;
    for (; i >= 0; --i) {
        switch (true) {
            case ["-h", "--help"].includes(args[i]):
                caseOne = true;
                player.tell(usage(prefix));
                break;
            case ["-f", "--from"].includes(args[i]):
                caseTwo = true;
                targetOne = args[i + 1];
                break;
            case ["-t", "--to"].includes(args[i]):
                caseThree = true;
                targetTwo = args[i + 1];
                break;
        }
    }
    if (caseOne) {
        return;
    }
    if (!caseTwo) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -f | --from.\n              See ${prefix}tpa -h for more information.`);
    }
    if (!caseThree) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -t | --to.\n              See ${prefix}tpa -h for more information.`);
    }

    let memberOne: Player = undefined;
    let memberTwo: Player = undefined;

    // Try to find the player requested
    let pl: Player = undefined;
    for (pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(targetOne.toLowerCase().replace(/"|\\|@/g, ""))) {
            memberOne = pl;
        }
        if (pl.nameTag.toLowerCase().includes(targetTwo.toLowerCase().replace(/"|\\|@/g, ""))) {
            memberTwo = pl;
        }
        if (memberOne && memberTwo) {
            break;
        }
    }
    // Are they online?
    if (!memberOne || !memberTwo) {
        return player.tell(`§2[§7Deadlock§2]§f Couldn't find that player!`);
    }

    // Let's teleport the player from their location to the other players location
    memberTwo.teleport(memberOne.location, memberOne.dimension, 0, 0);
    // Let the player know about the teleportation
    return player.tell(`§2[§7Deadlock§2]§f Teleported ${memberTwo.name} to ${memberOne.name}`);
}
