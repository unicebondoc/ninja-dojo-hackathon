import { linesFor, stageToAgentState } from "@/game/dialogue/lines";
import { EventBus } from "@/game/events";
import {
  RunStateMachine,
  type AgentId,
  type RunStage,
  type RunStageEvent
} from "@/game/run/RunStateMachine";
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  TILE_SIZE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  dojoGrid,
  stations,
  tileToWorld
} from "@/game/world/tilemap";

type ActorState = "idle" | "walking" | "working" | "done";

type WorldPoint = {
  x: number;
  y: number;
};

type ActorRuntime = {
  bubble?: any;
  container: any;
  file: string;
  homeX: number;
  homeY: number;
  id: AgentId;
  nameplate?: any;
  nameplateTimer?: any;
  patrolTimer?: any;
  pointer?: any;
  role: string;
  shadow: any;
  sprite: any;
  state: ActorState;
  workX: number;
  workY: number;
};

export type DojoSceneController = {
  resetDojo: () => void;
  runDojo: () => void;
  showSpeech: (id: AgentId) => void;
};

const SAVE_KEY = "ninja-dojo:save";

const agentMeta: Record<AgentId, { busy: string; done: string; file: string; role: string }> = {
  Maji: { busy: "Attack path ready.", done: "Attack complete.", file: "maji", role: "Attack" },
  Meji: { busy: "Reviewing the scroll.", done: "Review complete.", file: "meji", role: "Review" },
  Meowts: { busy: "Judging under moonlight.", done: "Approved.", file: "meowts", role: "Judge" },
  Miji: { busy: "Building the first pass.", done: "Build complete.", file: "miji", role: "Build" },
  Moji: { busy: "Mapping the scroll route.", done: "Plan complete.", file: "moji", role: "Plan" },
  Muji: { busy: "Deploy route is clear.", done: "Deploy complete.", file: "muji", role: "Deploy" }
};

const actorDisplay = {
  height: 124,
  shadowHeight: 8,
  shadowOffsetY: 54,
  shadowWidth: 42,
  walkHeight: 236,
  walkWidth: 96,
  width: 100
};

const workTiles: Record<AgentId, { tileX: number; tileY: number }> = {
  Maji: { tileX: 23, tileY: 10 },
  Meji: { tileX: 24, tileY: 14 },
  Meowts: { tileX: 29, tileY: 9 },
  Miji: { tileX: 16, tileY: 13 },
  Moji: { tileX: 18, tileY: 11 },
  Muji: { tileX: 20, tileY: 15 }
};

const patrolTiles: Record<AgentId, Array<{ tileX: number; tileY: number }>> = {
  Maji: [
    { tileX: 23, tileY: 8 },
    { tileX: 27, tileY: 10 },
    { tileX: 25, tileY: 13 }
  ],
  Meji: [
    { tileX: 27, tileY: 13 },
    { tileX: 30, tileY: 11 },
    { tileX: 25, tileY: 15 }
  ],
  Meowts: [
    { tileX: 30, tileY: 14 },
    { tileX: 32, tileY: 12 },
    { tileX: 28, tileY: 16 }
  ],
  Miji: [
    { tileX: 13, tileY: 9 },
    { tileX: 16, tileY: 12 },
    { tileX: 19, tileY: 13 }
  ],
  Moji: [
    { tileX: 8, tileY: 9 },
    { tileX: 11, tileY: 12 },
    { tileX: 15, tileY: 10 }
  ],
  Muji: [
    { tileX: 18, tileY: 15 },
    { tileX: 21, tileY: 16 },
    { tileX: 23, tileY: 14 }
  ]
};

const stageRoutes: Record<AgentId, Array<{ tileX: number; tileY: number }>> = {
  Maji: [
    { tileX: 27, tileY: 8 },
    { tileX: 25, tileY: 10 },
    { tileX: 23, tileY: 10 }
  ],
  Meji: [
    { tileX: 30, tileY: 12 },
    { tileX: 27, tileY: 14 },
    { tileX: 24, tileY: 14 }
  ],
  Meowts: [
    { tileX: 31, tileY: 12 },
    { tileX: 30, tileY: 10 },
    { tileX: 29, tileY: 9 }
  ],
  Miji: [
    { tileX: 14, tileY: 9 },
    { tileX: 16, tileY: 11 },
    { tileX: 16, tileY: 13 }
  ],
  Moji: [
    { tileX: 9, tileY: 8 },
    { tileX: 14, tileY: 10 },
    { tileX: 18, tileY: 11 }
  ],
  Muji: [
    { tileX: 20, tileY: 13 },
    { tileX: 20, tileY: 15 }
  ]
};

const stageReplies: Partial<Record<RunStage, { from?: AgentId; line?: string }>> = {
  attack: {
    from: "Miji",
    line: "Patch fast. Keep the page standing."
  },
  build: {
    from: "Moji",
    line: "Plan is clean. Miji, take the forge."
  },
  deploy: {
    from: "Meji",
    line: "Muji, prove the moon deserves to rise."
  },
  judge: {
    from: "Muji",
    line: "Checks are green. Your turn, Meowts."
  },
  review: {
    from: "Maji",
    line: "Found the cracks. Meji, read the scars."
  }
};

function loadSave(): { runsCompleted: number } {
  if (typeof window === "undefined") return { runsCompleted: 0 };
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : { runsCompleted: 0 };
  } catch {
    return { runsCompleted: 0 };
  }
}

function persistSave(save: { runsCompleted: number }) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Ignore localStorage failures in private browsing or locked-down iframes.
  }
}

function tilePoint(tileX: number, tileY: number): WorldPoint {
  return tileToWorld(tileX, tileY);
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function createDojoScene(Phaser: any) {
  return class DojoScene extends Phaser.Scene implements DojoSceneController {
    private actorMap = new Map<AgentId, ActorRuntime>();
    private moon?: any;
    private moonBeam?: any;
    private moonGlow?: any;
    private nightOverlay?: any;
    private runMachine?: RunStateMachine;
    private save = loadSave();
    private eventCleanups: Array<() => void> = [];
    private shippedStamp?: any;
    private scroll?: any;
    private slash?: any;
    private stageWash?: any;
    private wallsGroup?: any;

    constructor() {
      super("DojoScene");
    }

    preload() {
      this.load.image("dojo-background", "/assets/dojo/dojo-background.png");
      this.load.image("scroll", "/assets/dojo/scroll.png");
      this.load.image("moon", "/assets/dojo/moon.png");
      this.load.image("slash", "/assets/dojo/slash.png");
      this.load.image("petal", "/assets/dojo/petal.png");
      this.load.image("ninja-pointer", "/cursors/ninja-pointer.png");

      (Object.keys(agentMeta) as AgentId[]).forEach((id) => {
        const file = agentMeta[id].file;
        this.load.image(`${file}-idle`, `/assets/dojo/${file}.png`);
        this.load.spritesheet(`${file}-walk`, `/assets/dojo/${file}-walk.png`, {
          frameHeight: 1024,
          frameWidth: 384
        });
      });
    }

    create() {
      this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.setBackgroundColor("#070403");

      this.add
        .image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, "dojo-background")
        .setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT)
        .setDepth(0);

      this.add
        .rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 0x000000, 0.16)
        .setDepth(1);

      this.buildWalls();
      this.createPetals();
      this.createWorldObjects();
      this.createAnimations();
      this.createActors();
      this.createNightOverlay();

      this.events.once("shutdown", () => this.cleanupRunEvents());
      this.events.once("destroy", () => this.cleanupRunEvents());

      this.runMachine = new RunStateMachine(this);
      this.subscribeToRunEvents();

      EventBus.emit("dojo-scene-ready", this);
      EventBus.emit("dojo-save", this.save);
    }

    update() {}

    runDojo() {
      if (!this.runMachine?.isRunning()) {
        this.resetActorsForRun({ startPatrol: false });
      }
      this.runMachine?.start();
    }

    resetDojo() {
      this.runMachine?.reset();
      this.resetActorsForRun({ startPatrol: true });
    }

    showSpeech(id: AgentId) {
      this.handleTalk(id);
    }

    private buildWalls() {
      this.wallsGroup = this.physics.add.staticGroup();
      const t = TILE_SIZE;

      [
        { h: t, w: WORLD_WIDTH, x: 0, y: 0 },
        { h: t, w: WORLD_WIDTH, x: 0, y: WORLD_HEIGHT - t },
        { h: WORLD_HEIGHT, w: t, x: 0, y: 0 },
        { h: WORLD_HEIGHT, w: t, x: WORLD_WIDTH - t, y: 0 }
      ].forEach((rect) => {
        const wall = this.add
          .rectangle(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h, 0x000000, 0)
          .setDepth(0);
        this.physics.add.existing(wall, true);
        this.wallsGroup.add(wall);
      });

      void dojoGrid;
      void MAP_WIDTH;
      void MAP_HEIGHT;
    }

    private createWorldObjects() {
      const scrollPos = tilePoint(20, 11);
      this.scroll = this.add
        .image(scrollPos.x, scrollPos.y, "scroll")
        .setDisplaySize(110, 110)
        .setAlpha(0)
        .setDepth(4);

      const moonPos = tilePoint(34, 4);
      this.moonBeam = this.add
        .polygon(moonPos.x - 42, moonPos.y + 36, [
          0, 0,
          -165, 320,
          190, 320,
          70, 0
        ], 0xfff2b5, 0.07)
        .setAlpha(0.22)
        .setBlendMode("ADD")
        .setDepth(3);

      this.moonGlow = this.add
        .ellipse(moonPos.x, moonPos.y, 190, 190, 0xfff2b5, 0.16)
        .setAlpha(0.2)
        .setBlendMode("ADD")
        .setDepth(3.1);

      this.moon = this.add
        .ellipse(moonPos.x, moonPos.y, 118, 118, 0x78f0d4, 0.18)
        .setAlpha(0)
        .setBlendMode("ADD")
        .setDepth(3.2);

      const slashPos = tilePoint(24, 9);
      this.slash = this.add
        .image(slashPos.x, slashPos.y, "slash")
        .setDisplaySize(320, 200)
        .setAlpha(0)
        .setDepth(800);
    }

    private createPetals() {
      [180, 460, 760, 1040].forEach((x, index) => {
        const petal = this.add
          .image(x, -40 - index * 80, "petal")
          .setDisplaySize(18, 18)
          .setAlpha(0.6)
          .setDepth(6);

        this.tweens.add({
          angle: 360,
          duration: 9000 + index * 700,
          repeat: -1,
          targets: petal,
          x: x + (index % 2 === 0 ? 80 : -70),
          y: WORLD_HEIGHT + 60
        });
      });
    }

    private createNightOverlay() {
      this.stageWash = this.add
        .rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0xf6e7b1, 1)
        .setOrigin(0)
        .setAlpha(0)
        .setBlendMode("ADD")
        .setDepth(2.4);

      this.nightOverlay = this.add
        .rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0x05060a, 0)
        .setOrigin(0)
        .setDepth(900);
    }

    private createAnimations() {
      [...new Set(Object.values(agentMeta).map((m) => m.file))].forEach((file) => {
        const key = `${file}-walk-cycle`;
        if (this.anims.exists(key)) return;
        this.anims.create({
          frameRate: 7,
          frames: this.anims.generateFrameNumbers(`${file}-walk`, {
            end: 3,
            start: 0
          }),
          key,
          repeat: -1
        });
      });
    }

    private createActors() {
      stations.forEach(({ agent, tileX, tileY }) => {
        const meta = agentMeta[agent];
        const home = tilePoint(tileX, tileY);
        const work = tilePoint(workTiles[agent].tileX, workTiles[agent].tileY);
        const container = this.add
          .container(home.x, home.y)
          .setDepth(Math.round(home.y));

        const shadow = this.add
          .ellipse(
            0,
            actorDisplay.shadowOffsetY,
            actorDisplay.shadowWidth,
            actorDisplay.shadowHeight,
            0x000000,
            0.42
          )
          .setDepth(-1);
        const sprite = this.add
          .sprite(0, 0, `${meta.file}-idle`)
          .setDisplaySize(actorDisplay.width, actorDisplay.height)
          .setInteractive({
            cursor: 'url("/cursors/ninja-pointer.png") 8 8, pointer'
          });

        container.add([shadow, sprite]);

        const actor: ActorRuntime = {
          container,
          file: meta.file,
          homeX: home.x,
          homeY: home.y,
          id: agent,
          role: meta.role,
          shadow,
          sprite,
          state: "idle",
          workX: work.x,
          workY: work.y
        };

        sprite.on("pointerover", () => {
          this.showNameplate(actor);
          this.showSpritePointer(actor);
        });
        sprite.on("pointerout", () => this.hideSpritePointer(actor));
        sprite.on("pointerdown", () => this.handleTalk(agent));

        this.actorMap.set(agent, actor);
        this.startIdleLoop(actor, randomBetween(800, 2600));
      });
    }

    private resetActorsForRun(options: { startPatrol: boolean }) {
      this.tweens.killTweensOf(this.nightOverlay);
      this.tweens.killTweensOf(this.stageWash);
      this.tweens.killTweensOf(this.scroll);
      this.scroll?.setAlpha(0).setDisplaySize(110, 110).setAngle(0).clearTint();
      this.shippedStamp?.destroy();
      this.shippedStamp = undefined;
      this.stageWash?.setAlpha(0);
      this.nightOverlay?.setAlpha(0);
      this.cameras.main.pan(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 450, "Sine.easeOut", true);
      this.cameras.main.zoomTo(1, 450, "Sine.easeOut", true);
      this.actorMap.forEach((actor) => {
        this.cancelActorTimers(actor);
        this.tweens.killTweensOf(actor.container);
        this.tweens.killTweensOf(actor.sprite);
        actor.container.setPosition(actor.homeX, actor.homeY);
        this.updateActorDepth(actor);
        actor.sprite
          .setTexture(`${actor.file}-idle`)
          .setDisplaySize(actorDisplay.width, actorDisplay.height)
          .clearTint()
          .setAlpha(1)
          .setFlipX(false);
        actor.sprite.stop?.();
        actor.bubble?.destroy();
        actor.bubble = undefined;
        actor.nameplate?.destroy();
        actor.nameplate = undefined;
        actor.pointer?.destroy();
        actor.pointer = undefined;
        actor.state = "idle";
        this.updateActorShadow(actor);
        if (options.startPatrol) {
          this.startIdleLoop(actor, randomBetween(800, 2600));
        }
      });
      this.moonBeam?.setAlpha(0.22).setScale(1);
      this.moonGlow?.setAlpha(0.2).setScale(1);
      this.moon?.setAlpha(0).setScale(1).setDisplaySize(118, 118);
      this.slash?.setAlpha(0);
    }

    private cancelActorTimers(actor: ActorRuntime) {
      actor.patrolTimer?.remove?.();
      actor.patrolTimer = undefined;
      actor.nameplateTimer?.remove?.();
      actor.nameplateTimer = undefined;
    }

    private startIdleLoop(actor: ActorRuntime, delay = randomBetween(1600, 4200)) {
      actor.patrolTimer?.remove?.();
      actor.patrolTimer = this.time.delayedCall(delay, () => {
        if (this.runMachine?.isRunning() || actor.state !== "idle") {
          this.startIdleLoop(actor, randomBetween(1400, 3200));
          return;
        }

        if (Math.random() < 0.68) {
          const target = this.randomPatrolPoint(actor.id);
          this.moveActor(actor, target, {
            duration: randomBetween(1700, 3100),
            onComplete: () => this.startIdleLoop(actor, randomBetween(1000, 2800)),
            stateAfter: "idle"
          });
        } else {
          if (Math.random() < 0.5) actor.sprite.setFlipX(!actor.sprite.flipX);
          if (Math.random() < 0.45) this.showFloatingBubble(actor, linesFor(actor.id, "idle")[0]);
          this.startIdleLoop(actor, randomBetween(1800, 4300));
        }
      });
    }

    private randomPatrolPoint(id: AgentId) {
      const points = patrolTiles[id];
      const chosen = points[Math.floor(Math.random() * points.length)];
      const base = tilePoint(chosen.tileX, chosen.tileY);
      return {
        x: base.x + randomBetween(-8, 8),
        y: base.y + randomBetween(-6, 6)
      };
    }

    private handleTalk(id: AgentId) {
      const actor = this.actorMap.get(id);
      if (!actor) return;

      const agentState = mapActorState(actor.state);
      const lines = linesFor(id, agentState);
      const text = lines[Math.floor(Math.random() * lines.length)];

      this.showNameplate(actor);
      this.showFloatingBubble(actor, text);
      this.playTaskPulse(actor, 0xf6e7b1);
    }

    private subscribeToRunEvents() {
      this.cleanupRunEvents();
      this.eventCleanups = [
        EventBus.on<RunStageEvent>("run-stage", (event) => {
          if (!event) return;
          this.handleStageEvent(event);
        }),
        EventBus.on("run-completed", () => {
          this.save = { runsCompleted: this.save.runsCompleted + 1 };
          persistSave(this.save);
          EventBus.emit("dojo-save", this.save);
          this.tweens.add({
            alpha: 1,
            displayHeight: 146,
            displayWidth: 146,
            duration: 900,
            ease: "Sine.Out",
            targets: this.moon,
            yoyo: true
          });
          this.tweens.add({
            alpha: 0.82,
            duration: 900,
            ease: "Sine.Out",
            scaleX: 1.18,
            scaleY: 1.08,
            targets: this.moonBeam
          });
          this.tweens.add({
            alpha: 0.68,
            duration: 900,
            ease: "Sine.Out",
            scale: 1.45,
            targets: this.moonGlow
          });
          this.playMoonrisePetals();
          this.showShippedStamp();
          this.cameras.main.pan(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 900, "Sine.easeOut", true);
          this.cameras.main.zoomTo(1, 900, "Sine.easeOut", true);
        }),
        EventBus.on("run-reset", () => {
          this.actorMap.forEach((actor) => (actor.state = "idle"));
        })
      ];
    }

    private cleanupRunEvents() {
      this.runMachine?.dispose();
      this.eventCleanups.forEach((off) => off());
      this.eventCleanups = [];
      this.actorMap.forEach((actor) => this.cancelActorTimers(actor));
    }

    private handleStageEvent(event: RunStageEvent) {
      this.tintNightForStage(event.stage);
      this.setStageLighting(event.stage);

      if (!event.agent) {
        if (event.stage === "idle") {
          this.actorMap.forEach((actor) => {
            actor.patrolTimer?.remove?.();
            actor.patrolTimer = undefined;
          });
          this.revealScroll();
        }
        if (event.stage === "moonrise") {
          this.actorMap.forEach((actor) => this.markDone(actor));
        }
        return;
      }

      this.finishPreviousWorkers(event.agent);
      if (event.stage === "build") {
        this.fadeScrollToFloor();
      }
      const actor = this.actorMap.get(event.agent);
      if (!actor) return;

      const agentState = stageToAgentState(event.stage, event.agent);
      const linesPool = linesFor(event.agent, agentState);
      const message = linesPool[0] ?? agentMeta[event.agent].busy;
      const delay = randomBetween(180, 720);

      this.time.delayedCall(delay, () => {
        this.walkActorToWork(actor, event.stage);
        this.showFloatingBubble(actor, message);
        this.playTaskPulse(actor, event.stage === "attack" ? 0xdc2626 : 0xf6e7b1);
        this.focusCamera(actor);
        if (event.stage === "attack") {
          this.cameras.main.shake(260, 0.006);
        }
      });

      const reply = stageReplies[event.stage];
      if (reply?.from && reply.line) {
        const replyActor = this.actorMap.get(reply.from);
        if (replyActor) {
          this.time.delayedCall(delay + 1200, () => {
            this.showFloatingBubble(replyActor, reply.line ?? "");
            this.playTaskPulse(replyActor, 0xf6e7b1);
          });
        }
      }
    }

    private walkActorToWork(actor: ActorRuntime, stage: RunStage) {
      actor.patrolTimer?.remove?.();
      const route = stageRoutes[actor.id].map(({ tileX, tileY }) =>
        tilePoint(tileX, tileY)
      );
      const finalPoint = route.at(-1);
      if (!finalPoint || finalPoint.x !== actor.workX || finalPoint.y !== actor.workY) {
        route.push({ x: actor.workX, y: actor.workY });
      }

      this.moveActorAlongPath(actor, route, {
        duration: stage === "attack" ? 1800 : 2600,
        onComplete: () => {
          if (stage === "attack") this.playSlash();
          if (stage === "judge") {
            this.tweens.add({
              duration: 320,
              targets: actor.container,
              y: actor.workY - 18,
              yoyo: true,
              onUpdate: () => this.updateActorDepth(actor)
            });
          }
        },
        stage,
        stateAfter: "working"
      });
    }

    private moveActorAlongPath(
      actor: ActorRuntime,
      path: WorldPoint[],
      options: {
        duration: number;
        onComplete?: () => void;
        stage?: RunStage;
        stateAfter: ActorState;
      }
    ) {
      const points = path.filter((point) => {
        const dx = Math.abs(point.x - actor.container.x);
        const dy = Math.abs(point.y - actor.container.y);
        return dx > 2 || dy > 2;
      });

      if (points.length === 0) {
        actor.state = options.stateAfter;
        options.onComplete?.();
        return;
      }

      const distances = points.map((point, index) => {
        const start = index === 0 ? actor.container : points[index - 1];
        return Phaser.Math.Distance.Between(start.x, start.y, point.x, point.y);
      });
      const totalDistance = distances.reduce((sum, distance) => sum + distance, 0);
      const minSegmentDuration = options.stage === "attack" ? 320 : 420;

      actor.state = "walking";
      actor.sprite
        .setTexture(`${actor.file}-walk`)
        .setDisplaySize(actorDisplay.walkWidth, actorDisplay.walkHeight)
        .play(`${actor.file}-walk-cycle`);
      this.updateActorShadow(actor);
      this.updateActorDepth(actor);
      this.tweens.killTweensOf(actor.container);

      const walkSegment = (index: number) => {
        const target = points[index];
        if (!target) {
          actor.state = options.stateAfter;
          actor.sprite
            .setTexture(`${actor.file}-idle`)
            .setDisplaySize(actorDisplay.width, actorDisplay.height);
          actor.sprite.stop?.();
          this.updateActorShadow(actor);
          this.updateActorDepth(actor);
          options.onComplete?.();
          return;
        }

        actor.sprite.setFlipX(target.x < actor.container.x);
        const segmentDuration = Math.max(
          minSegmentDuration,
          totalDistance > 0
            ? (distances[index] / totalDistance) * options.duration
            : options.duration / points.length
        );

        this.tweens.add({
          duration: segmentDuration,
          ease: options.stage === "attack" ? "Quad.InOut" : "Sine.InOut",
          targets: actor.container,
          x: target.x,
          y: target.y,
          onComplete: () => walkSegment(index + 1),
          onUpdate: () => this.updateActorDepth(actor)
        });
      };

      walkSegment(0);
    }

    private moveActor(
      actor: ActorRuntime,
      target: WorldPoint,
      options: {
        duration: number;
        onComplete?: () => void;
        stage?: RunStage;
        stateAfter: ActorState;
      }
    ) {
      actor.state = "walking";
      actor.sprite
        .setTexture(`${actor.file}-walk`)
        .setDisplaySize(actorDisplay.walkWidth, actorDisplay.walkHeight)
        .play(`${actor.file}-walk-cycle`);
      this.updateActorShadow(actor);
      actor.sprite.setFlipX(target.x < actor.container.x);
      this.updateActorDepth(actor);

      this.tweens.killTweensOf(actor.container);
      this.tweens.add({
        duration: options.duration,
        ease: options.stage === "attack" ? "Quad.InOut" : "Sine.InOut",
        targets: actor.container,
        x: target.x,
        y: target.y,
        onComplete: () => {
          actor.state = options.stateAfter;
          actor.sprite
            .setTexture(`${actor.file}-idle`)
            .setDisplaySize(actorDisplay.width, actorDisplay.height);
          actor.sprite.stop?.();
          this.updateActorShadow(actor);
          this.updateActorDepth(actor);
          options.onComplete?.();
        },
        onUpdate: () => this.updateActorDepth(actor)
      });
    }

    private revealScroll() {
      const scrollPos = tilePoint(20, 11);
      const startPos = tilePoint(33, 2);
      this.scroll
        ?.setPosition(startPos.x, startPos.y)
        .setAlpha(0)
        .setAngle(-24)
        .setDisplaySize(84, 84)
        .setTint(0xfff2b5);
      this.tweens.add({
        alpha: 0.95,
        displayHeight: 138,
        displayWidth: 138,
        duration: 1500,
        ease: "Cubic.Out",
        targets: this.scroll,
        angle: 0,
        x: scrollPos.x,
        y: scrollPos.y,
        onComplete: () => {
          this.tweens.add({
            duration: 360,
            ease: "Sine.InOut",
            targets: this.scroll,
            y: scrollPos.y - 8,
            yoyo: true
          });
        }
      });
    }

    private fadeScrollToFloor() {
      if (!this.scroll) return;
      this.tweens.killTweensOf(this.scroll);
      this.tweens.add({
        alpha: 0.18,
        displayHeight: 96,
        displayWidth: 96,
        duration: 520,
        ease: "Sine.Out",
        targets: this.scroll
      });
    }

    private finishPreviousWorkers(except: AgentId) {
      this.actorMap.forEach((actor, id) => {
        if (id === except) return;
        if (actor.state === "working" || actor.state === "walking") {
          this.markDone(actor);
        }
      });
    }

    private markDone(actor: ActorRuntime) {
      actor.state = "done";
      actor.sprite
        .setTexture(`${actor.file}-idle`)
        .setDisplaySize(actorDisplay.width, actorDisplay.height);
      actor.sprite.stop?.();
      this.updateActorShadow(actor);
      this.updateActorDepth(actor);
    }

    private showNameplate(actor: ActorRuntime) {
      actor.nameplate?.destroy();
      actor.nameplateTimer?.remove?.();

      const plate = this.add.container(0, 70).setDepth(710);
      const text = this.add
        .text(0, 0, `${actor.id} / ${actor.role}`, {
          color: "#fff7d6",
          fontFamily: "monospace",
          fontSize: "17px",
          fontStyle: "bold",
          resolution: 2
        })
        .setOrigin(0.5);
      const bounds = text.getBounds();
      const bg = this.add
        .rectangle(0, 0, bounds.width + 26, bounds.height + 14, 0x050505, 0.94)
        .setStrokeStyle(2, 0xf6e7b1, 0.7);
      plate.add([bg, text]);
      actor.container.add(plate);
      actor.nameplate = plate;

      actor.nameplateTimer = this.time.delayedCall(1600, () => {
        if (actor.nameplate === plate) {
          plate.destroy();
          actor.nameplate = undefined;
        }
      });
    }

    private showSpritePointer(actor: ActorRuntime) {
      actor.pointer?.destroy();
      const pointer = this.add
        .image(0, -78, "ninja-pointer")
        .setDisplaySize(34, 34)
        .setAlpha(0.96)
        .setDepth(715);
      actor.container.add(pointer);
      actor.pointer = pointer;
      this.tweens.add({
        duration: 760,
        ease: "Sine.InOut",
        repeat: -1,
        targets: pointer,
        y: -86,
        yoyo: true
      });
    }

    private hideSpritePointer(actor: ActorRuntime) {
      if (!actor.pointer) return;
      const pointer = actor.pointer;
      actor.pointer = undefined;
      this.tweens.killTweensOf(pointer);
      this.tweens.add({
        alpha: 0,
        duration: 140,
        ease: "Sine.Out",
        targets: pointer,
        onComplete: () => pointer.destroy()
      });
    }

    private showFloatingBubble(actor: ActorRuntime, message: string) {
      actor.bubble?.destroy();
      const bubble = this.add.container(0, -96).setDepth(720);
      const text = this.add
        .text(0, 0, message, {
          align: "center",
          color: "#ffffff",
          fontFamily: "monospace",
          fontSize: "20px",
          fontStyle: "bold",
          resolution: 2,
          wordWrap: { width: 300 }
        })
        .setOrigin(0.5);
      const bounds = text.getBounds();
      const bg = this.add
        .rectangle(0, 0, bounds.width + 34, bounds.height + 24, 0x050505, 0.96)
        .setStrokeStyle(3, 0xf6e7b1, 0.82);
      bubble.add([bg, text]);
      actor.container.add(bubble);
      actor.bubble = bubble;

      this.time.delayedCall(2800, () => {
        if (actor.bubble === bubble) {
          bubble.destroy();
          actor.bubble = undefined;
        }
      });
    }

    private playTaskPulse(actor: ActorRuntime, color: number) {
      const ring = this.add
        .ellipse(0, 42, 70, 18, color, 0.16)
        .setStrokeStyle(2, color, 0.55)
        .setDepth(1);
      actor.container.addAt(ring, 0);
      this.tweens.add({
        alpha: 0,
        duration: 650,
        ease: "Sine.Out",
        scaleX: 1.75,
        scaleY: 1.75,
        targets: ring,
        onComplete: () => ring.destroy()
      });
    }

    private playSlash() {
      this.slash?.setAlpha(0).setDisplaySize(240, 150);
      this.tweens.add({
        alpha: { from: 0, to: 1 },
        displayHeight: 220,
        displayWidth: 350,
        duration: 180,
        ease: "Quad.Out",
        onComplete: () => this.slash?.setAlpha(0),
        targets: this.slash,
        yoyo: true
      });
    }

    private focusCamera(actor: ActorRuntime) {
      this.cameras.main.pan(actor.container.x, actor.container.y, 700, "Sine.easeInOut", true);
      this.cameras.main.zoomTo(1.045, 700, "Sine.easeInOut", true);
    }

    private playMoonrisePetals() {
      const moonPos = tilePoint(34, 4);
      Array.from({ length: 14 }, (_, index) => {
        const petal = this.add
          .image(moonPos.x + randomBetween(-90, 35), moonPos.y + randomBetween(12, 95), "petal")
          .setDisplaySize(14 + randomBetween(0, 10), 14 + randomBetween(0, 10))
          .setAlpha(0.8)
          .setDepth(805);

        this.tweens.add({
          alpha: 0,
          angle: randomBetween(-180, 240),
          delay: index * 55,
          duration: 1600 + randomBetween(0, 700),
          ease: "Sine.Out",
          targets: petal,
          x: moonPos.x + randomBetween(-20, 75),
          y: moonPos.y - randomBetween(20, 120),
          onComplete: () => petal.destroy()
        });
      });
    }

    private showShippedStamp() {
      this.shippedStamp?.destroy();
      const stamp = this.add.container(WORLD_WIDTH / 2, WORLD_HEIGHT / 2 + 16).setDepth(820);
      const bg = this.add
        .rectangle(0, 0, 292, 82, 0x2a0505, 0.82)
        .setStrokeStyle(4, 0xdc2626, 0.95)
        .setAngle(-7);
      const text = this.add
        .text(0, 0, "SHIPPED", {
          color: "#fff3d0",
          fontFamily: "monospace",
          fontSize: "42px",
          fontStyle: "bold",
          letterSpacing: 2,
          resolution: 2
        })
        .setOrigin(0.5)
        .setAngle(-7);
      stamp.add([bg, text]);
      stamp.setAlpha(0).setScale(1.6);
      this.shippedStamp = stamp;

      this.tweens.add({
        alpha: 1,
        duration: 520,
        ease: "Back.Out",
        scale: 1,
        targets: stamp
      });
    }

    private updateActorDepth(actor: ActorRuntime) {
      actor.container.setDepth(Math.round(actor.container.y));
    }

    private updateActorShadow(actor: ActorRuntime) {
      actor.shadow
        ?.setPosition(0, actorDisplay.shadowOffsetY)
        .setDisplaySize(actorDisplay.shadowWidth, actorDisplay.shadowHeight)
        .setAlpha(actor.state === "walking" ? 0.38 : 0.42);
    }

    private tintNightForStage(stage: RunStage) {
      if (!this.nightOverlay) return;
      const targets: Record<RunStage, number> = {
        attack: 0.16,
        build: 0.06,
        deploy: 0.28,
        idle: 0,
        judge: 0.38,
        moonrise: 0.05,
        plan: 0.03,
        review: 0.2
      };
      this.tweens.add({
        alpha: targets[stage],
        duration: 900,
        ease: "Sine.InOut",
        targets: this.nightOverlay
      });
    }

    private setStageLighting(stage: RunStage) {
      if (!this.stageWash) return;
      const lighting: Record<RunStage, { alpha: number; color: number }> = {
        attack: { alpha: 0.12, color: 0xdc2626 },
        build: { alpha: 0.1, color: 0xb91c1c },
        deploy: { alpha: 0.14, color: 0x67e8f9 },
        idle: { alpha: 0, color: 0xf6e7b1 },
        judge: { alpha: 0.16, color: 0xf6e7b1 },
        moonrise: { alpha: 0.18, color: 0xfff2b5 },
        plan: { alpha: 0.08, color: 0xf6e7b1 },
        review: { alpha: 0.1, color: 0x93c5fd }
      };
      const next = lighting[stage];
      this.stageWash.setFillStyle(next.color, 1);
      this.tweens.add({
        alpha: next.alpha,
        duration: 700,
        ease: "Sine.InOut",
        targets: this.stageWash
      });
    }
  };
}

function mapActorState(state: ActorState): "idle" | "working" | "done" {
  if (state === "done") return "done";
  if (state === "walking" || state === "working") return "working";
  return "idle";
}
