export enum GameEvent {
    NONE,

    REGISTER_BUTTON,
    UNREGISTER_BUTTON,

    POINTER_MOVE_START,
    POINTER_MOVE,
    POINTER_CANCEL,
    POINTER_MOVE_END,

    INTERSECT,

    CHECK_WORD,
    ENTER_WORD,

    DRAW_CURVE,
    NEXT_LEVEL,
    SHOW_SCREEN_UI
}