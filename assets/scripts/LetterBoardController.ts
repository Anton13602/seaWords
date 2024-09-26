import {_decorator, Component, Node, Label, UITransform, tween, v3} from 'cc';
import {gameEventTarget} from "db://assets/scripts/GameEventTarget";
import {GameEvent} from "db://assets/scripts/enums/GameEvent";
import {NodeStateManager} from "db://assets/scripts/NodeStateManager";
import {StateNode} from "db://assets/scripts/enums/StateNode";

const {ccclass, property} = _decorator;

@ccclass('LetterBoardController')
export class LetterBoardController extends Component {

    private _lettersNode: Node[] = [];

    onEnable() {
        this._subscribeEvents(true);
    }

    onDisable() {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.INTERSECT, this.onIntersect, this);
        gameEventTarget[func](GameEvent.POINTER_MOVE_END, this.onPointerMoveEnd, this);
    }

    private _updateNodeState(node: Node): void {
        const stateComponent = node.getComponent(NodeStateManager);
        stateComponent.setState(StateNode.ACTIVE);
        gameEventTarget.emit(GameEvent.DRAW_CURVE, this._lettersNode.map(node => node.getWorldPosition()));
        gameEventTarget.emit(GameEvent.ENTER_WORD, this._lettersNode);
    }

    onIntersect(node: Node): void {
        const stateComponent = node.getComponent(NodeStateManager);

        if (this._lettersNode.length > 1 && this._lettersNode[this._lettersNode.length - 2] === node) {
            const prevNode = this._lettersNode.pop();
            const stateComponent = prevNode.getComponent(NodeStateManager);
            stateComponent.setState(StateNode.INACTIVE);
            this._actionTap(prevNode, StateNode.INACTIVE);
            this._updateNodeState(node);
        }

        if (stateComponent.currentState === StateNode.ACTIVE) {
            return;
        }

        this._lettersNode.push(node);
        this._updateNodeState(node);
        this._actionTap(node, StateNode.ACTIVE);
    }

    onPointerMoveEnd() {
        this.node.getComponentsInChildren(NodeStateManager).forEach((state: NodeStateManager) => {
            state.setState(StateNode.INACTIVE)

            this._actionTap(state.node, StateNode.INACTIVE);
        })

        this._lettersNode.length = 0;
    }

    private _actionTap(selectNode: Node, state: StateNode): void {
        const {scale} = selectNode;

        const toScale = state === StateNode.ACTIVE ? v3(scale.x + 0.1, scale.x + 0.1, scale.x + 0.1) : v3(1, 1, 1)
        tween(selectNode)
            .to(0.08, {scale: toScale})
            .start();
    }
}

