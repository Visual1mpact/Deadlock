import { BeforeChatEvent, Player, world } from "mojang-minecraft";
import config from "../../data/config.js";
import { crypto, UUID } from "../../util.js";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}op [options]
     §fGrants permission to use Deadlock.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-t <username>, --target <username>
     §fTargets a specific player.

`;

    return help;
}

/**
 * @name op
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function op(message: BeforeChatEvent, args: string[]) {
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
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}op -h for command options.`);
    }

    /**
     * Define variable outside the scope of a loop.
     * Conditionally check non positional parameters.
     */
    let i: number = args.length - 1;
    let caseOne: boolean = false;
    let caseTwo: boolean = false;
    let parameter: string = undefined;
    for (; i >= 0; --i) {
        switch (true) {
            case ["-h", "--help"].includes(args[i]):
                caseOne = true;
                player.tell(usage(prefix));
                break;
            case ["-t", "--target"].includes(args[i]):
                caseTwo = true;
                parameter = args[i + 1];
                break;
        }
    }
    if (caseOne) {
        return;
    }
    if (!caseTwo) {
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -t | --target.\n              See ${prefix}op -h for more information.`);
    }

    // try to find the player requested
    let pl: Player = undefined;
    for (pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(parameter.toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
        }
    }

    if (!member) {
        return player.tell(`§2[§7Deadlock§2]§f Couldn't find that player!`);
    }

    // Check for hash/salt and validate password
    let memberHash = member.getDynamicProperty("hash");
    let memberSalt = member.getDynamicProperty("salt");
    // If no salt then create one
    if (memberSalt === undefined) {
        member.setDynamicProperty("salt", UUID.generate());
    }
    // If no hash then create one
    if (memberHash === undefined) {
        const encode = crypto(memberSalt, config.permission.password);
        member.setDynamicProperty("hash", encode);
    }
    member.tell(`§2[§7Deadlock§2]§f You have permission to use Deadlock.`);
}
