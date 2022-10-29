import { BeforeItemUseEvent, Player, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import config from "../data/config";
import { crypto } from "../util";
import { guiDEOP } from "./Moderation/deop";
import { guiOP } from "./Moderation/op";
import { guiPrefix } from "./Moderation/prefix";
import { guiDome } from "./Utility/dome";
import { guiECWipe } from "./Utility/ecwipe";
import { guiEnchantItem, guiEnchantLevel, guiEnchantListItem, guiHotbarItems } from "./Utility/enchant";
import { guiGamemode } from "./Utility/gamemode";
import { guiGive, guiGiveAmount, guiGiveTest } from "./Utility/give";

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
            gui.button("§2[§0gamemode§2]§f", "textures/items/totem");
            gui.button("§2[§0give§2]§f", "textures/items/goat_horn");
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
            if (result.selection === 5) {
                // New window for enchant
                const enchantgui = new ModalFormData();
                enchantgui.title("§2[§0ENCHANT§2]§f");
                const onlineList = Array.from(world.getPlayers(), (player) => player.name);
                enchantgui.dropdown(`\n        §2[§rYou can enchant an item§2]§r\n\nPlayer's Online\n`, onlineList);

                /**
                 * Show window for enchant.
                 *
                 * Enchant items or show a list of enchantments allowed on an item.
                 */
                enchantgui.show(source).then((opResult) => {
                    const [playerDropdown] = opResult.formValues;
                    let hotbarList = guiHotbarItems(opResult, onlineList);
                    if (hotbarList[0] === "none") {
                        return source.tell(`§2[§7Deadlock§2]§f They have no items in their hotbar.`);
                    }
                    const itemOptions = new ModalFormData();
                    itemOptions.title("§2[§0ENCHANT§2]§f");
                    itemOptions.dropdown(`\n        §2[§rYou can enchant an item§2]§r\n\nHotbar Item's\n`, hotbarList);

                    itemOptions.show(source).then((result) => {
                        const [hotbarDropdown] = result.formValues;
                        let enchantmentList = guiEnchantListItem(result, onlineList[playerDropdown]);
                        if (enchantmentList[0] === "none") {
                            return source.tell(`§2[§7Deadlock§2]§f This item doesn't allow enchantments.`);
                        }
                        const enchantOptions = new ModalFormData();
                        enchantOptions.title("§2[§0ENCHANT§2]§f");
                        enchantOptions.dropdown(`\n        §2[§rYou can enchant an item§2]§r\n\nAllowed Enchantment's\n`, enchantmentList);

                        enchantOptions.show(source).then((result) => {
                            const [enchantDropdown] = result.formValues;
                            let enchantLevel = guiEnchantLevel(enchantmentList[enchantDropdown], onlineList[playerDropdown], hotbarDropdown);
                            const levelOptions = new ModalFormData();
                            levelOptions.title("§2[§0ENCHANT§2]§f");
                            levelOptions.slider(`\n           §2[§rSelect level (Max: ${enchantLevel})§2]§r\n\nLevel`, 1, enchantLevel, 1);
                            levelOptions.show(source).then((finalResult) => {
                                guiEnchantItem(finalResult, onlineList[playerDropdown], hotbarDropdown, enchantmentList[enchantDropdown]);
                                source.tell(`§2[§7Deadlock§2]§f ${hotbarList[hotbarDropdown]} is enchanted with ${enchantmentList[enchantDropdown]}.`);
                            });
                        });
                    });
                });
            }
            // gamemode
            if (result.selection === 6) {
                // New window for gamemode
                const gamemodegui = new ModalFormData();
                gamemodegui.title("§2[§0GAMEMODE§2]§f");
                const onlineList = Array.from(world.getPlayers(), (player) => player.name);
                gamemodegui.dropdown(`\n        §2[§rYou can change game mode§2]§r\n\nPlayer's Online\n`, onlineList);

                /**
                 * Show window for gamemode.
                 *
                 * Change gamemode.
                 * 0. survival
                 * 1. creative
                 * 2. adventure
                 */
                gamemodegui.show(source).then((result) => {
                    if (result.canceled) {
                        return void 0;
                    }
                    const gamemodeOptions = new ActionFormData();
                    gamemodeOptions.title(`§2[§0GAMEMODE§2]§f`);
                    gamemodeOptions.body(`\n       §2[§rYou can change game mode§2]§r\n\n`);
                    gamemodeOptions.button("§2[§0survival§2]§f");
                    gamemodeOptions.button("§2[§0creative§2]§f");
                    gamemodeOptions.button("§2[§0adventure§2]§f");

                    gamemodeOptions.show(source).then((result) => {
                        guiGamemode(result, onlineList, source);
                    });
                });
            }
            // give
            if (result.selection === 7) {
                // New window for give
                const givegui = new ModalFormData();
                givegui.title("§2[§0GIVE§2]§f");
                const onlineList = Array.from(world.getPlayers(), (player) => player.name);
                givegui.dropdown(`\n             §2[§rYou can give item's§2]§r\n\nPlayer's Online\n`, onlineList);
                givegui.textField(`\nDesired Item`, `Enter item here. EX: sea_lantern`);

                /**
                 * Show window for give.
                 *
                 * Give items freely to yourself or other players.
                 */
                givegui.show(source).then((opResult) => {
                    const [giveDropdown, giveTextfield] = opResult.formValues;
                    const itemType = guiGiveTest(opResult, onlineList);
                    if (!itemType) {
                        return source.tell(`§2[§7Deadlock§2]§f This item could not be found! Try again.`);
                    }
                    const maxStack = guiGiveAmount(giveTextfield);
                    const giveOptions = new ModalFormData();
                    giveOptions.title("§2[§0GIVE§2]§f");
                    giveOptions.slider(`\n         §2[§rSelect amount (Max: ${maxStack})§2]§r\n\nLevel`, 1, maxStack, 1);
                    giveOptions.textField(`\nData value (optional)`, `Enter data for item`, null);

                    giveOptions.show(source).then((result) => {
                        guiGive(onlineList[giveDropdown], result, giveTextfield, source);
                    });
                });
            }
        });
    }
}

export const UserInterface = () => {
    world.events.beforeItemUse.subscribe(userinterface);
};
