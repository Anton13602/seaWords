import { Vec2 } from "cc";
import { gameEventTarget } from "db://assets/scripts/GameEventTarget";
import { GameEvent } from "db://assets/scripts/enums/GameEvent";
import { ScreenButton } from "db://assets/scripts/input/ScreenButton";

export const CommandDict = {
   moveStartCommand(button: ScreenButton) {
        gameEventTarget.emit(GameEvent.POINTER_MOVE_START, button.touchStartPos);
    },

    moveCommand(button: ScreenButton) {
        if (button.touchCurrPos && button.touchStartPos) {
            let delta = new Vec2();
            Vec2.subtract(delta, button.touchCurrPos, button.touchStartPos);
            gameEventTarget.emit(GameEvent.POINTER_MOVE, button.touchCurrPos, delta);
        }
    },

    endCommand(button: ScreenButton) {
        gameEventTarget.emit(GameEvent.POINTER_MOVE_END);
    },

    cancelCommand(button: ScreenButton) {
        gameEventTarget.emit(GameEvent.POINTER_CANCEL);
    },

    nextLevelCommand(button: ScreenButton) {
        gameEventTarget.emit(GameEvent.NEXT_LEVEL);
    },

}
