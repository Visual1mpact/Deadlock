import { BeforeChatEvent, world } from "mojang-minecraft";
import { crypto, UUID } from "../util";
import config from "../data/config";

// Import all our commands
import { give } from "./Utility/give.js";
import { op } from "./Moderation/op.js";
import { prefix } from "./Moderation/prefix.js";
import { deop } from "./Moderation/deop.js";
import { tpa } from "./Utility/tpa.js";
import { sethome } from "./Utility/sethome.js";
import { delhome } from "./Utility/delhome.js";
import { gohome } from "./Utility/gohome.js";
import { listhome } from "./Utility/listhome.js";
import { invsee } from "./Utility/invsee.js";
import { ecwipe } from "./Utility/ecwipe.js";
import { punish } from "./Utility/punish.js";
import { vanish } from "./Utility/vanish.js";
import { tiny } from "./Utility/tiny.js";
import { debug } from "./Utility/debug";
import { enchant } from "./Utility/enchant";

const commandDefinitions: Record<string, (data: BeforeChatEvent, args: string[], fullArgs: string) => void> = Object.setPrototypeOf(
    {
        give: give,
        op: op,
        prefix: prefix,
        deop: deop,
        tpa: tpa,
        sethome: sethome,
        delhome: delhome,
        gohome: gohome,
        listhome: listhome,
        invsee: invsee,
        ecwipe: ecwipe,
        punish: punish,
        vanish: vanish,
        tiny: tiny,
        debug: debug,
        enchant: enchant,
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

    // Show command and player execution if debug is enabled
    if (debug) {
        console.warn(`${new Date()} | "${sender.name}" used the command: ${prefix}${commandName} ${args.join(" ")}`);
    }

    // Let player know if command does not exist and return
    if (!(commandName in commandDefinitions)) {
        sender.tell(`§2[§7Deadlock§2]§f The command ${prefix}${commandName} does not exist. Try again!`);
        return (object.cancel = true);
    }

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
            try {
                encode = crypto(salt, config.permission.password);
            } catch (error) {}
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

    if (commandName !== "op") {
        // Check for hash/salt and validate password
        try {
            encode = crypto(salt, config.permission.password);
        } catch (error) {}
        // make sure the user has permissions to run the command
        if (hash === undefined || encode !== hash || config.permission.password === "PutPasswordHere") {
            sender.tell(`§2[§7Deadlock§2]§f You do not have permission to use this command.`);
            return (object.cancel = true);
        }
    }

    // Command exists so call it and return
    commandDefinitions[commandName](object, args, message.slice(prefix.length + commandName.length + 1));
    return void 0;
}

export const Handler = () => {
    world.events.beforeChat.subscribe((object) => command(object));
};
