import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";

export function guiPrefix(opResult: ModalFormResponse, onlineList: string[], source: Player) {
    const [dropdown, textField, toggle] = opResult.formValues;
    // Need player object
    let member: Player = undefined;
    for (let pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(onlineList[dropdown].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // Prefix is selected and no reset
    if (textField.length && !toggle) {
        /**
         * Make sure we are not attempting to set a prefix that can break commands
         */
        if (textField === "/") {
            return source.tell(`§2[§7Deadlock§2]§f Using prefix '/' is not allowed! Please try another one.`);
        }

        // Change Prefix command under conditions
        if (textField.length <= 1 && textField.length >= 1) {
            member.tell(`§2[§7Deadlock§2]§f Prefix has been changed to '${textField}'.`);
            return member.setDynamicProperty("privatePrefix", textField);
        } else {
            return member.tell(`§2[§7Deadlock§2]§f Prefix cannot be more than 1 character.`);
        }
    }

    // Reset has been toggled
    if (toggle) {
        const defaultPrefix = world.getDynamicProperty("prefix") as string;
        member.setDynamicProperty("privatePrefix", defaultPrefix);
        return member.tell(`§2[§7Deadlock§2]§f Prefix has been reset to '${defaultPrefix}'.`);
    }

    // Nothing was done by the user
    if (!toggle && !textField) {
        return source.tell(`§2[§7Deadlock§2]§f Something went wrong.`);
    }
}
