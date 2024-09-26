import {_decorator, Component, Node, JsonAsset, instantiate, Prefab, Label , UITransform} from 'cc';
import {JsonData} from "db://assets/scripts/types/types";

const {ccclass, property} = _decorator;

@ccclass('GenerateLetters')
export class GenerateLetters extends Component {

    @property({type: JsonAsset})
    jsonData: JsonAsset & JsonData<{ words: string[] }> = null;

    @property(Prefab)
    circlePrefab: Prefab = null;

    onEnable() {
        const {json} = this.jsonData;
        const {words} = json;

        this.node.removeAllChildren();

        const letters = this.getMinimumLetters(words);

        const shufflerLetters = this.shuffl(letters)

        this.createLetterCircle(shufflerLetters);

        this._subscribeEvents(true);
    }

    onDisable() {
        this._subscribeEvents(false);
    }


    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

    }

    getMinimumLetters(words: string[]): string[] {
        const letterCount = words.reduce((acc: Record<string, number>, word: string) => {
            const currentCount: Record<string, number> = {};

            for (let i = 0; i < word.length; i++) {
                currentCount[word[i]] = (currentCount[word[i]] || 0) + 1;
            }

            for (let letter in currentCount) {
                acc[letter] = Math.max(acc[letter] || 0, currentCount[letter]);
            }

            return acc;
        }, {});

        const minimumLetters: string[] = [];
        for (let letter in letterCount) {
            for (let i = 0; i < letterCount[letter]; i++) {
                minimumLetters.push(letter);
            }
        }

        return minimumLetters;
    }

    shuffl(letters: string[]) {
        let currentIndex = letters.length;
        let randomIndex: number;

        while (currentIndex !== 0) {

            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [letters[currentIndex], letters[randomIndex]] = [
                letters[randomIndex], letters[currentIndex]];
        }

        return letters;
    }

    createLetterCircle(letters: string[]) {
        const transform = this.node.getComponent(UITransform)
        const radius = transform.contentSize.width / 2 - 10 ;
        const angleStep = (2 * Math.PI) / letters.length;

        letters.forEach((letter, index) => {
            const letterNode = instantiate(this.circlePrefab);
            const angle = index * angleStep + Math.PI / 2;

            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            letterNode.setPosition(x, y);

            const label = letterNode.getComponentInChildren(Label);
            label.string = letter.toUpperCase();

            this.node.addChild(letterNode);
        });
    }
}

