import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import config from "../../data/config";
import { crypto, UUID } from "../../util";

export function guiOP(opResult: ModalFormResponse, salt: string | number | boolean, hash: string | number | boolean, encode: string, onlineList: string[], source: Player) {
    const [value] = opResult.formValues;
    if (hash !== encode) {
        if (value === config.permission.password && config.permission.password !== "PutPasswordHere") {
            // If no salt then create one
            if (salt === undefined) {
                source.setDynamicProperty("salt", UUID.generate());
                salt = source.getDynamicProperty("salt");
            }
            // If no hash then create one
            if (hash === undefined) {
                encode = crypto(salt, config.permission.password);
                source.setDynamicProperty("hash", encode);
                hash = source.getDynamicProperty("hash");
            } else {
                encode = crypto(salt, config.permission.password);
            }
            if (hash === encode) {
                return source.tell(`§2[§7Deadlock§2]§f You have permission to use Deadlock.`);
            } else {
                return source.tell(`§2[§7Deadlock§2]§f Something went wrong.`);
            }
        }
    } else {
        // Need player object
        let member: Player = undefined;
        for (let pl of world.getPlayers()) {
            if (pl.nameTag.toLowerCase().includes(onlineList[value].toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
                break;
            }
        }
        // Check for hash/salt and validate password
        let memberHash = member.getDynamicProperty("hash");
        let memberSalt = member.getDynamicProperty("salt");
        let encode = crypto(memberSalt, config.permission.password) ?? null;
        // If no salt then create one
        if (memberSalt === undefined) {
            member.setDynamicProperty("salt", UUID.generate());
            // Get generated salt
            memberSalt = member.getDynamicProperty("salt");
        }
        // If no hash then create one
        if (memberHash !== encode) {
            let encode = crypto(memberSalt, config.permission.password);
            member.setDynamicProperty("hash", encode);
        }
        return member.tell(`§2[§7Deadlock§2]§f You have permission to use Deadlock.`);
    }
}
