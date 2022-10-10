import { BeforeChatEvent, Location, world } from "mojang-minecraft";
import { Base64 } from "../../util.js";

let cooldownTimer = new WeakMap();

/**
 * @param prefix
 * @returns
 */
function usage(prefix: string) {
    const help = `
§2[§7Deadlock§2]§f USAGE: [prefix][commands] [options]

§fCOMMANDS:
 §2|  §7${prefix}home [options]
     §fAdd, delete, list, and teleport to saved locations.

§fOPTIONS:
 §2|  §7-h, --help
     §fShows the help menu of this command.
 §2|  §7-t <home>, --teleport <home>
     §fTeleport to a home that is saved.
 §2|  §7-a <home>, --add <home>
     §fSave location to a home and give it a name.
 §2|  §7-d <home>, --delete <home>
     §fRemove saved location to a home.
 §2|  §7-l, --list
     §fShow a list of saved locations for your homes.

`;

    return help;
}

function dhms(ms: number) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const daysms = ms % (24 * 60 * 60 * 1000);
    const hours = Math.floor(daysms / (60 * 60 * 1000));
    const hoursms = ms % (60 * 60 * 1000);
    const minutes = Math.floor(hoursms / (60 * 1000));
    const minutesms = ms % (60 * 1000);
    const sec = Math.floor(minutesms / 1000);
    if (days !== 0) {
        return days + " Days : " + hours + " Hours : " + minutes + " Minutes : " + sec + " Seconds";
    }
    if (hours !== 0) {
        return hours + " Hours : " + minutes + " Minutes : " + sec + " Seconds";
    }
    if (minutes !== 0) {
        return minutes + " Minutes : " + sec + " Seconds";
    }
    return sec + " Seconds";
}

/**
 * @name home
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function home(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Get prefix from player
    let prefix = String(player.getDynamicProperty("privatePrefix"));
    if (prefix === "undefined") {
        prefix = String(world.getDynamicProperty("prefix"));
    }

    // Are there arguements
    if (!args.length) {
        return player.tell(`§2[§7Deadlock§2]§f See ${prefix}home -h for command options.`);
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
    let homeTarget: string = undefined;
    for (; i >= 0; --i) {
        switch (true) {
            case ["-h", "--help"].includes(args[i]):
                caseOne = true;
                player.tell(usage(prefix));
                break;
            case ["-t", "--teleport"].includes(args[i]):
                caseTwo = true;
                homeTarget = args[i + 1];
                break;
            case ["-a", "--add"].includes(args[i]):
                caseThree = true;
                homeTarget = args[i + 1];
                break;
            case ["-d", "--delete"].includes(args[i]):
                caseFour = true;
                homeTarget = args[i + 1];
                break;
            case ["-l", "--list"].includes(args[i]):
                caseFive = true;
                break;
        }
    }
    if (caseOne) {
        return;
    }

    if (caseTwo) {
        /**
         * Hardcode the days, hours, minutes, and seconds.
         * We can make it changeable later on.
         */
        const days = 0;
        const hours = 0;
        const minutes = 5;
        const seconds = 0;

        let cooldownCalc: number = undefined;
        let activeTimer: string = undefined;
        // Get original time in milliseconds
        let cooldownVerify = cooldownTimer.get(player);
        // Convert config settings to milliseconds so we can be sure the countdown is accurate
        let msSettings = days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
        if (cooldownVerify !== undefined) {
            // Determine difference between new and original times in milliseconds
            let bigBrain = new Date().getTime() - cooldownVerify;
            // Subtract realtime clock from countdown in configuration to get difference
            cooldownCalc = msSettings - bigBrain;
            // Convert difference to clock format D : H : M : S
            activeTimer = dhms(cooldownCalc);
        } else {
            // First time executed so we default to configuration in milliseconds
            cooldownCalc = msSettings;
        }
        // If timer doesn't exist or has expired then grant permission to teleport and set the countdown
        if (cooldownCalc === msSettings || cooldownCalc <= 0) {
            let divider: string[] = undefined;
            let verify = false;
            const homeSetting = homeTarget;
            let tags = player.getTags();
            const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
            const regex = /-/g;
            let i = tags.length - 1;
            for (; i >= 0; --i) {
                if (tags[i].startsWith("Deadlock-")) {
                    // Check if its a valid base64
                    const valid = base64regex.test(tags[i].replace("Deadlock-", ""));
                    if (!valid) {
                        player.removeTag(tags[i]);
                        continue;
                    }
                    const base64Integrity = Base64.decode(tags[i].replace("Deadlock-", ""));
                    const count = (base64Integrity.match(regex) || []).length;
                    if (count !== 4) {
                        player.removeTag(tags[i]);
                        continue;
                    }
                    divider = base64Integrity.split("-");
                    const home: string = Base64.decode(divider[0]);
                    if (home === homeSetting) {
                        const px: number = Number(Base64.decode(divider[1]));
                        const py: number = Number(Base64.decode(divider[2]));
                        const pz: number = Number(Base64.decode(divider[3]));
                        const pd: string = Base64.decode(divider[4]);
                        // Validate strings and numbers
                        if (typeof home !== "string" || isNaN(px) || isNaN(py) || isNaN(pz) || typeof pd !== "string") {
                            player.removeTag(tags[i]);
                            continue;
                        }
                        player.teleport(new Location(px, py, pz), world.getDimension(pd), 0, 0);
                        player.tell(`§2[§7Deadlock§2]§f Welcome back!`);
                        verify = true;
                        break;
                    }
                }
            }
            if (!verify) {
                // If we reached this point then it doesn't exist
                return player.tell(`§2[§7Deadlock§2]§f Home '${homeSetting}' does not exist.`);
            }
            // Delete old key and value
            cooldownTimer.delete(player);
            // Create new key and value with current time in milliseconds
            cooldownTimer.set(player, new Date().getTime());
        } else {
            // Teleporting to fast
            player.tell(`§2[§7Deadlock§2]§f Please wait ${activeTimer} before teleporting home.`);
        }
    }

    if (caseThree) {
        // Don't allow spaces
        if (homeTarget.trim().length === 0) {
            player.tell(`§2[§7Deadlock§2]§f No spaces in names please.`);
            return void 0;
        }

        // Get current location
        const { x, y, z } = player.location;

        const homex = x.toFixed(0);
        const homey = y.toFixed(0);
        const homez = z.toFixed(0);
        const b64HX = Base64.encode(homex);
        const b64HY = Base64.encode(homey);
        const b64HZ = Base64.encode(homez);

        // Get current Dimension
        let currentDimension: string;
        let b64CD: string;

        // Save which dimension they were in
        if (player.dimension.id === "minecraft:overworld") {
            currentDimension = "overworld";
            b64CD = Base64.encode(currentDimension);
        }
        if (player.dimension.id === "minecraft:nether") {
            currentDimension = "nether";
            b64CD = Base64.encode(currentDimension);
        }
        if (player.dimension.id === "minecraft:the_end") {
            return player.tell(`§2[§7Deadlock§2]§f Not allowed to set home in this dimension.`);
        }

        const homeSetting = homeTarget;
        const b64HS = Base64.encode(homeSetting);

        const playerSetting = `${b64HS}-${b64HX}-${b64HY}-${b64HZ}-${b64CD}`;
        const b64PS = "Deadlock-" + Base64.encode(playerSetting);

        let counter = 0;
        let verify = false;
        let divider: string[] = undefined;
        let tags = player.getTags();
        const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        const regex = /-/g;
        // Make sure this name doesn't exist already and it doesn't exceed limitations
        let i = tags.length - 1;
        for (; i >= 0; --i) {
            if (tags[i].startsWith("Deadlock-")) {
                // Check if its a valid base64
                const valid = base64regex.test(tags[i].replace("Deadlock-", ""));
                if (!valid) {
                    player.removeTag(tags[i]);
                    continue;
                }
                const base64Integrity = Base64.decode(tags[i].replace("Deadlock-", ""));
                const count = (base64Integrity.match(regex) || []).length;
                if (count !== 4) {
                    player.removeTag(tags[i]);
                    continue;
                }
                divider = base64Integrity.split("-");
                const home: string = Base64.decode(divider[0]);
                const px: number = Number(Base64.decode(divider[1]));
                const py: number = Number(Base64.decode(divider[2]));
                const pz: number = Number(Base64.decode(divider[3]));
                const pd: string = Base64.decode(divider[4]);
                // Validate strings and numbers
                if (typeof home !== "string" || isNaN(px) || isNaN(py) || isNaN(pz) || typeof pd !== "string") {
                    player.removeTag(tags[i]);
                    continue;
                }
                if (home === homeSetting) {
                    verify = true;
                    player.tell(`§2[§7Deadlock§2]§f Home with name '${homeSetting}' already exists.`);
                    break;
                }
                counter = ++counter;
            }
            if (counter >= 5) {
                verify = true;
                player.tell(`§2[§7Deadlock§2]§f You can only have 5 saved locations at a time.`);
                break;
            }
        }
        if (verify === true) {
            verify = false;
            return void 0;
        }

        // Store their new home coordinates
        player.addTag(b64PS);

        player.tell(`§2[§7Deadlock§2]§f Home '${homeSetting}' has been set at ${homex} ${homey} ${homez}.`);
    }

    if (caseFour) {
        // Find and delete this saved home location
        let verify = false;
        let divider: string[] = undefined;
        const homeSetting = homeTarget;
        let tags = player.getTags();
        const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        const regex = /-/g;
        let i = tags.length - 1;
        for (; i >= 0; --i) {
            if (tags[i].startsWith("Deadlock-")) {
                // Check if its a valid base64
                const valid = base64regex.test(tags[i].replace("Deadlock-", ""));
                if (!valid) {
                    player.removeTag(tags[i]);
                    continue;
                }
                const base64Integrity = Base64.decode(tags[i].replace("Deadlock-", ""));
                const count = (base64Integrity.match(regex) || []).length;
                if (count !== 4) {
                    player.removeTag(tags[i]);
                    continue;
                }
                divider = base64Integrity.split("-");
                const home: string = Base64.decode(divider[0]);
                const px: number = Number(Base64.decode(divider[1]));
                const py: number = Number(Base64.decode(divider[2]));
                const pz: number = Number(Base64.decode(divider[3]));
                const pd: string = Base64.decode(divider[4]);
                // Validate strings and numbers
                if (typeof home !== "string" || isNaN(px) || isNaN(py) || isNaN(pz) || typeof pd !== "string") {
                    player.removeTag(tags[i]);
                    continue;
                }
                if (home === homeSetting) {
                    verify = true;
                    player.removeTag(tags[i]);
                    player.tell(`§2[§7Deadlock§2]§f Successfully deleted home '${homeSetting}'.`);
                    break;
                }
            }
        }
        if (verify === true) {
            return void 0;
        } else {
            player.tell(`§2[§7Deadlock§2]§f Home '${homeSetting}' does not exist.`);
        }
    }

    if (caseFive) {
        let divider: string[] = undefined;
        let verify = false;
        let tags = player.getTags();
        const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        const regex = /-/g;
        player.tell(`§l§2[§7List Of Homes§2]§r`);
        let i = tags.length - 1;
        for (; i >= 0; --i) {
            if (tags[i].startsWith("Deadlock-")) {
                // Check if its a valid base64
                const valid = base64regex.test(tags[i].replace("Deadlock-", ""));
                if (!valid) {
                    player.removeTag(tags[i]);
                    continue;
                }
                const base64Integrity = Base64.decode(tags[i].replace("Deadlock-", ""));
                const count = (base64Integrity.match(regex) || []).length;
                if (count !== 4) {
                    player.removeTag(tags[i]);
                    continue;
                }
                divider = base64Integrity.split("-");
                const home: string = Base64.decode(divider[0]);
                const px: number = Number(Base64.decode(divider[1]));
                const py: number = Number(Base64.decode(divider[2]));
                const pz: number = Number(Base64.decode(divider[3]));
                const pd: string = Base64.decode(divider[4]);
                // Validate strings and numbers
                if (typeof home !== "string" || isNaN(px) || isNaN(py) || isNaN(pz) || typeof pd !== "string") {
                    player.removeTag(tags[i]);
                    continue;
                }
                player.tell(` | §2[§f${home}§2]§r §7=>§r ${px} ${py} ${pz} §7<=§r §2[§f${pd}§2]§r`);
                verify = true;
            }
        }
        if (!verify) {
            // If we reached this point then it doesn't exist
            return player.tell(`You have no saved locations.`);
        }
    }
}
