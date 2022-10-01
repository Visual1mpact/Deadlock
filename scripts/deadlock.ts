import { Init } from "./init.js";
import { Handler } from "./command/handler.js";
import { WatchDog } from "./events/systemevent/watchdog.js";
import { Vanish } from "./events/tickevent/vanish/vanish.js";

WatchDog();
Init();
Handler();
Vanish();
