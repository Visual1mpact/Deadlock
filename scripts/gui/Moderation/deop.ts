import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import config from "../../data/config";
import { crypto } from "../../util";

export function guiDEOP(opResult: ModalFormResponse, onlineList: string[], source: Player) {
    const [value] = opResult.formValues;
    // Need player object
    let member: Player = undefined;
    for (let pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(onlineList[value].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // Check for hash/salt and validate password from member
    const memberHash = member.getDynamicProperty("hash");
    const memberSalt = member.getDynamicProperty("salt");
    const memberEncode: string = crypto(memberSalt, config.permission.password) ?? null;

    if (memberHash !== undefined && memberHash === memberEncode) {
        member.removeDynamicProperty("hash");
        member.removeDynamicProperty("salt");
        if (source.name !== member.name) {
            source.tell(`§2[§7Deadlock§2]§f ${member.name} had permissions removed from Deadlock.`);
        }
        return member.tell(`§2[§7Deadlock§2]§f Permissions for Deadlock are revoked.`);
    }
    return source.tell(`§2[§7Deadlock§2]§f ${member.name} never had permission to use Deadlock.`);
}
