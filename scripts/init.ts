import { world, DynamicPropertiesDefinition, MinecraftEntityTypes, WorldInitializeEvent } from "mojang-minecraft";

function registry(object: WorldInitializeEvent) {
    // World instance
    const worldProperty = new DynamicPropertiesDefinition();
    // Entity instance
    const entityProperty = new DynamicPropertiesDefinition();

    /**
     * Define property first
     * Register property second
     * Set property third
     */

    // Prefix
    worldProperty.defineString("prefix", 1);

    // Debug
    worldProperty.defineBoolean("debug");

    // Hash
    entityProperty.defineString("hash", 200);

    // Salt
    entityProperty.defineString("salt", 200);

    // Register Defined properties in world globally
    object.propertyRegistry.registerWorldDynamicProperties(worldProperty);
    object.propertyRegistry.registerEntityTypeDynamicProperties(entityProperty, MinecraftEntityTypes.player);

    // Verify and set world property if applicable
    if (world.getDynamicProperty("prefix") === undefined) {
        world.setDynamicProperty("prefix", "!");
    }
    if (world.getDynamicProperty("debug") === undefined) {
        world.setDynamicProperty("debug", false);
    }
}

export const Init = () => {
    world.events.worldInitialize.subscribe((object) => registry(object));
};
