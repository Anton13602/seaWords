import {_decorator, Component, Graphics, Node, Touch, EventTouch, Vec2, v3, Camera, Vec3, v2} from 'cc';
import {gameEventTarget} from "db://assets/scripts/GameEventTarget";
import {GameEvent} from "db://assets/scripts/enums/GameEvent";

const {ccclass, property} = _decorator;

@ccclass('Line')
export class Line extends Component {

    @property(Graphics)
    graphics: Graphics = null;

    @property(Camera)
    camera: Camera = null;

    private _startPos: Vec2 = new Vec2();
    private selectedPoints: Vec2[] = [];
    private allPoints: Vec2[] = [];

    onEnable() {
        this._subscribeEvents(true);
    }

    onDisable() {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.POINTER_MOVE, this.onPointerMove, this);
        gameEventTarget[func](GameEvent.POINTER_MOVE_START, this.onPointerMoveStart, this);
        gameEventTarget[func](GameEvent.POINTER_MOVE_END, this.onPointerMoveEnd, this);
        gameEventTarget[func](GameEvent.DRAW_CURVE, this.onDrawCurve, this);
    }

    onPointerMoveStart(startPos: Vec2): void {
        const world = this.camera.screenToWorld(v3(startPos.x, startPos.y, 0));
        this._startPos.set(world.x, world.y);
    }

    onPointerMove(cPos: Vec2) {
        const world = this.camera.screenToWorld(v3(cPos.x, cPos.y, 0));
        this.graphics.clear();
        this.allPoints.length = 0;

        if (!this.selectedPoints.length) {
            return;
        }

        this.allPoints.push(...this.selectedPoints);
        this.allPoints.push(v2(world.x, world.y), v2(world.x, world.y));

        const smoothPoints = this._drawCatmullRom(this.allPoints);

        this.graphics.moveTo(smoothPoints[1].x, smoothPoints[1].y);

        for (let i = 0; i < smoothPoints.length; i++) {
            this.graphics.lineTo(smoothPoints[i].x, smoothPoints[i].y);
        }

        this.graphics.stroke();
    }

    onPointerMoveEnd(event: EventTouch) {
        this.graphics.clear();
        this.selectedPoints = [];
        this.allPoints = [];
    }

    onDrawCurve(letterPos: Vec3[]) {
        this.selectedPoints.length = 0;
        this.selectedPoints = letterPos.map(pos => new Vec2(pos.x, pos.y));
    }

    private _catmullRom(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): Vec2 {
        const t2 = t * t;
        const t3 = t2 * t;

        const x = 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
        const y = 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

        return new Vec2(x, y);
    }

    private _drawCatmullRom(points: Vec2[]): Vec2[] {
        const numSegments = 20;

        const res: Vec2[] = [];

        for (let i = 0; i < points.length - 2; i++) {
            const p0 = i > 0 ? points[i - 1] : points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1];

            for (let t = 0; t <= 1; t += 1 / numSegments) {
                const pointOnCurve = this._catmullRom(p0, p1, p2, p3, t);;
                res.push(pointOnCurve);
            }
        }

        return res;
    }
}