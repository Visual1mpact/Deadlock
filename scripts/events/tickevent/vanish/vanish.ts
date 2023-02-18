import { world, MinecraftEffectTypes, Player, system } from "@minecraft/server";

function vanish() {
    // Filter for only players who are vanished
    let player: Player = undefined;
    for (player of world.getPlayers({ tags: ["vanish"] })) {
        /**
         * They have the tag but does it match with the boolean?
         */
        const vanishProp = player.getDynamicProperty("vanish");
        if (vanishProp === false || vanishProp === undefined) {
            // They have been busted!
            player.removeTag("vanish");
            if (player.getEffect(MinecraftEffectTypes.invisibility) !== undefined || player.getEffect(MinecraftEffectTypes.nightVision) !== undefined) {
                player.runCommandAsync(`effect @s clear`);
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
        player.onScreenDisplay.setActionBar("§2---------------\n§7YOU ARE VANISHED§2\n---------------§r");
    }
}

const TICKS_IN_SEC = 20;

export const Vanish = system.runSchedule(() => {
    vanish();
}, TICKS_IN_SEC);
