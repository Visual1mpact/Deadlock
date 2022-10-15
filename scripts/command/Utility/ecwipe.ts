import { BeforeChatEvent, Player, world } from "mojang-minecraft";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}ecwipe [options]
     §fClear players ender chest.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-t <username>, --target <username>
     §fClear ender chest of targeted player.

`;

    return help;
}

/**
 * @name ecwipe
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided.
 */
export function ecwipe(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Get prefix from player
    let prefix = String(player.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    // Are there arguements
    if (!args.length) {
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}ecwipe -h for command options.`);
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
            case ["-h", "--help"].includes(args[i]):
                caseOne = true;
                player.tell(usage(prefix));
                break;
            case ["-t", "--target"].includes(args[i]):
                caseTwo = true;
                target = args[i + 1];
                break;
        }
    }
    if (caseOne) {
        return;
    }
    if (caseTwo) {
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

        // There are 30 slots ranging from 0 to 29
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
        return player.tell(`§2[§7Deadlock§2]§f Wiped ${member.name}'s enderchest.`);
    }
}
