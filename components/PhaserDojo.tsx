"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import { createDojoScene, type DojoSceneController } from "@/game/DojoScene";
import { EventBus } from "@/game/events";

export type PhaserDojoHandle = {
  resetDojo: () => void;
  runDojo: () => void;
};

type PhaserDojoProps = {
  boardTitle: string;
  complete: boolean;
  onComplete?: () => void;
  onReady?: () => void;
  running: boolean;
};

export const PhaserDojo = forwardRef<PhaserDojoHandle, PhaserDojoProps>(
  function PhaserDojo({ boardTitle, complete, onComplete, onReady, running }, ref) {
    const gameRef = useRef<any>(undefined);
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<DojoSceneController | undefined>(undefined);
    const [ready, setReady] = useState(false);

    useImperativeHandle(ref, () => ({
      resetDojo() {
        sceneRef.current?.resetDojo();
      },
      runDojo() {
        sceneRef.current?.runDojo();
      }
    }));

    useEffect(() => {
      let cancelled = false;
      let cleanupReady = () => {};
      let cleanupComplete = () => {};

      async function bootGame() {
        if (!mountRef.current || gameRef.current) {
          return;
        }

        const PhaserModule = await import("phaser");
        const Phaser = (PhaserModule.default ?? PhaserModule) as any;
        const DojoScene = createDojoScene(Phaser);

        cleanupReady = EventBus.on<DojoSceneController>("dojo-scene-ready", (scene) => {
          sceneRef.current = scene;
          setReady(true);
          onReady?.();
        });
        cleanupComplete = EventBus.on("dojo-run-complete", () => {
          onComplete?.();
        });

        if (cancelled || !mountRef.current) {
          cleanupReady();
          cleanupComplete();
          return;
        }

        gameRef.current = new Phaser.Game({
          backgroundColor: "#070403",
          parent: mountRef.current,
          pixelArt: true,
          render: {
            antialias: false,
            roundPixels: true
          },
          scale: {
            autoCenter: Phaser.Scale.CENTER_BOTH,
            mode: Phaser.Scale.FIT
          },
          scene: [DojoScene],
          type: Phaser.AUTO,
          width: 1280,
          height: 720
        });
      }

      bootGame();

      return () => {
        cancelled = true;
        cleanupReady();
        cleanupComplete();
        sceneRef.current = undefined;
        gameRef.current?.destroy(true);
        gameRef.current = undefined;
      };
    }, [onComplete, onReady]);

    return (
      <div
        className="rpg-board phaser-dojo"
        data-complete={complete}
        data-ready={ready}
        data-running={running}
      >
        <div className="phaser-dojo__mount" ref={mountRef} />
        <div className="rpg-board__status">
          <strong>{ready ? boardTitle : "Opening dojo..."}</strong>
          <span>
            {complete
              ? "Moonrise: shipped."
              : "Scroll → Plan → Build → Attack → Review → Deploy → Judge → Moonrise"}
          </span>
        </div>
      </div>
    );
  }
);
