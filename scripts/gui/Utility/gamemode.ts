import { Player, world } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";

export function guiGamemode(opResult: ActionFormResponse, onlineList: string[], source: Player) {
    // Need player object
    let member: Player = undefined;
    for (let pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(onlineList[0].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    if (opResult.selection === 0) {
        member.tell(`§2[§7Deadlock§2]§f Your game mode has been updated to Survival.`);
        return member.runCommandAsync(`gamemode s`);
    }
    if (opResult.selection === 1) {
        member.tell(`§2[§7Deadlock§2]§f Your game mode has been updated to Creative.`);
        return member.runCommandAsync(`gamemode c`);
    }
    if (opResult.selection === 2) {
        member.tell(`§2[§7Deadlock§2]§f Your game mode has been updated to Adventure.`);
        return member.runCommandAsync(`gamemode a`);
    }
    return void 0;
}
