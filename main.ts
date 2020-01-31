
namespace SpriteKind {
    export const PlayerOne = SpriteKind.create();
    export const PlayerOneTrail = SpriteKind.create();
    export const PlayerTwo = SpriteKind.create();
    export const PlayerTwoTrail = SpriteKind.create();
}

controller.menu.onEvent(ControllerButtonEvent.Pressed, () => { });

enum Dir {
    up = 0,
    down = 1,
    left = 2,
    right = 3
}

class Player {
    s: Sprite;
    dir: Dir;
    lifespan: number;
    constructor(
        public c: controller.Controller,
        public col: number,
        playerKind: number,
        public trailKind: number
    ) {
        this.s = sprites.create(img`
            . . 2 . .
            . 4 4 4 .
            . 4 4 4 .
            . 4 4 4 .
            . . . . .
        `, playerKind);
        this.dir = Dir.up;
        this.lifespan = 1000;
    }
}

const playerOne = new Player(controller.player1, 0x5, SpriteKind.PlayerOne, SpriteKind.PlayerOneTrail);
const playerTwo = new Player(controller.player2, 0x6, SpriteKind.PlayerTwo, SpriteKind.PlayerTwoTrail);

sprites.onOverlap(
    SpriteKind.PlayerOne,
    SpriteKind.PlayerTwoTrail,
    (s, os) => s.destroy()
);
sprites.onOverlap(
    SpriteKind.PlayerTwo,
    SpriteKind.PlayerOneTrail,
    (s, os) => s.destroy()
);

sprites.onDestroyed(SpriteKind.PlayerOne, sprite => {
    game.splash("Player Two Wins!");
    control.reset();
});

sprites.onDestroyed(SpriteKind.PlayerTwo, sprite => {
    game.splash("Player One Wins!");
    control.reset();
});

playerOne.s.x -= 20;
playerTwo.s.x += 20;

registerPlayer(playerOne);
registerPlayer(playerTwo);

function registerPlayer(player: Player) {
    const { s, c, col, trailKind } = player;
    s.setFlag(SpriteFlag.AutoDestroy, true);
    s.z = 10;
    s.image.replace(0x4, player.col);
    registerButtonEvent(
        c.up,
        Dir.up,
        img`
            . . 2 . .
            . 4 4 4 .
            . 4 4 4 .
            . 4 4 4 .
            . . . . .
        `
    );
    registerButtonEvent(
        c.down,
        Dir.down,
        img`
            . . . . .
            . 4 4 4 .
            . 4 4 4 .
            . 4 4 4 .
            . . 2 . .
        `
    );
    registerButtonEvent(
        c.left,
        Dir.left,
        img`
            . . . . .
            . 4 4 4 .
            2 4 4 4 .
            . 4 4 4 .
            . . . . .
        `
    );
    registerButtonEvent(
        c.right,
        Dir.right,
        img`
            . . . . .
            . 4 4 4 .
            . 4 4 4 2
            . 4 4 4 .
            . . . . .
        `
    );

    function registerButtonEvent(button: controller.Button, dir: Dir, i: Image) {
        button.onEvent(
            ControllerButtonEvent.Pressed,
            () => {
                // num >> 1 divides by two without remainder; this condition
                // prevents the change in direction if on same axis
                // e.g. up = 0 and down = 1, both divide by two without remainder to 0
                if (player.dir >> 1 != dir >> 1) {
                    i.replace(0x4, col);
                    s.setImage(i);
                    player.dir = dir;
                }
            }
        );
    }

    let lastTrail = sprites.create(img`1`, trailKind);
    lastTrail.setPosition(s.x, s.y);
    lastTrail.destroy();
    game.onUpdateInterval(50, function () {
        const jumpSize = Math.ceil(player.lifespan / 2000) + 1;
        player.lifespan += 30;
        const { x, y } = s;

        switch (player.dir) {
            case Dir.up:
                s.y -= jumpSize;
                break;
            case Dir.down:
                s.y += jumpSize;
                break;
            case Dir.left:
                s.x -= jumpSize;
                break;
            case Dir.right:
                s.x += jumpSize;
                break;
        }

        // const diffX = lastTrail.x - s.x;
        // const diffY = lastTrail.y - s.y;

        // let trailImage = image.create(
        //     Math.max(Math.abs(diffX), 1),
        //     Math.max(Math.abs(diffY), 1),
        // );
        const vertMove = player.dir == Dir.up || player.dir == Dir.down;
        const trailImage = image.create(
            vertMove ? 1 : jumpSize,
            vertMove ? jumpSize : 1
        );
        // trailImage.drawLine(
        //     0,
        //     diffY < 0 ? trailImage.height - 1: 0,
        //     trailImage.width - 1,
        //     diffY < 0 ? 0 : trailImage.height - 1,
        //     col
        // );
        trailImage.fill(col);

        const trail = sprites.create(trailImage, trailKind);
        trail.lifespan = player.lifespan;
        trail.setPosition(x, y);

        lastTrail = trail;
    });
}