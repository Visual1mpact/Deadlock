import { BeforeChatEvent, world } from "mojang-minecraft";
import { crypto, UUID } from "../util.js";
import config from "../data/config.js";

// Import all our commands
import { give } from "./Utility/give.js";
import { op } from "./Moderation/op.js";
import { prefix } from "./Moderation/prefix.js";
import { deop } from "./Moderation/deop.js";
import { tpa } from "./Utility/tpa.js";
import { home } from "./Utility/home.js";
import { invsee } from "./Utility/invsee.js";
import { ecwipe } from "./Utility/ecwipe.js";
import { punish } from "./Utility/punish.js";
import { vanish } from "./Utility/vanish.js";
import { tiny } from "./Utility/tiny.js";
import { debug } from "./Utility/debug.js";
import { enchant } from "./Utility/enchant.js";
import { gamemode } from "./Utility/gamemode.js";
import { dome } from "./Utility/dome.js";
import { listitems } from "./Utility/listitems.js";

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}help
     §fShows this help menu.
 §2|  §7${prefix}op [options]
     §fGrants permission to use Deadlock.
 §2|  §7${prefix}deop [options]
     §fRevokes permission to use Deadlock.
 §2|  §7${prefix}prefix [options]
     §fSets prefix used for commands.
 §2|  §7${prefix}give [options]
     §fGives player an item.
 §2|  §7${prefix}tpa [options]
     §fTelports player to another player.
 §2|  §7${prefix}home [options]
     §fAdd, delete, list, and teleport to saved locations.
 §2|  §7${prefix}invsee [options]
     §fList players inventory.
 §2|  §7${prefix}ecwipe [options]
     §fClear players ender chest.
 §2|  §7${prefix}punish [options]
     §fClear players ender chest and inventory.
 §2|  §7${prefix}vanish [options]
     §fGrants player invisibility.
 §2|  §7${prefix}tiny [options]
     §fChange size of the player.
 §2|  §7${prefix}debug [options]
     §fDisplay information for debugging.
 §2|  §7${prefix}enchant [options]
     §fList allowed enchantments and enchants items.
 §2|  §7${prefix}gamemode [options]
     §fChange the game mode of a player.
 §2|  §7${prefix}dome [options]
     §fCreates a sphere or hemisphere around the player.
 §2|  §7${prefix}listitems [options]
     §fPrints every item in the game and their max stack according to Gametest.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of other commands.

`;

    return help;
}

const commandDefinitions: Record<string, (data: BeforeChatEvent, args: string[], fullArgs: string) => void> = Object.setPrototypeOf(
    {
        give: give,
        op: op,
        prefix: prefix,
        deop: deop,
        tpa: tpa,
        home: home,
        invsee: invsee,
        ecwipe: ecwipe,
        punish: punish,
        vanish: vanish,
        tiny: tiny,
        debug: debug,
        enchant: enchant,
        gamemode: gamemode,
        dome: dome,
        listitems: listitems,
    },
    null
);

/**
 * @name commandHandler
 */

function command(object: BeforeChatEvent) {
    // Define properties of beforeChat Event
    const { sender, message } = object;

    // Get prefix from player
    let prefix = String(sender.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    // Checks if the message starts with our prefix and if not then exit
    if (!message.startsWith(prefix)) {
        return void 0;
    }

    // Convert string to an array with a divider
    const args = message.slice(prefix.length).split(/ +/);

    // Shift to right of array by one and return string element
    const commandName = args.shift().toLowerCase();

    // Get debug status from player
    const debug = Boolean(world.getDynamicProperty("debug"));

    let hash = sender.getDynamicProperty("hash");
    let salt = sender.getDynamicProperty("salt");
    let encode: string = undefined;
    // OP Status
    if (commandName === "op") {
        // If no salt then create one
        if (salt === undefined && args[0] === config.permission.password) {
            sender.setDynamicProperty("salt", UUID.generate());
            salt = sender.getDynamicProperty("salt");
        }
        // If no hash then create one
        if (hash === undefined && args[0] === config.permission.password) {
            encode = crypto(salt, config.permission.password);
            sender.setDynamicProperty("hash", encode);
            hash = sender.getDynamicProperty("hash");
        } else {
            encode = crypto(salt, config.permission.password);
        }
        // Make sure the user has permissions to run the command
        if (hash === undefined || config.permission.password === "PutPasswordHere" || (hash !== encode && args[0] !== config.permission.password)) {
            sender.tell(`§2[§7Deadlock§2]§f You do not have permission to use this command.`);
            return (object.cancel = true);
        } else if (hash === encode && args[0] === config.permission.password) {
            sender.tell(`§2[§7Deadlock§2]§f You have permission to use Deadlock.`);
            return (object.cancel = true);
        }
    }

    // Show command and player execution if debug is enabled
    if (debug) {
        console.warn(`${new Date()} | "${sender.name}" used the command: ${prefix}${commandName} ${args.join(" ")}`);
    } else if (commandName === "listitems") {
        sender.tell(`§2[§7Deadlock§2]§f You must enable debugging.`);
        return (object.cancel = true);
    }

    // Let player know if command does not exist and return
    if (!(commandName in commandDefinitions)) {
        object.cancel = true;
        return sender.tell(`§2[§7Deadlock§2]§f The command ${prefix}${commandName} does not exist.\n              See ${prefix}help for more information.`);
    }

    if (commandName !== "op") {
        // Check for hash/salt and validate password
        encode = crypto(salt, config.permission.password) ?? null;
        // make sure the user has permissions to run the command
        if (hash === undefined || encode !== hash || config.permission.password === "PutPasswordHere") {
            sender.tell(`§2[§7Deadlock§2]§f You do not have permission to use this command.`);
            return (object.cancel = true);
        }
    }

    // Call usage function for help if requested
    if (commandName === "help") {
        object.cancel = true;
        return sender.tell(usage(prefix));
    }

    // Command exists so call it and return
    commandDefinitions[commandName](object, args, message.slice(prefix.length + commandName.length + 1));
    return void 0;
}

export const Handler = () => {
    world.events.beforeChat.subscribe((object) => command(object));
};
