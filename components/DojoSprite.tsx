"use client";

import type { CSSProperties } from "react";

type SpriteEffect = "idle" | "plan" | "build" | "attack" | "review" | "deploy" | "judge";
type ActorState = "idle" | "walking" | "working" | "done";
type Facing = "left" | "right";
type Position = { x: number; y: number };

type DojoActor = {
  effect: SpriteEffect;
  facing: Facing;
  home: Position;
  id: string;
  name: string;
  position: Position;
  role: string;
  state: ActorState;
  work: Position;
};

type DojoSpriteProps = {
  actor: DojoActor;
  isActive: boolean;
  onSpeak: () => void;
  speech?: string;
};

const spriteFiles: Record<string, string> = {
  Maji: "maji.png",
  Meji: "meji.png",
  Meowts: "meowts.png",
  Miji: "miji.png",
  Moji: "moji.png",
  Muji: "muji.png"
};

const walkSpriteFiles: Record<string, string> = {
  Maji: "maji-walk.png",
  Meji: "meji-walk.png",
  Meowts: "meowts-walk.png",
  Miji: "miji-walk.png",
  Moji: "moji-walk.png",
  Muji: "muji-walk.png"
};

export function DojoSprite({
  actor,
  isActive,
  onSpeak,
  speech
}: DojoSpriteProps) {
  const fileName = spriteFiles[actor.name] ?? "moji.png";
  const walkFileName = walkSpriteFiles[actor.name] ?? "moji-walk.png";
  const isComplete = actor.state === "done";
  const isWalking = actor.state === "walking";

  return (
    <button
      aria-label={`${actor.name} ${actor.role} ${actor.state}`}
      className="rpg-sprite"
      data-active={isActive}
      data-complete={isComplete}
      data-effect={actor.effect}
      data-facing={actor.facing}
      data-state={actor.state}
      data-walking={isWalking}
      onClick={onSpeak}
      style={
        {
          "--sprite-x": `${actor.position.x}%`,
          "--sprite-y": `${actor.position.y}%`,
          "--walk-sheet": `url("/assets/dojo/${walkFileName}")`,
          left: `${actor.position.x}%`,
          top: `${actor.position.y}%`
        } as CSSProperties
      }
      type="button"
    >
      {speech ? <span className="rpg-sprite__speech">{speech}</span> : null}
      {isWalking ? (
        <span
          aria-label={`${actor.name} walking ${actor.role} ninja sprite`}
          className="rpg-sprite__walk"
          role="img"
        />
      ) : (
        <img
          alt={`${actor.name} ${actor.role} ninja sprite`}
          className="rpg-sprite__image"
          draggable={false}
          src={`/assets/dojo/${fileName}`}
        />
      )}
      <span className="rpg-sprite__shadow" />
      {speech ? null : (
        <span className="rpg-sprite__label">
          <strong>{actor.name.toUpperCase()}</strong>
          <em>{actor.role}</em>
        </span>
      )}
      {isComplete ? <span className="rpg-sprite__check">✓</span> : null}
    </button>
  );
}
