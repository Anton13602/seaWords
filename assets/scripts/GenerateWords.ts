import {_decorator, Component, Node, JsonAsset, Prefab, instantiate, Label, UITransform, Vec3, CCInteger} from 'cc';
import {JsonData} from "db://assets/scripts/types/types";
import {gameEventTarget} from "db://assets/scripts/GameEventTarget";
import {GameEvent} from "db://assets/scripts/enums/GameEvent";
import {NodeStateManager} from "db://assets/scripts/NodeStateManager";
import {StateNode} from "db://assets/scripts/enums/StateNode";

const {ccclass, property} = _decorator;

@ccclass('GenerateWords')
export class GenerateWords extends Component {

    @property({type: JsonAsset})
    jsonData: JsonAsset & JsonData<{ words: string[] }> = null;

    @property(Prefab)
    framePrefab: Prefab = null;

    @property(Prefab)
    worldPrefab: Prefab = null;

    @property(CCInteger)
    maxSize: number = 400;

    words: string[] = [];


    onEnable() {
        const {json} = this.jsonData;
        const {words} = json;

        const sortWords = this.words = words.sort((a, b) => a.length - b.length);

        this.node.removeAllChildren();


        for (let i = 0; i < sortWords.length; i++) {
            this._generateWorld(sortWords[i], sortWords.length, i);
        }

        this._setSize(sortWords.length)
        this._subscribeEvents(true);
    }

    onDisable() {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.CHECK_WORD, this.onCheckWord, this);
    }

    private _generateWorld(world: string, countWorlds: number, cIndex: number) {

        const length = world.length;
        const {height, width} = this.framePrefab.data.getComponent(UITransform);

        const wordNode = instantiate(this.worldPrefab);
        wordNode['currentWorld'] = world;

        wordNode.setPosition(0, -cIndex * height);

        const totalWidth = (length - 1) * width;
        const offsetX = -(totalWidth / 2);

        for (let i = 0; i < length; i++) {
            const letter = world[i];

            const letterNode = instantiate(this.framePrefab);
            letterNode.setPosition(offsetX + (width * i), 0);

            const label = letterNode.getComponentInChildren(Label);
            label.string = letter.toUpperCase();

            wordNode.addChild(letterNode);
        }

        this.node.addChild(wordNode);
    }

    onCheckWord(word: string, cbR?: (pos: Vec3[], scale: number) => void, cbW?: () => void) {
        if (this.words.includes(word.toLowerCase())) {
            const wordNode = this.node.children.find((child) => {
                return child['currentWorld'] === word.toLowerCase();
            });

           const state = wordNode.getComponent(NodeStateManager);

           if (StateNode.ACTIVE === state.currentState) {
               return;
           }
           state.setState(StateNode.ACTIVE);


            cbR?.(wordNode.children.map((child) => child.getWorldPosition()), this.node.scale.x);
        } else {
            cbW?.();
        }

        const isFindAllWord = this.node.children.every(child => {
            const state = child.getComponent(NodeStateManager);
            return state.currentState === StateNode.ACTIVE;
        })

        if (isFindAllWord) {
            this.scheduleOnce(() => {
                gameEventTarget.emit(GameEvent.SHOW_SCREEN_UI)
            }, 0.4)
        }
    }

   private _setSize(counterWords: number) {
       const {height, width} = this.framePrefab.data.getComponent(UITransform);
       const totalWordsHeight = height * counterWords;

       if (totalWordsHeight <= this.maxSize ) {
           return 1;
       }

       const scale = this.maxSize / totalWordsHeight;

       this.node.setScale(new Vec3(scale,scale,scale))
   }
}
