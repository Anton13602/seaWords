import {_decorator, Component, Node, Color, Label, Sprite, Enum} from 'cc';
import {StateNode} from "db://assets/scripts/enums/StateNode";

const {ccclass, property} = _decorator;

@ccclass('NodeStateManager')
export class NodeStateManager extends Component {
    @property(Color)
    public activeColor: Color = new Color();
    @property(Color)
    public defaultColor: Color = new Color();

    @property(Color)
    public activeLabelColor: Color = new Color();
    @property(Color)
    public defaultLabelColor: Color = new Color();

    @property({
        type: Enum(StateNode)
    })
    public currentState: StateNode = StateNode.DEFAULT;

    start() {
        this.updateNodeColor();
    }

    public setState(state: StateNode) {
        this.currentState = state;
        this.updateNodeColor();
    }

    private updateNodeColor() {
        let color: Color;
        let labelColor: Color;
        switch (this.currentState) {
            case StateNode.ACTIVE:
            case StateNode.HIGHLIGHTED:
                color = this.activeColor;
                labelColor = this.activeLabelColor;
                break;
            case StateNode.INACTIVE:
                color = this.defaultColor;
                labelColor = this.defaultLabelColor;
                break;
            default:
                color = this.defaultColor;
                labelColor = this.defaultLabelColor;
        }

        if (this.node) {
            this.node.getComponentsInChildren(Sprite).forEach(sprite => sprite.color = color);
            this.node.getComponentsInChildren(Label).forEach(label => label.color = labelColor);
        }
    }
}