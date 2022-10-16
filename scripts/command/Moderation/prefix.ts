import { BeforeChatEvent, Player, world } from "mojang-minecraft";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}prefix [options]
     §fChanges the prefix used for commands.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-r, --reset
     §fRestores the default prefix for a targeted player.
 §2|  §7-s <prefix>, --set <prefix>
     §fSets new prefix for a targeted player.
 §2|  §7-t <username>, --target <username>
     §fTargets specified player.

`;

    return help;
}

/**
 * @name prefix
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function prefix(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Get prefix from player
    let prefix = String(player.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    // Are there arguements
    if (!args.length) {
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}prefix -h for command options.`);
    }

    /**
     * Define variable outside the scope of a loop.
     * Conditionally check non positional parameters.
     */
    let i: number = args.length - 1;
    let caseOne: boolean = false;
    let caseTwo: boolean = false;
    let caseThree: boolean = false;
    let newPrefix: string = undefined;
    let target: string = undefined;
    for (; i >= 0; --i) {
        switch (true) {
            case ["-h", "--help"].includes(args[i].toLowerCase()):
                caseOne = true;
                player.tell(usage(prefix));
                break;
            case ["-r", "--reset"].includes(args[i].toLowerCase()):
                caseTwo = true;
                break;
            case ["-s", "--set"].includes(args[i].toLowerCase()):
                caseThree = true;
                newPrefix = args[i + 1];
                break;
            case ["-t", "--target"].includes(args[i].toLowerCase()):
                target = args[i + 1];
                break;
        }
    }
    if (caseOne) {
        return;
    }
    if (caseTwo) {
        /**
         * Make sure player is targeted using the -t/--target parameter
         */
        if (!target) {
            return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -t | --target.\n              See ${prefix}prefix -h for more information.`);
        }
        // try to find the player requested
        let pl: Player = undefined;
        let member: Player = undefined;
        for (pl of world.getPlayers()) {
            if (pl.nameTag.toLowerCase().includes(target.toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
            }
        }
        if (!member) {
            return player.tell(`§2[§7Deadlock§2]§f Couldn't find the player!`);
        }
        return member.setDynamicProperty("privatePrefix", world.getDynamicProperty("prefix"));
    }
    if (caseThree) {
        /**
         * Make sure player is targeted using the -t/--target parameter
         */
        if (!target) {
            return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -t | --target.\n              See ${prefix}prefix -h for more information.`);
        }
        /**
         * Make sure we are not attempting to set a prefix that can break commands
         */
        if (newPrefix === "/") {
            return player.tell(`§2[§7Deadlock§2]§f Using prefix '/' is not allowed! Please try another one.`);
        }
        // try to find the player requested
        let pl: Player = undefined;
        let member: Player = undefined;
        for (pl of world.getPlayers()) {
            if (pl.nameTag.toLowerCase().includes(target.toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
            }
        }
        if (!member) {
            return player.tell(`§2[§7Deadlock§2]§f Couldn't find the player!`);
        }
        // Change Prefix command under conditions
        if (newPrefix.length <= 1 && newPrefix.length >= 1) {
            player.tell(`§2[§7Deadlock§2]§f Prefix has been changed to '${newPrefix}'.`);
            if (member.name !== player.name) {
                member.tell(`§2[§7Deadlock§2]§f Prefix has been changed to '${newPrefix}'.`);
            }
            return member.setDynamicProperty("privatePrefix", newPrefix);
        } else {
            return player.tell(`§2[§7Deadlock§2]§f Prefix cannot be more than 1 character.`);
        }
    }
}
