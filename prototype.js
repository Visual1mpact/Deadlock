function parseArgs(str) {
    return [...str.matchAll(/(?<=^| )("?)(.+?)\1(?= |$)/g)].map((match) => match[0].replaceAll('"', ""));
}
const Parser = {
    Boolean() {
        return true;
    },
    Next(args, i) {
        return !args[i + 1].startsWith("-") ? args[i + 1] : undefined;
    },
};
/**
 * @param {string[]} args
 * @param {Record<string, Function>} options
 */
function parseFlags(args, options) {
    const flags = Object.create(null);
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        console.log(arg);
        const flag = Object.keys(options).filter((str) => arg === `--${str}` || arg === `-${str[0]}`)[0] ?? false;
        if (flag) {
            console.log(flag);
            flags[flag] = options[flag](args, i);
        }
    }
    return flags;
}

function example(message, args) {
    message.cancel = true;

    const { sender: player } = message;

    if (!args.length) {
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}example -h for command options.`);
    }

    const flags = parseFlags(args, {
        help: Parser.Boolean,
        target: Parser.Next,
    });

    if (flags["help"]) {
        return; /*player.tell(usage())*/
    }

    if (flags["target"]) {
        player.tell(flags["target"]);
    }
}
