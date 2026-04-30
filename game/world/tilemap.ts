export const TILE_SIZE = 32;
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 22;
export const WORLD_WIDTH = TILE_SIZE * MAP_WIDTH;
export const WORLD_HEIGHT = TILE_SIZE * MAP_HEIGHT;

export type TileCode = 0 | 1 | 2 | 3;

export const TILE = {
  ENTRANCE: 3 as TileCode,
  FLOOR: 0 as TileCode,
  STATION: 2 as TileCode,
  WALL: 1 as TileCode
};

export type Station = {
  agent:
    | "Moji"
    | "Miji"
    | "Maji"
    | "Meji"
    | "Muji"
    | "Meowts";
  tileX: number;
  tileY: number;
};

export const stations: Station[] = [
  { agent: "Moji", tileX: 13, tileY: 13 },
  { agent: "Miji", tileX: 17, tileY: 15 },
  { agent: "Maji", tileX: 24, tileY: 13 },
  { agent: "Meji", tileX: 25, tileY: 16 },
  { agent: "Muji", tileX: 20, tileY: 17 },
  { agent: "Meowts", tileX: 29, tileY: 15 }
];

function buildGrid(): TileCode[][] {
  const grid: TileCode[][] = [];
  for (let y = 0; y < MAP_HEIGHT; y += 1) {
    const row: TileCode[] = [];
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      const isEdge =
        x === 0 || y === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1;
      row.push(isEdge ? TILE.WALL : TILE.FLOOR);
    }
    grid.push(row);
  }

  stations.forEach((station) => {
    grid[station.tileY][station.tileX] = TILE.STATION;
  });

  return grid;
}

export const dojoGrid = buildGrid();

export function tileToWorld(tileX: number, tileY: number) {
  return {
    x: tileX * TILE_SIZE + TILE_SIZE / 2,
    y: tileY * TILE_SIZE + TILE_SIZE / 2
  };
}
