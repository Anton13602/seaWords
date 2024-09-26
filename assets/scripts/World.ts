import {_decorator, Color, Component, instantiate, Label, Node, Prefab, UITransform, Vec3, tween, Animation} from 'cc';
import {gameEventTarget} from "db://assets/scripts/GameEventTarget";
import {GameEvent} from "db://assets/scripts/enums/GameEvent";

const {ccclass, property} = _decorator;

@ccclass('World')
export class World extends Component {

    @property(Prefab)
    framePrefab: Prefab = null;

    @property(Color)
    labelColor: Color = new Color();

    private _letters: string[] = [];

    onEnable() {
        this._subscribeEvents(true);
    }

    onDisable() {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.ENTER_WORD, this.onEnterWord, this);
        gameEventTarget[func](GameEvent.POINTER_MOVE_END, this.onPointerMoveEnd, this);
    }

    onEnterWord(letters: Node[]): void {
        this._letters.length = 0;
        this.node.removeAllChildren();

        const {height, width} = this.framePrefab.data.getComponent(UITransform);

        const totalWidth = (letters.length - 1) * width;
        const offsetX = -(totalWidth / 2);

        letters.forEach((letter, i) => {
            const {string} = letter.getComponentInChildren(Label);

            const letterNode = instantiate(this.framePrefab);
            letterNode.setPosition(offsetX + (width * i), 0);

            const label = letterNode.getComponentInChildren(Label);
            label.color = this.labelColor;
            label.string = string;

            this._letters.push(string);
            this.node.addChild(letterNode);
        })
    }

    protected onPointerMoveEnd() {
        gameEventTarget.emit(GameEvent.CHECK_WORD, this._letters.join(''), this.actionRight.bind(this), this.actionWrong.bind(this));
    }

    protected actionRight(positions: Vec3[], scale: number) {
        tween(this.node)
            .to(0.3, {scale: new Vec3(scale + 0.15, scale + 0.15, scale + 0.15)})
            .start();

        this.node.children.forEach((child, i) => {
            const animation = child.getComponent(Animation)
            animation.play('rightColor')
            tween(child)
                .to(0.3, {worldPosition: positions[i]})
                .delay(0.1)
                .by(0.2, {scale: new Vec3(-0.2, -0.2, -0.2)})
                .call(() => {
                    this.node.setScale(new Vec3(0.6,0.6,0.6))
                    child.destroy();
                })
                .start();
        })
    }

    protected actionWrong() {
        this.node.children.forEach((child, i) => {
            const animation = child.getComponent(Animation)
            animation.play('wrongColor')
            tween(child)
                .by(0.05, {position: new Vec3(-10, 0, 0)},)
                .by(0.05, {position: new Vec3(20, 0, 0)},)
                .by(0.05, {position: new Vec3(-10, 0, 0)})
                .union()
                .repeat(2)
                .delay(0.1)
                .call(() => {
                    child.destroy();
                })
                .start();
        })
    }
}

