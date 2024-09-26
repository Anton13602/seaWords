import {_decorator, Component, Node, EventTouch, Vec2, Vec3, UITransform, v3, Camera} from 'cc';
import {gameEventTarget} from "db://assets/scripts/GameEventTarget";
import {GameEvent} from "db://assets/scripts/enums/GameEvent";
import {NodeStateManager} from "db://assets/scripts/NodeStateManager";

const {ccclass, property} = _decorator;

@ccclass('IntersectDetection2D')
export class IntersectDetection2D extends Component {

    @property(Node)
    targetNodes: Node;

    @property(Camera)
    camera: Camera = null;

    onEnable() {
        this._subscribeEvents(true);
    }

    onDisable() {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.POINTER_MOVE, this.onPointerMove, this);
        gameEventTarget[func](GameEvent.POINTER_MOVE_START, this.onPointerMove, this);
    }

    onPointerMove(cPos: Vec2) {
        this._checkIntersect(cPos);
    }

    private _checkIntersect(cPos: Vec2) {
        const worldPos: Vec3 = this.camera.screenToWorld(v3(cPos.x, cPos.y, 0));

        this.targetNodes.children.forEach((childNode) => {
            const uiTransform = childNode.getComponent(UITransform);
            const state = childNode.getComponent(NodeStateManager);

            if (!uiTransform) {
                return;
            }

            if (uiTransform.getBoundingBoxToWorld().contains(new Vec2(worldPos.x, worldPos.y))) {
                gameEventTarget.emit(GameEvent.INTERSECT, childNode, state);
            }
        });
    }
}