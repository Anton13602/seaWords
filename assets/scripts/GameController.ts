import { _decorator, Component, Node, JsonAsset, Label } from 'cc';
import { JsonData } from "db://assets/scripts/types/types";
import { gameEventTarget } from "db://assets/scripts/GameEventTarget";
import { GameEvent } from "db://assets/scripts/enums/GameEvent";
import { GenerateWords } from "db://assets/scripts/GenerateWords";
import { GenerateLetters } from "db://assets/scripts/GenerateLetters";

const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property({ type: JsonAsset })
    jsonData: JsonAsset[] & JsonData<{ words: string[] }>[] = [];

    @property({ type: Node })
    words: Node = null;

    @property({ type: Node })
    textLevel: Node = null;

    @property({ type: Node })
    letterBoard: Node = null;

    @property({ type: Node })
    allScreenBtn: Node = null;

    @property({ type: Node })
    screenUI: Node = null;

    @property({ type: Label })
    currentLvl: Label = null;

    private counter = 0;
    private levelCounter = 1;

    onEnable() {
        this._toggleEventSubscription(true);
    }

    onDisable() {
        this._toggleEventSubscription(false);
    }

    private _toggleEventSubscription(isOn: boolean) {
        const eventMethod = isOn ? 'on' : 'off';
        gameEventTarget[eventMethod](GameEvent.NEXT_LEVEL, this.onNextLevel, this);
        gameEventTarget[eventMethod](GameEvent.SHOW_SCREEN_UI, this.showScreenUI, this);
    }

    showScreenUI() {
        this._toggleUI(this.allScreenBtn, false);
        this._toggleUI(this.screenUI, true);
    }

    onNextLevel() {
        this._toggleUI(this.screenUI, false);
        this._toggleUI(this.allScreenBtn, true);

        this.counter = this.counter === 2 ? 0 : this.counter += 1;

        this._updateWorld();
        this._updateLevelDisplay();
        this._updateLetterBoard();
    }

    private _toggleUI(node: Node, isActive: boolean) {
        this.scheduleOnce(() => {
            node.active = isActive;
        });
    }

    private _updateWorld() {
        this.words.active = false;
        const generateWorlds = this.words.getComponent(GenerateWords);
        generateWorlds.jsonData = this.jsonData[this.counter];
        this.words.active = true;
    }

    private _updateLevelDisplay() {
        this.levelCounter++;
        const nextLevel = this.levelCounter + 1;

        this.textLevel.getComponentInChildren(Label).string = `Уровень ${this.levelCounter}`;
        this.screenUI.getComponentInChildren(Label).string = `Уровень ${nextLevel}`;
        this.currentLvl.string = `Уровень ${this.levelCounter} пройден`;
    }

    private _updateLetterBoard() {
        this.letterBoard.active = false;
        const generateLevel = this.letterBoard.getComponent(GenerateLetters);
        generateLevel.jsonData = this.jsonData[this.counter];
        this.letterBoard.active = true;
    }
}