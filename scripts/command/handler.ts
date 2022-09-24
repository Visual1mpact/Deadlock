import { BeforeChatEvent, world } from "mojang-minecraft";

// Import all our commands
import { give } from "./Utility/give";
import { op } from "./Moderation/op";

const commandDefinitions: Record<string, (data: BeforeChatEvent, args: string[], fullArgs: string) => void> = Object.setPrototypeOf(
    {
        give: give,
        op: op,
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
    const prefix = String(world.getDynamicProperty("prefix"));

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
        sender.tell(`The command ${prefix}${commandName} does not exist. Try again!`);
        return (object.cancel = true);
    }

    // Command exists so call it and return
    commandDefinitions[commandName](object, args, message.slice(prefix.length + commandName.length + 1));
    return void 0;
}

export const Handler = () => {
    world.events.beforeChat.subscribe((object) => command(object));
};
