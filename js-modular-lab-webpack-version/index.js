import { runRobotAnimation } from "./src/animation.js";
import { goalOrientedRobot } from "./src/robot.js";
import VillageState from "./src/state.js";

runRobotAnimation(VillageState.random(), goalOrientedRobot, []);
