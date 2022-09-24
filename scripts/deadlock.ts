import { Init } from "./init.js";
import { Handler } from "./command/handler.js";
import { WatchDog } from "./events/systemevent/watchdog.js";

WatchDog();
Init();
Handler();
