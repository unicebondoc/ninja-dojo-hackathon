import { EventBus } from "@/game/events";

type ActorState = "idle" | "walking" | "working" | "done";
type AgentId = "Moji" | "Miji" | "Renegade" | "Sensei" | "Tester" | "Meowts";
type Position = { x: number; y: number };

type ActorConfig = {
  busy: string;
  done: string;
  file: string;
  home: Position;
  id: AgentId;
  role: string;
  work: Position;
};

type ActorRuntime = ActorConfig & {
  bubble?: any;
  check?: any;
  container: any;
  label: any;
  shadow: any;
  sprite: any;
  state: ActorState;
};

export type DojoSceneController = {
  resetDojo: () => void;
  runDojo: () => void;
  showSpeech: (id: AgentId) => void;
};

const sceneSize = { height: 720, width: 1280 };

const actors: ActorConfig[] = [
  {
    busy: "Writing the plan.",
    done: "Plan complete.",
    file: "moji",
    home: { x: 12, y: 78 },
    id: "Moji",
    role: "Plan",
    work: { x: 43, y: 48 }
  },
  {
    busy: "Building the oracle page.",
    done: "Build complete.",
    file: "miji",
    home: { x: 22, y: 82 },
    id: "Miji",
    role: "Build",
    work: { x: 35, y: 60 }
  },
  {
    busy: "Attacking weak spots.",
    done: "Weak spots found.",
    file: "renegade",
    home: { x: 82, y: 78 },
    id: "Renegade",
    role: "Attack",
    work: { x: 65, y: 50 }
  },
  {
    busy: "Reviewing architecture.",
    done: "Architecture approved.",
    file: "sensei",
    home: { x: 72, y: 83 },
    id: "Sensei",
    role: "Review",
    work: { x: 62, y: 66 }
  },
  {
    busy: "Running build checks.",
    done: "Checks passed.",
    file: "tester",
    home: { x: 48, y: 86 },
    id: "Tester",
    role: "Deploy",
    work: { x: 50, y: 70 }
  },
  {
    busy: "Judging the final run.",
    done: "Approved. The moon may rise.",
    file: "meowts",
    home: { x: 92, y: 58 },
    id: "Meowts",
    role: "Judge",
    work: { x: 78, y: 42 }
  }
];

const timeline = [
  { agent: "Moji" as AgentId, at: 1500, duration: 1200, effect: "plan" },
  { agent: "Miji" as AgentId, at: 3500, duration: 1200, effect: "build" },
  { agent: "Renegade" as AgentId, at: 6000, duration: 900, effect: "attack" },
  { agent: "Sensei" as AgentId, at: 9000, duration: 1100, effect: "review" },
  { agent: "Tester" as AgentId, at: 11000, duration: 1100, effect: "deploy" },
  { agent: "Meowts" as AgentId, at: 13000, duration: 1000, effect: "judge" }
];

function toPoint(position: Position) {
  return {
    x: (position.x / 100) * sceneSize.width,
    y: (position.y / 100) * sceneSize.height
  };
}

export function createDojoScene(Phaser: any) {
  return class DojoScene extends Phaser.Scene implements DojoSceneController {
    private actorMap = new Map<AgentId, ActorRuntime>();
    private moon?: any;
    private runEvents: any[] = [];
    private running = false;
    private scroll?: any;
    private slash?: any;

    constructor() {
      super("DojoScene");
    }

    preload() {
      this.load.image("dojo-background", "/assets/dojo/dojo-background.png");
      this.load.image("scroll", "/assets/dojo/scroll.png");
      this.load.image("moon", "/assets/dojo/moon.png");
      this.load.image("slash", "/assets/dojo/slash.png");
      this.load.image("petal", "/assets/dojo/petal.png");

      actors.forEach((actor) => {
        this.load.image(`${actor.file}-idle`, `/assets/dojo/${actor.file}.png`);
        this.load.spritesheet(
          `${actor.file}-walk`,
          `/assets/dojo/${actor.file}-walk.png`,
          {
            frameHeight: 1024,
            frameWidth: 384
          }
        );
      });
    }

    create() {
      this.cameras.main.setBackgroundColor("#070403");
      this.add
        .image(sceneSize.width / 2, sceneSize.height / 2, "dojo-background")
        .setDisplaySize(sceneSize.width, sceneSize.height)
        .setDepth(0);

      this.add
        .rectangle(
          sceneSize.width / 2,
          sceneSize.height / 2,
          sceneSize.width,
          sceneSize.height,
          0x000000,
          0.2
        )
        .setDepth(1);

      this.scroll = this.add
        .image(toPoint({ x: 50, y: 50 }).x, toPoint({ x: 50, y: 50 }).y, "scroll")
        .setDisplaySize(132, 132)
        .setAlpha(0.45)
        .setDepth(4);

      this.moon = this.add
        .image(toPoint({ x: 86, y: 18 }).x, toPoint({ x: 86, y: 18 }).y, "moon")
        .setDisplaySize(110, 110)
        .setAlpha(0.18)
        .setDepth(3);

      this.slash = this.add
        .image(toPoint({ x: 62, y: 43 }).x, toPoint({ x: 62, y: 43 }).y, "slash")
        .setDisplaySize(360, 220)
        .setAlpha(0)
        .setDepth(10);

      this.createPetals();
      this.createAnimations();
      this.createActors();
      EventBus.emit("dojo-scene-ready", this);
    }

    resetDojo() {
      this.running = false;
      this.runEvents.forEach((event) => event?.remove?.());
      this.runEvents = [];
      this.tweens.killAll();

      this.scroll?.setAlpha(0.45).setScale(1).setAngle(0);
      this.moon?.setAlpha(0.18).setScale(1).clearTint();
      this.slash?.setAlpha(0);

      this.actorMap.forEach((actor) => {
        const home = toPoint(actor.home);
        actor.container.setPosition(home.x, home.y).setAlpha(1);
        actor.container.setScale(1);
        actor.sprite.setTexture(`${actor.file}-idle`).setDisplaySize(122, 142);
        actor.sprite.stop?.();
        actor.label.setText(`${actor.id.toUpperCase()} / ${actor.role}`);
        actor.check?.destroy();
        actor.check = undefined;
        actor.bubble?.destroy();
        actor.bubble = undefined;
        actor.state = "idle";
      });
    }

    runDojo() {
      if (this.running) {
        return;
      }

      this.resetDojo();
      this.running = true;

      this.tweens.add({
        alpha: 1,
        duration: 520,
        ease: "Back.Out",
        scale: 1.16,
        targets: this.scroll,
        yoyo: true
      });

      timeline.forEach((step) => {
        this.runEvents.push(
          this.time.delayedCall(step.at, () => {
            this.walkActor(step.agent, step.duration, step.effect);
          })
        );
      });

      this.runEvents.push(
        this.time.delayedCall(15000, () => {
          this.finishRun();
        })
      );
    }

    showSpeech(id: AgentId) {
      const actor = this.actorMap.get(id);

      if (!actor) {
        return;
      }

      const message =
        actor.state === "walking"
          ? "On my way."
          : actor.state === "working"
            ? actor.busy
            : actor.state === "done"
              ? actor.done
              : "Waiting for the scroll.";

      actor.bubble?.destroy();
      actor.bubble = this.createSpeechBubble(actor, message);
      this.time.delayedCall(3000, () => {
        actor.bubble?.destroy();
        actor.bubble = undefined;
      });
    }

    private createAnimations() {
      actors.forEach((actor) => {
        const key = `${actor.file}-walk-cycle`;

        if (this.anims.exists(key)) {
          return;
        }

        this.anims.create({
          frameRate: 8,
          frames: this.anims.generateFrameNumbers(`${actor.file}-walk`, {
            end: 3,
            start: 0
          }),
          key,
          repeat: -1
        });
      });
    }

    private createActors() {
      actors.forEach((config) => {
        const home = toPoint(config.home);
        const container = this.add.container(home.x, home.y).setDepth(Math.round(home.y));
        const shadow = this.add.ellipse(0, 60, 70, 18, 0x000000, 0.42);
        const sprite = this.add
          .sprite(0, 0, `${config.file}-idle`)
          .setDisplaySize(122, 142);
        const labelBg = this.add
          .rectangle(0, 86, 176, 34, 0x050505, 0.8)
          .setStrokeStyle(1, 0xf6e7b1, 0.35);
        const label = this.add
          .text(0, 86, `${config.id.toUpperCase()} / ${config.role}`, {
            color: "#f6e7b1",
            fontFamily: "monospace",
            fontSize: "20px",
            fontStyle: "bold",
            resolution: 2
          })
          .setOrigin(0.5);

        container.add([shadow, sprite, labelBg, label]);
        container.setSize(176, 184).setInteractive({ cursor: "pointer" });
        container.on("pointerdown", () => this.showSpeech(config.id));

        this.tweens.add({
          duration: 2200 + Math.random() * 800,
          ease: "Sine.InOut",
          repeat: -1,
          targets: sprite,
          y: -4,
          yoyo: true
        });

        this.actorMap.set(config.id, {
          ...config,
          container,
          label,
          shadow,
          sprite,
          state: "idle"
        });
      });
    }

    private createPetals() {
      [120, 330, 650, 920, 1120].forEach((x, index) => {
        const petal = this.add
          .image(x, -40 - index * 95, "petal")
          .setDisplaySize(20 - (index % 2) * 4, 20 - (index % 2) * 4)
          .setAlpha(0.72)
          .setDepth(6);

        this.tweens.add({
          angle: 360,
          duration: 9000 + index * 650,
          repeat: -1,
          targets: petal,
          x: x + (index % 2 === 0 ? 80 : -70),
          y: sceneSize.height + 70
        });
      });
    }

    private createSpeechBubble(actor: ActorRuntime, message: string) {
      const bubble = this.add.container(0, -94).setDepth(20);
      const text = this.add
        .text(0, 0, message, {
          align: "center",
          color: "#ffffff",
          fontFamily: "monospace",
          fontSize: "22px",
          fontStyle: "bold",
          resolution: 2,
          wordWrap: { width: 190 }
        })
        .setOrigin(0.5);
      const bounds = text.getBounds();
      const background = this.add
        .rectangle(0, 0, bounds.width + 22, bounds.height + 16, 0x050505, 0.84)
        .setStrokeStyle(1, 0xf6e7b1, 0.42);

      bubble.add([background, text]);
      actor.container.add(bubble);

      return bubble;
    }

    private drawPath(actor: ActorRuntime) {
      const home = toPoint(actor.home);
      const work = toPoint(actor.work);
      const graphics = this.add.graphics().setDepth(2);
      graphics.lineStyle(2, 0xf6e7b1, 0.38);
      graphics.beginPath();
      graphics.moveTo(home.x, home.y);
      graphics.lineTo(work.x, work.y);
      graphics.strokePath();

      this.tweens.add({
        alpha: 0,
        duration: 1050,
        targets: graphics,
        onComplete: () => graphics.destroy()
      });
    }

    private finishPreviousWorkers() {
      this.actorMap.forEach((actor) => {
        if (actor.state === "working") {
          this.markDone(actor);
        }
      });
    }

    private finishRun() {
      this.running = false;
      this.actorMap.forEach((actor) => this.markDone(actor));
      this.tweens.add({
        alpha: 1,
        duration: 900,
        ease: "Sine.Out",
        scale: 1.42,
        targets: this.moon,
        yoyo: true
      });
      this.moon?.setTint(0xfff2b5);
      EventBus.emit("dojo-run-complete");
    }

    private markDone(actor: ActorRuntime) {
      actor.state = "done";
      actor.sprite.setTexture(`${actor.file}-idle`).setDisplaySize(122, 142);
      actor.sprite.stop?.();
      actor.label.setText(`${actor.id.toUpperCase()} / DONE`);
      actor.container.setDepth(Math.round(actor.container.y));
      actor.bubble?.destroy();
      actor.bubble = undefined;

      if (!actor.check) {
        actor.check = this.add
          .text(40, -46, "✓", {
            backgroundColor: "#166534",
            color: "#f6e7b1",
            fontFamily: "monospace",
            fontSize: "26px",
            fontStyle: "bold",
            padding: { bottom: 4, left: 7, right: 7, top: 4 },
            resolution: 2
          })
          .setOrigin(0.5);
        actor.container.add(actor.check);
      }
    }

    private walkActor(id: AgentId, duration: number, effect: string) {
      const actor = this.actorMap.get(id);

      if (!actor) {
        return;
      }

      this.finishPreviousWorkers();
      actor.state = "walking";
      actor.bubble?.destroy();
      actor.bubble = undefined;
      actor.label.setText(`${actor.id.toUpperCase()} / ${actor.role}`);
      actor.sprite
        .setTexture(`${actor.file}-walk`)
        .setDisplaySize(122, 156)
        .play(`${actor.file}-walk-cycle`);
      actor.sprite.setFlipX(actor.work.x < actor.home.x);
      actor.container.setDepth(30);
      this.drawPath(actor);

      const work = toPoint(actor.work);
      this.tweens.add({
        duration,
        ease: effect === "attack" ? "Quad.InOut" : "Sine.InOut",
        targets: actor.container,
        x: work.x,
        y: work.y,
        onComplete: () => {
          actor.state = "working";
          actor.sprite.setTexture(`${actor.file}-idle`).setDisplaySize(122, 142);
          actor.sprite.stop?.();
          actor.container.setDepth(Math.round(work.y));
          this.showSpeech(id);

          if (effect === "attack") {
            this.playSlash();
          }

          if (effect === "judge") {
            this.tweens.add({
              duration: 320,
              targets: actor.container,
              y: work.y - 18,
              yoyo: true
            });
          }
        }
      });

      if (effect === "attack") {
        this.tweens.add({
          angle: 4,
          duration: 90,
          repeat: 6,
          targets: actor.container,
          yoyo: true
        });
      }
    }

    private playSlash() {
      this.slash?.setAlpha(0).setScale(0.72);
      this.tweens.add({
        alpha: { from: 0, to: 1 },
        duration: 180,
        ease: "Quad.Out",
        scale: 1.18,
        targets: this.slash,
        yoyo: true,
        onComplete: () => this.slash?.setAlpha(0)
      });
    }
  };
}
