import { Player, world, EntityInventoryComponent, ItemEnchantsComponent, MinecraftEnchantmentTypes, Enchantment } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { enchantmentSlot } from "../../data/enchantment";

export function guiEnchantItem(opResult: ModalFormResponse, onlineList: string, hotbarDropdown: number, enchantmentList: string) {
    const [slider] = opResult.formValues;
    // Need player object
    let member: Player = undefined;
    for (let pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(onlineList.toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // Get item from players inventory if selected slot contains an item
    const invComponent = member.getComponent("minecraft:inventory") as EntityInventoryComponent;
    const invContainer = invComponent.container;
    const item = invContainer.getItem(hotbarDropdown);
    // Get component for enchantments
    const itemComponent = item.getComponent("minecraft:enchantments") as ItemEnchantsComponent;
    // Get collection of enchantments
    const itemEnchantments = itemComponent.enchantments;
    // Add enchantment
    itemEnchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes[enchantmentList], slider));
    itemComponent.enchantments = itemEnchantments;
    invComponent.container.setItem(hotbarDropdown, item);
}

export function guiEnchantLevel(enchantDropdown: string, onlineList: string, hotbarDropdown: number) {
    // Need player object
    let member: Player = undefined;
    for (let pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(onlineList.toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // Get item from players inventory if selected slot contains an item
    const invComponent = member.getComponent("minecraft:inventory") as EntityInventoryComponent;
    const invContainer = invComponent.container;
    const item = invContainer.getItem(hotbarDropdown);
    // Get component for enchantments
    const itemComponent = item.getComponent("minecraft:enchantments") as ItemEnchantsComponent;
    // Get collection of enchantments
    const itemEnchantments = itemComponent.enchantments;
    // List of allowed enchantments on item
    const enchantedSlot = enchantmentSlot[itemEnchantments.slot];
    const enchantLevel = enchantedSlot[enchantDropdown];
    return enchantLevel;
}

export function guiHotbarItems(opResult: ModalFormResponse, onlineList: string[]) {
    const [dropdown] = opResult.formValues;

    // Array for list of items in hotbar
    let hotbarItems: string[] = [];

    // Need player object
    let member: Player = undefined;
    for (let pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(onlineList[dropdown].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    // Get item from players hotbar if selected slot contains an item
    const invComponent = member.getComponent("minecraft:inventory") as EntityInventoryComponent;
    const invContainer = invComponent.container;
    let verify = false;
    for (let i = 0; i < 9; i++) {
        const inventory_item = invContainer?.getItem(i)?.typeId.replace("minecraft:", "") ?? undefined;
        if (!inventory_item) {
            continue;
        }
        hotbarItems.push(inventory_item);
        verify = true;
    }
    if (!verify) {
        return (hotbarItems = ["none"]);
    }
    return hotbarItems;
}

export function guiEnchantListItem(opResult: ModalFormResponse, onlineList: string) {
    const [dropdown] = opResult.formValues;

    // Array for list of allowed enchantments
    let enchantmentList: string[] = [];

    // Need player object
    let member: Player = undefined;
    for (let pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(onlineList.toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    // Get players selected slot
    const hand = dropdown;

    let enchants: string = undefined;
    // Get item from players inventory if selected slot contains an item
    const invComponent = member.getComponent("minecraft:inventory") as EntityInventoryComponent;
    const invContainer = invComponent.container;
    const item = invContainer.getItem(hand);
    // If no item exists in the selected slot then abort
    if (!item) {
        return (enchantmentList = ["none"]);
    }
    // Get component for enchantments
    const itemComponent = item.getComponent("minecraft:enchantments") as ItemEnchantsComponent;
    // Get collection of enchantments
    const itemEnchantments = itemComponent.enchantments;
    // List of allowed enchantments on item
    const enchantedSlot = enchantmentSlot[itemEnchantments.slot];
    // List items on screen from here
    let verify = false;
    for (enchants in MinecraftEnchantmentTypes) {
        // Is this item allowed to have this enchantment
        const enchantLevel = enchantedSlot[enchants];
        if (!enchantLevel) {
            continue;
        }
        enchantmentList.push(enchants);
        verify = true;
    }
    // If no enchantments are allowed on the item then inform them of this
    if (!verify) {
        return (enchantmentList = ["none"]);
    }
    return enchantmentList;
}
