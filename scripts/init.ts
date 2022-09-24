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

    // Default Prefix
    worldProperty.defineString("prefix", 1);

    // Debug
    worldProperty.defineBoolean("debug");

    // Hash
    entityProperty.defineString("hash", 45);

    // Salt
    entityProperty.defineString("salt", 45);

    // Private Prefix
    entityProperty.defineString("privatePrefix", 1);

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
