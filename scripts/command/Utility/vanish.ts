import { BeforeChatEvent, MinecraftEffectTypes, Player, world } from "mojang-minecraft";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}vanish [options]
     §fGrants player invisibility.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-t <username>, --target <username>
     §fTargets a specific player.
 §2|  §7-d, --disable
     §fDisables invisibility for targeted player.
 §2|  §7-e, --enable
     §fEnables invisibility for targeted player.

`;

    return help;
}

/**
 * @name vanish
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function vanish(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Get prefix from player
    let prefix = String(player.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    // Are there arguements
    if (!args.length) {
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}vanish -h for command options.`);
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
        return player.tell(`§2[§7Deadlock§2]§f You are missing the parameter -t | --target.\n              See ${prefix}vanish -h for more information.`);
    }
    if (!caseThree && !caseFour) {
        return player.tell(`§2[§7Deadlock§2]§f Are you disabling or enabling this?\n              See ${prefix}vanish -h for more information.`);
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

    // Disable
    if (caseThree) {
        member.setDynamicProperty("vanish", false);
        member.removeTag("vanish");
        member.triggerEvent("unvanish");
        // If tiny is enabled then fix size after unvanishing
        if (member.getDynamicProperty("tiny") === true) {
            member.triggerEvent("scaledown");
        }
        if (member.getEffect(MinecraftEffectTypes.invisibility) !== undefined || member.getEffect(MinecraftEffectTypes.nightVision) !== undefined) {
            member.runCommandAsync(`effect @s clear`);
        }
        if (player.name !== member.name) {
            player.tell(`§2[§7Deadlock§2]§f ${member.name} is no longer vanished.`);
        }
        return member.tell(`§2[§7Deadlock§2]§f You are no longer vanished.`);
    }

    // Enable
    if (caseFour) {
        member.setDynamicProperty("vanish", true);
        member.addTag("vanish");
        member.triggerEvent("vanish");
        if (player.name !== member.name) {
            player.tell(`§2[§7Deadlock§2]§f ${member.name} is now vanished.`);
        }
        return member.tell(`§2[§7Deadlock§2]§f You are now vanished.`);
    }
}
