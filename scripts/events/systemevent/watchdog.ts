// @ts-ignore
import { BeforeWatchdogTerminateEvent, system } from "mojang-minecraft";

function watchdog(terminator: BeforeWatchdogTerminateEvent) {
    // Cancel watchdog from shutting down server/realm
    terminator.cancel = true;
}

export const WatchDog = () => {
    // Listen to watchdog
    system.events.beforeWatchdogTerminate.subscribe(watchdog);
};
