import { BeforeChatEvent, Player, world } from "mojang-minecraft";
import config from "../../data/config.js";
import { crypto } from "../../util.js";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}deop [options]
     §fRevokes permission to use Deadlock.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-t <username>, --target <username>
     §fTargets a specific player.

`;

    return help;
}

/**
 * @name deop
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function deop(message: BeforeChatEvent, args: string[]) {
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
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}deop -h for command options.`);
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
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -t | --target.\n              See ${prefix}deop -h for more information.`);
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

    // Check for hash/salt and validate password from member
    let memberHash = member.getDynamicProperty("hash");
    let memberSalt = member.getDynamicProperty("salt");
    let memberEncode: string;
    try {
        memberEncode = crypto(memberSalt, config.permission.password);
    } catch (error) {}

    if (memberHash !== undefined && memberHash === memberEncode) {
        member.removeDynamicProperty("hash");
        member.removeDynamicProperty("salt");
        player.tell(`§2[§7Deadlock§2]§f ${member.name} had permissions removed from Deadlock.`);
        return member.tell(`§2[§7Deadlock§2]§f Permissions for Deadlock are revoked.`);
    }
    return player.tell(`§2[§7Deadlock§2]§f ${member.name} never had permission to use Deadlock.`);
}
