import { world, Location, BeforeChatEvent } from "mojang-minecraft";
import { Base64 } from "../../util.js";

let cooldownTimer = new WeakMap();

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
 * @name gohome
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function gohome(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Are there arguements
    if (!args.length) {
        return void 0;
    }

    // Don't allow spaces
    if (args.length > 1) {
        player.tell(`§2[§7Deadlock§2]§f No spaces in names please.`);
        return void 0;
    }

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
        const homeSetting: string = args[0];
        let tags = player.getTags();
        let i = tags.length - 1;
        for (; i >= 0; --i) {
            if (tags[i].startsWith("Deadlock-")) {
                let base64Integrity = Base64.decode(tags[i].replace("Deadlock-", ""));
                divider = base64Integrity.split("-");
                const home: string = Base64.decode(divider[0]);
                if (home === homeSetting) {
                    const px: number = Number(Base64.decode(divider[1]));
                    const py: number = Number(Base64.decode(divider[2]));
                    const pz: number = Number(Base64.decode(divider[3]));
                    const pd: string = Base64.decode(divider[4]);
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
