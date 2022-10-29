import { ModalFormResponse } from "@minecraft/server-ui";
import { world, Player, MinecraftItemTypes, EntityInventoryComponent, ItemStack } from "@minecraft/server";
import { toCamelCase } from "../../util";
import maxItemStack, { defaultMaxItemStack } from "../../data/maxstack";

export function guiGive(onlineList: string, result: ModalFormResponse, selectedItem: string, source: Player) {
    const [itemAmount, itemData] = result.formValues;
    let data: number = null;
    if (isNaN(itemData) || !itemData) {
        /**
         * This parameter is invalid
         */
        data = 0;
    } else {
        data = itemData;
    }
    // Need player object
    let pl: Player = undefined;
    let member: Player = undefined;
    for (pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(onlineList.toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    const itemStringConvert = toCamelCase(selectedItem);
    const invContainer = member.getComponent("inventory") as EntityInventoryComponent;
    const inv = invContainer.container;
    const item = new ItemStack(MinecraftItemTypes[itemStringConvert], itemAmount, data);
    inv.addItem(item);
    if (source.name !== member.name) {
        member.tell(`§2[§7Deadlock§2]§f ${source.name} gave you ${selectedItem} x${itemAmount}.`);
    }
    return source.tell(`§2[§7Deadlock§2]§f ${member.name} was given ${selectedItem} x${itemAmount}.`);
}

export function guiGiveAmount(selectedItem: string) {
    const itemStringConvert = toCamelCase(selectedItem);
    const maxStack = maxItemStack[itemStringConvert.replace(itemStringConvert, "minecraft:" + selectedItem)] ?? defaultMaxItemStack;
    return maxStack;
}

export function guiGiveTest(opResult: ModalFormResponse, onlineList: string[]) {
    const [dropdown, textfield] = opResult.formValues;
    // Need player object
    let pl: Player = undefined;
    let member: Player = undefined;
    for (pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(onlineList[dropdown].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    /**
     * Validate name of item to insure it exists based on spelling input.
     */
    let confirmItem = false;
    const itemStringConvert = toCamelCase(textfield);
    let itemValidate: string = undefined;
    for (itemValidate in MinecraftItemTypes) {
        if (itemStringConvert === itemValidate) {
            confirmItem = true;
            break;
        }
    }
    if (confirmItem) {
        return true;
    }
    return false;
}
