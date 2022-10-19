import { BeforeChatEvent, Player, world } from "mojang-minecraft";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}gamemode [options]
     §fChange the game mode of a player.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-t <username>, --target <username>
     §fTargets a specific player.
 §2|  §7-s, --survival
     §fSets game mode to survival.
 §2|  §7-c, --creative
     §fSets game mode to creative.
 §2|  §7-a, --adventure
     §fSets game mode to adventure.

`;

    return help;
}

/**
 * @name gamemode
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function gamemode(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Get prefix from player
    let prefix = String(player.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    // Are there arguements
    if (!args.length) {
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}gamemode -h for command options.`);
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
            case ["-c", "--creative"].includes(args[i].toLowerCase()):
                caseThree = true;
                break;
            case ["-s", "--survival"].includes(args[i].toLowerCase()):
                caseFour = true;
                break;
            case ["-a", "--adventure"].includes(args[i].toLowerCase()):
                caseFive = true;
                break;
        }
    }
    if (caseOne) {
        return;
    }
    if (!caseTwo) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -t | --target.\n              See ${prefix}gamemode -h for more information.`);
    }

    /**
     * Make sure survival, creative, or adventure is designated as a parameter before proceeding further
     */
    if (!caseThree && !caseFour && !caseFive) {
        return player.tell(`§2[§7Deadlock§2]§f Specify which game mode to change to.\n              See ${prefix}gamemode -h for more information.`);
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
        return player.tell(`§2[§7Deadlock§2]§f Couldn't find the player!`);
    }

    if (caseThree) {
        member.tell(`§2[§7Deadlock§2]§f Your game mode has been updated to Creative.`);
        return member.runCommandAsync(`gamemode c`);
    }
    if (caseFour) {
        member.tell(`§2[§7Deadlock§2]§f Your game mode has been updated to Survial.`);
        return member.runCommandAsync(`gamemode s`);
    }
    if (caseFive) {
        member.tell(`§2[§7Deadlock§2]§f Your game mode has been updated to Adventure.`);
        return member.runCommandAsync(`gamemode a`);
    }
}
