import { BeforeChatEvent, EntityInventoryComponent, Player, world } from "mojang-minecraft";

/**
 * @name invsee
 * @param {BeforeChatEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function invsee(message: BeforeChatEvent, args: string[]) {
    message.cancel = true;

    const player = message.sender;

    // Are there arguements
    if (!args.length) {
        return void 0;
    }

    // Try to find the player requested
    let member: Player = undefined;
    let pl: Player = undefined;
    for (pl of world.getPlayers()) {
        if (pl.nameTag.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
        }
    }

    if (!member) {
        return player.tell(`§2[§7Deadlock§2]§f Couldn't find that player!`);
    }

    let inv = member.getComponent("inventory") as EntityInventoryComponent;
    let container = inv.container;

    player.tell(`§2[§7Deadlock§2]§f ${member.name}'s inventory:`);
    let i = 0;
    for (; i < container.size; ++i) {
        const item = container.getItem(i);
        player.tell(` | §fSlot ${i}§r §7=>§r ${item ? `§2[§f${item.id.replace("minecraft:", "")}§2]§r §7Amount: §7x${item.amount}§r §7=>§r §2[§fData ${item.data}§2]§r` : "§2(§7empty§2)§r"}`);
    }
    return void 0;
}
