import { Player, world } from "mojang-minecraft";
import { ModalFormResponse } from "mojang-minecraft-ui";

export function guiECWipe(opResult: ModalFormResponse, source: Player, onlineList: string[]) {
    const [dropdown] = opResult.formValues;
    // Need player object
    let member: Player = undefined;
    for (let pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(onlineList[dropdown].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
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
    return source.tell(`§2[§7Deadlock§2]§f Wiped ${member.name}'s ender chest.`);
}
