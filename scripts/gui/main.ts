import { BeforeItemUseEvent, Player, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import config from "../data/config";
import { crypto } from "../util";
import { guiDEOP } from "./Moderation/deop";
import { guiOP } from "./Moderation/op";
import { guiPrefix } from "./Moderation/prefix";
import { guiDome } from "./Utility/dome";
import { guiECWipe } from "./Utility/ecwipe";

function userinterface(data: BeforeItemUseEvent) {
    // Declare objects
    const { item, source } = data;

    /**
     * We don't want entities triggering this code
     * so be sure it is a player and abort if it is not.
     */
    if (!(source instanceof Player)) {
        return void 0;
    }

    /**
     * If the player is holding a compass and they "use" it then bring up the main window
     */
    if (item.typeId === "minecraft:compass") {
        /**
         * Title and body is self explanatory
         *
         * Buttons run in order from top to bottom
         * starting at 0. So if you have 5 buttons
         * then it would be 0, 1, 2, 3, 4.
         */
        // New instance for main window
        const gui = new ActionFormData();
        gui.title("§2[§0Deadlock§2]§f");
        gui.body("\n  §2[§rA behavior pack tool for Minecraft§2]§f\n\n");

        /**
         * Verify if they have op or not then show proper gui
         */
        let hash = source.getDynamicProperty("hash");
        let salt = source.getDynamicProperty("salt");
        let encode = crypto(salt, config.permission.password) ?? null;
        if (hash !== encode) {
            gui.button("§2[§0op§2]§f", "textures/items/ender_eye");
        } else {
            gui.button("§2[§0op§2]§f", "textures/items/ender_eye");
            gui.button("§2[§0deop§2]§f", "textures/items/ender_pearl");
            gui.button("§2[§0prefix§2]§f", "textures/items/book_enchanted");
            gui.button("§2[§0dome§2]§f", "textures/items/diamond_pickaxe");
            gui.button("§2[§0ecwipe§2]§f", "textures/blocks/ender_chest_front");
            gui.button("§2[§0enchant§2]§f", "textures/items/potion_bottle_heal");
        }
        gui.show(source).then((result) => {
            // op
            if (result.selection === 0) {
                // New window for op
                const opgui = new ModalFormData();
                let onlineList: string[] = [];
                opgui.title("§2[§0OP§2]§f");
                if (hash !== encode) {
                    opgui.textField(`\nPassword\n`, `Enter password here.`);
                } else {
                    onlineList = Array.from(world.getPlayers(), (player) => player.name);
                    opgui.dropdown(`\n  §2[§rGrants permission to use Deadlock§2]§r\n\nPlayer's Online\n`, onlineList);
                }

                /**
                 * Show window for op.
                 *
                 * If they don't have op then we show a window for them to enter a password.
                 * If they do have op then we show them a drop down list of all players
                 * currently online from where they can select and submit a specific player for op.
                 */
                opgui.show(source).then((opResult) => {
                    guiOP(opResult, salt, hash, encode, onlineList, source);
                });
            }
            // deop
            if (result.selection === 1) {
                // New window for deop
                const deopgui = new ModalFormData();
                deopgui.title("§2[§0DEOP§2]§f");
                const onlineList = Array.from(world.getPlayers(), (player) => player.name);
                deopgui.dropdown(`\n §2[§rRevokes permission to use Deadlock§2]§r\n\nPlayer's Online\n`, onlineList);

                /**
                 * Show window for deop.
                 *
                 * Select player from dropdown list to submit
                 * and have permissions revoked.
                 */
                deopgui.show(source).then((opResult) => {
                    guiDEOP(opResult, onlineList, source);
                });
            }
            // prefix
            if (result.selection === 2) {
                // New window for prefix
                const prefixgui = new ModalFormData();
                prefixgui.title("§2[§0PREFIX§2]§f");
                const onlineList = Array.from(world.getPlayers(), (player) => player.name);
                prefixgui.dropdown(`\n  §2[§rChanges prefix used for commands§2]§r\n\nPlayer's Online\n`, onlineList);
                prefixgui.textField(`\nPrefix\n`, `Put new prefix here`, null);
                prefixgui.toggle(`\nReset Prefix`, false);

                /**
                 * Show window for prefix.
                 *
                 * Select player from dropdown list to submit a new prefix
                 * or reset that player's prefix for use with commands.
                 */
                prefixgui.show(source).then((opResult) => {
                    guiPrefix(opResult, onlineList, source);
                });
            }
            // dome
            if (result.selection === 3) {
                // New window for dome
                const domegui = new ModalFormData();
                domegui.title("§2[§0DOME§2]§f");
                domegui.slider(`\n    §2[§rCreates a sphere or hemisphere§2]§r\n\nRadius`, 0, 30, 1);
                domegui.textField(`\nBlock Type\n`, `Enter block type here`);
                domegui.toggle(`\nEnable Sphere`, false);

                /**
                 * Show window for dome.
                 *
                 * Create a dome as a hemisphere
                 * or a sphere based on a specified block type.
                 */
                domegui.show(source).then((opResult) => {
                    guiDome(opResult, source);
                });
            }
            // ecwipe
            if (result.selection === 4) {
                // New window for ecwipe
                const ecwipegui = new ModalFormData();
                ecwipegui.title("§2[§0ECWIPE§2]§f");
                const onlineList = Array.from(world.getPlayers(), (player) => player.name);
                ecwipegui.dropdown(`\n      §2[§rWipe the players Ender Chest§2]§r\n\nPlayer's Online\n`, onlineList);

                /**
                 * Show window for ecwipe.
                 *
                 * Wipe the ender chest of a selected player.
                 */
                ecwipegui.show(source).then((opResult) => {
                    guiECWipe(opResult, source, onlineList);
                });
            }
            // enchant
            if (result.selection === 4) {
                // New window for enchant
                const enchantgui = new ModalFormData();
                enchantgui.title("§2[§0ENCHANT§2]§f");
                const onlineList = Array.from(world.getPlayers(), (player) => player.name);
                enchantgui.dropdown(`\n      §2[§rEnchant an item§2]§r\n\nPlayer's Online\n`, onlineList);

                /**
                 * Show window for enchant.
                 *
                 * Enchant items or show a list of enchantments allowed on an item.
                 */
                enchantgui.show(source).then((opResult) => {
                    source.tell(`This is not finished`);
                });
            }
        });
    }
}

export const UserInterface = () => {
    world.events.beforeItemUse.subscribe(userinterface);
};
