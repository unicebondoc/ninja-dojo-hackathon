"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { DojoAgent, DojoDialogue } from "@/lib/types";

type ThreeDojoStageProps = {
  agents: DojoAgent[];
  isComplete: boolean;
  isRunning: boolean;
  latestLine?: DojoDialogue;
};

type AgentSceneState = {
  group: THREE.Group;
  home: THREE.Vector3;
  council: THREE.Vector3;
  shipped: THREE.Vector3;
  name: string;
};

const agentColors: Record<string, string> = {
  Moji: "#f6e7b1",
  Miji: "#dc2626",
  Renegade: "#fb923c",
  Sensei: "#99f6e4",
  Tester: "#93c5fd",
  Meowts: "#f9a8d4"
};

const positions = {
  home: {
    Moji: [-4.8, 0, -1.9],
    Miji: [-2.2, 0, 2.7],
    Renegade: [4.4, 0, -1.8],
    Sensei: [2.4, 0, 2.8],
    Tester: [-5.2, 0, 2.1],
    Meowts: [5.4, 0, 2.5]
  },
  council: {
    Moji: [-1.7, 0, -0.7],
    Miji: [-0.9, 0, 1.4],
    Renegade: [1.5, 0, -0.7],
    Sensei: [1.2, 0, 1.5],
    Tester: [-2.6, 0, 1.2],
    Meowts: [3.0, 0, 0.7]
  },
  shipped: {
    Moji: [-2.2, 0, -0.8],
    Miji: [-0.9, 0, 1.5],
    Renegade: [1.9, 0, -0.9],
    Sensei: [1.1, 0, 1.7],
    Tester: [-3.0, 0, 1.5],
    Meowts: [2.8, 0, -0.1]
  }
};

export function ThreeDojoStage({
  agents,
  isComplete,
  isRunning,
  latestLine
}: ThreeDojoStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ agents, isComplete, isRunning, latestLine });

  useEffect(() => {
    stateRef.current = { agents, isComplete, isRunning, latestLine };
  }, [agents, isComplete, isRunning, latestLine]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#080608", 8, 20);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
    camera.position.set(0, 7.6, 9.2);
    camera.lookAt(0, 0.7, 0);

    const keyLight = new THREE.DirectionalLight("#fff0c2", 2.3);
    keyLight.position.set(-3, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    scene.add(keyLight);

    const moonLight = new THREE.PointLight("#f6e7b1", 4.2, 16);
    moonLight.position.set(4.8, 4.8, -4.8);
    scene.add(moonLight);
    scene.add(new THREE.AmbientLight("#6b7280", 1.1));

    buildDojo(scene);

    const agentStates = agents.map((agent) => {
      const name = agent.name;
      const group =
        name === "Meowts"
          ? createCat(agentColors[name])
          : createAnimeNinja(agentColors[name], name);
      group.position.copy(toVector(positions.home, name));
      group.rotation.y = group.position.x > 0 ? -0.55 : 0.55;
      scene.add(group);

      return {
        group,
        home: toVector(positions.home, name),
        council: toVector(positions.council, name),
        shipped: toVector(positions.shipped, name),
        name
      };
    });

    const slash = createSlashEffect();
    const shurikenA = createShuriken();
    const shurikenB = createShuriken();
    scene.add(slash, shurikenA, shurikenB);

    const resize = () => {
      const bounds = shell.getBoundingClientRect();
      renderer.setSize(bounds.width, bounds.height, false);
      camera.aspect = bounds.width / Math.max(bounds.height, 1);
      camera.updateProjectionMatrix();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(shell);

    let frame = 0;
    let animationId = 0;
    const animate = () => {
      frame += 0.016;
      const current = stateRef.current;
      const speaker = current.latestLine?.speaker;
      const effect = getEffectForSpeaker(speaker);

      agentStates.forEach((agentState) => {
        const source = current.agents.find((agent) => agent.name === agentState.name);
        const isSpeaking = speaker === agentState.name;
        const isActive = source?.status === "working" || isSpeaking;
        const target = current.isComplete
          ? agentState.shipped
          : current.isRunning && (source?.status !== "idle" || isSpeaking)
            ? agentState.council
            : agentState.home;

        agentState.group.position.lerp(target, 0.045);
        agentState.group.rotation.y = THREE.MathUtils.lerp(
          agentState.group.rotation.y,
          agentState.group.position.x > 0 ? -0.62 : 0.62,
          0.08
        );
        agentState.group.position.y = isActive
          ? Math.sin(frame * 11 + agentState.home.x) * 0.08
          : Math.sin(frame * 2 + agentState.home.x) * 0.025;
        agentState.group.scale.setScalar(isSpeaking ? 1.13 : 1);
      });

      const pulse = (Math.sin(frame * 10) + 1) / 2;
      slash.visible = effect === "attack" || effect === "review" || effect === "judge";
      slash.position.set(Math.sin(frame * 5) * 0.4, 1.38 + pulse * 0.08, 0.15);
      slash.rotation.set(-0.24, 0.2, frame * 1.8);
      slash.scale.setScalar(1 + pulse * 0.35);

      const showShuriken = effect === "attack" || effect === "deploy";
      updateShuriken(shurikenA, frame, showShuriken, 0);
      updateShuriken(shurikenB, frame, showShuriken, 1.7);

      moonLight.intensity = current.isComplete ? 5.5 + pulse : 3.2;
      camera.position.x = Math.sin(frame * 0.35) * 0.2;
      camera.lookAt(0, 0.7, 0);
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      renderer.dispose();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach((item) => item.dispose());
        } else if (material) {
          material.dispose();
        }
      });
    };
  }, []);

  const effect = getEffectForSpeaker(latestLine?.speaker);

  return (
    <div className="three-dojo-shell mt-5" data-effect={effect} ref={shellRef}>
      <canvas aria-label="3D live ninja dojo scene" ref={canvasRef} />
      <div className="three-dojo-hud">
        <span>{isComplete ? "Moonrise victory" : isRunning ? "Live combat review" : "Awaiting scroll"}</span>
        <span>{effect === "idle" ? "Dojo calm" : `${effect} technique`}</span>
      </div>
      {latestLine ? (
        <div className="three-dialogue-card">
          <strong>{latestLine.speaker}</strong>
          <span>{latestLine.message}</span>
        </div>
      ) : null}
    </div>
  );
}

function buildDojo(scene: THREE.Scene) {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(13, 0.2, 8.2),
    new THREE.MeshStandardMaterial({ color: "#1f160e", roughness: 0.72 })
  );
  floor.receiveShadow = true;
  scene.add(floor);

  const matMaterial = new THREE.MeshStandardMaterial({
    color: "#8b6f2c",
    metalness: 0.05,
    roughness: 0.82
  });
  const mat = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.12, 4.2), matMaterial);
  mat.position.set(0, 0.1, 0.7);
  mat.receiveShadow = true;
  scene.add(mat);

  for (let x = -3; x <= 3; x += 1.5) {
    const seam = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.15, 4.25),
      new THREE.MeshStandardMaterial({ color: "#d9bd70", roughness: 0.8 })
    );
    seam.position.set(x, 0.22, 0.7);
    scene.add(seam);
  }

  for (let z = -1.1; z <= 2.6; z += 1.2) {
    const seam = new THREE.Mesh(
      new THREE.BoxGeometry(6.85, 0.15, 0.035),
      new THREE.MeshStandardMaterial({ color: "#d9bd70", roughness: 0.8 })
    );
    seam.position.set(0, 0.23, z);
    scene.add(seam);
  }

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(13, 4.2, 0.22),
    new THREE.MeshStandardMaterial({ color: "#211811", roughness: 0.9 })
  );
  backWall.position.set(0, 2.05, -4.05);
  scene.add(backWall);

  for (let i = -5; i <= 5; i += 2) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2.6, 0.08),
      new THREE.MeshStandardMaterial({
        color: i % 4 === 0 ? "#302216" : "#d8c68b",
        roughness: 0.78
      })
    );
    panel.position.set(i, 2.1, -3.9);
    scene.add(panel);
  }

  const beams = [
    [0, 0.45, -3.72, 13, 0.16, 0.18],
    [0, 3.45, -3.72, 13, 0.18, 0.2],
    [-6.1, 1.95, -3.65, 0.18, 3.2, 0.18],
    [6.1, 1.95, -3.65, 0.18, 3.2, 0.18]
  ];
  beams.forEach(([x, y, z, w, h, d]) => {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: "#3d1f13", roughness: 0.65 })
    );
    beam.position.set(x, y, z);
    scene.add(beam);
  });

  const scroll = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.16, 0.75),
    new THREE.MeshStandardMaterial({ color: "#ead28a", roughness: 0.75 })
  );
  scroll.position.set(0, 0.42, 0.55);
  scroll.castShadow = true;
  scene.add(scroll);

  const scrollMark = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.05, 0.055),
    new THREE.MeshStandardMaterial({ color: "#dc2626", emissive: "#5b0c0c" })
  );
  scrollMark.position.set(0, 0.53, 0.55);
  scene.add(scrollMark);

  addLantern(scene, -5.1, -3.65);
  addLantern(scene, 5.1, -3.65);
  addWeaponRack(scene, -4.8, -2.6);
  addWeaponRack(scene, 4.8, -2.6);
}

function addLantern(scene: THREE.Scene, x: number, z: number) {
  const lantern = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.58, 12),
    new THREE.MeshStandardMaterial({
      color: "#dc2626",
      emissive: "#dc2626",
      emissiveIntensity: 0.7
    })
  );
  lantern.position.set(x, 2.4, z);
  scene.add(lantern);

  const light = new THREE.PointLight("#dc2626", 2.2, 3.2);
  light.position.set(x, 2.25, z + 0.3);
  scene.add(light);
}

function addWeaponRack(scene: THREE.Scene, x: number, z: number) {
  const rack = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: "#3d1f13", roughness: 0.68 });
  const steel = new THREE.MeshStandardMaterial({ color: "#d1d5db", metalness: 0.6 });

  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.08), wood);
  bar.position.y = 1;
  rack.add(bar);

  [-0.28, 0.28].forEach((offset) => {
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.4, 0.04), steel);
    sword.position.set(offset, 0.78, 0);
    sword.rotation.z = offset > 0 ? -0.35 : 0.35;
    rack.add(sword);
  });

  rack.position.set(x, 0.4, z);
  scene.add(rack);
}

function createAnimeNinja(accent: string, name: string) {
  const group = new THREE.Group();
  const black = new THREE.MeshStandardMaterial({ color: "#101014", roughness: 0.58 });
  const dark = new THREE.MeshStandardMaterial({ color: "#050507", roughness: 0.6 });
  const accentMat = new THREE.MeshStandardMaterial({
    color: accent,
    emissive: accent,
    emissiveIntensity: 0.18,
    roughness: 0.45
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: "#fff6c7",
    emissive: "#fff6c7",
    emissiveIntensity: 0.9
  });
  const steel = new THREE.MeshStandardMaterial({
    color: "#e5e7eb",
    metalness: 0.82,
    roughness: 0.22
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.62, 8, 16), black);
  body.position.y = 0.9;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 16), dark);
  head.position.y = 1.55;
  head.castShadow = true;
  group.add(head);

  const headband = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.12, 0.12), accentMat);
  headband.position.set(0, 1.73, 0.25);
  group.add(headband);

  const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.14, 0.16), accentMat);
  scarf.position.set(-0.08, 1.25, 0.28);
  group.add(scarf);

  [-0.12, 0.12].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.03), eyeMat);
    eye.position.set(x, 1.57, 0.35);
    group.add(eye);
  });

  [-0.28, 0.28].forEach((x) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.5, 6, 10), black);
    arm.position.set(x, 1.02, 0.05);
    arm.rotation.z = x > 0 ? -0.45 : 0.45;
    group.add(arm);
  });

  [-0.16, 0.16].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.42, 6, 10), dark);
    leg.position.set(x, 0.36, 0);
    group.add(leg);
  });

  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.055, 1.25, 0.035), steel);
  blade.position.set(0.56, 1.15, 0.04);
  blade.rotation.set(0.1, 0, -0.88);
  group.add(blade);

  const nameScale = name === "Renegade" ? 1.08 : 1;
  group.scale.setScalar(nameScale);
  return group;
}

function createCat(accent: string) {
  const group = new THREE.Group();
  const fur = new THREE.MeshStandardMaterial({
    color: accent,
    emissive: accent,
    emissiveIntensity: 0.15,
    roughness: 0.62
  });
  const eye = new THREE.MeshStandardMaterial({
    color: "#111827",
    emissive: "#111827",
    emissiveIntensity: 0.4
  });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 16), fur);
  body.scale.set(1.15, 0.82, 0.9);
  body.position.y = 0.72;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), fur);
  head.position.set(0, 1.08, 0.16);
  group.add(head);

  [-0.18, 0.18].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.28, 4), fur);
    ear.position.set(x, 1.35, 0.12);
    ear.rotation.z = x > 0 ? -0.25 : 0.25;
    group.add(ear);

    const catEye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), eye);
    catEye.position.set(x * 0.55, 1.1, 0.43);
    group.add(catEye);
  });

  const tail = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.045, 8, 20, Math.PI * 1.2), fur);
  tail.position.set(0.43, 0.82, -0.12);
  tail.rotation.set(0.2, 1.2, 0.4);
  group.add(tail);
  group.scale.setScalar(1.2);
  return group;
}

function createSlashEffect() {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    color: "#f8fafc",
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide
  });

  for (let index = 0; index < 3; index += 1) {
    const slash = new THREE.Mesh(new THREE.PlaneGeometry(3.2 - index * 0.45, 0.07), material);
    slash.position.y = index * 0.18;
    slash.rotation.z = index * 0.18;
    group.add(slash);
  }

  group.visible = false;
  return group;
}

function createShuriken() {
  const geometry = new THREE.TetrahedronGeometry(0.18, 0);
  const material = new THREE.MeshStandardMaterial({
    color: "#f8fafc",
    emissive: "#f6e7b1",
    emissiveIntensity: 0.5,
    metalness: 0.75,
    roughness: 0.28
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.visible = false;
  return mesh;
}

function updateShuriken(mesh: THREE.Mesh, frame: number, isVisible: boolean, offset: number) {
  mesh.visible = isVisible;
  if (!isVisible) {
    return;
  }

  const progress = (frame * 0.75 + offset) % 1;
  mesh.position.set(4.4 - progress * 8.3, 1.35, -1.2 + progress * 3.5);
  mesh.rotation.set(frame * 8, frame * 11, frame * 7);
  mesh.scale.setScalar(0.85 + Math.sin(frame * 20) * 0.12);
}

function getEffectForSpeaker(speaker?: string) {
  if (speaker === "Renegade") {
    return "attack";
  }
  if (speaker === "Miji") {
    return "build";
  }
  if (speaker === "Sensei") {
    return "review";
  }
  if (speaker === "Tester") {
    return "deploy";
  }
  if (speaker === "Meowts") {
    return "judge";
  }
  if (speaker === "Moji") {
    return "plan";
  }
  return "idle";
}

function toVector(
  collection: Record<string, number[]>,
  name: string
) {
  const [x, y, z] = collection[name] ?? [0, 0, 0];
  return new THREE.Vector3(x, y, z);
}
