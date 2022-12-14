import { world, DynamicPropertiesDefinition, MinecraftEntityTypes, WorldInitializeEvent } from "@minecraft/server";

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

    // Vanish
    entityProperty.defineBoolean("vanish");

    // Hash
    entityProperty.defineString("hash", 45);

    // Salt
    entityProperty.defineString("salt", 45);

    // Private Prefix
    entityProperty.defineString("privatePrefix", 1);

    // Tiny
    entityProperty.defineBoolean("tiny");

    // Register Defined properties in world globally
    object.propertyRegistry.registerWorldDynamicProperties(worldProperty);
    object.propertyRegistry.registerEntityTypeDynamicProperties(entityProperty, MinecraftEntityTypes.player);

    // Verify and set world property if applicable
    if (world.getDynamicProperty("prefix") === undefined) {
        world.setDynamicProperty("prefix", "!");
    }
}

export const Init = () => {
    world.events.worldInitialize.subscribe((object) => registry(object));
};
