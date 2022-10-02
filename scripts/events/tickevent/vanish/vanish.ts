import { world, MinecraftEffectTypes, Player } from "mojang-minecraft";

function vanish() {
    // Filter for only players who are vanished
    let player: Player = undefined;
    for (player of world.getPlayers({ tags: ["vanish"] })) {
        /**
         * They have the tag but does it match with the boolean?
         */
        if (player.getDynamicProperty("vanish") === false || player.getDynamicProperty("vanish") === undefined) {
            // They have been busted!
            player.removeTag("vanish");
            if (player.getEffect(MinecraftEffectTypes.invisibility) !== undefined || player.getEffect(MinecraftEffectTypes.nightVision) !== undefined) {
                player.runCommand(`effect @s clear`);
            }
            player.triggerEvent("unvanish");
            player.tell(`§2[§7Deadlock§2]§f You had unauthorized permissions for Vanish.`);
            continue;
        }

        /**
         * Grant them invisibility and night vision
         * 1728000 = 24 hours
         */
        player.addEffect(MinecraftEffectTypes.invisibility, 1728000, 255, false);
        player.addEffect(MinecraftEffectTypes.nightVision, 1728000, 255, false);
        player.runCommand(`title @s actionbar §2---------------\n§7YOU ARE VANISHED§2\n---------------§r`);
    }
}

export const Vanish = () => {
    world.events.tick.subscribe(vanish);
};
