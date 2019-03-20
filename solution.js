// Rotation functions

const rotateX = offset => [
  [1, 0, 0, 0],
  [0, 0, -1, offset[1] + offset[2]],
  [0, 1, 0, offset[2] - offset[1]],
  [0, 0, 0, 1]
];

const rotateY = offset => [
  [0, 0, 1, offset[0] - offset[2]],
  [0, 1, 0, 0],
  [-1, 0, 0, offset[0] + offset[2]],
  [0, 0, 0, 1]
];

const rotateNegX = offset => [
  [1, 0, 0, 0],
  [0, 0, 1, offset[1] - offset[2]],
  [0, -1, 0, offset[1] + offset[2]],
  [0, 0, 0, 1]
];

const rotateNegY = offset => [
  [0, 0, -1, offset[0] + offset[2]],
  [0, 1, 0, 0],
  [1, 0, 0, offset[2] - offset[0]],
  [0, 0, 0, 1]
];

const multiply = (matrix, vector) => matrix.map(row => row.reduce((prev, cur, index) => cur * vector[index] + prev, 0));

const toHomogeneous = vector => [...vector, 1];

const toCartesian = vector => vector.slice(0, 3);

const rotateBlocks = (blocks, direction) => {
  let rotationOffset;

  if (direction === 'D' || direction === 'R') {
    const x = Math.max(...blocks.map(block => block[0]));
    const y = Math.max(...blocks.map(block => block[1]));

    rotationOffset = [x + 0.5, y + 0.5, 0.5];
  } else {
    const x = Math.min(...blocks.map(block => block[0]));
    const y = Math.min(...blocks.map(block => block[1]));

    rotationOffset = [x - 0.5, y - 0.5, 0.5];
  }

  const rotationMatrix = direction === 'U'
    ? rotateNegX(rotationOffset)
    : direction === 'D'
      ? rotateX(rotationOffset)
      : direction === 'L'
        ? rotateY(rotationOffset)
        : direction === 'R'
          ? rotateNegY(rotationOffset)
          : null;

  if (!rotationMatrix) throw ('direction must be U, D, L, or R');

  return blocks.map(block => toCartesian(multiply(rotationMatrix, toHomogeneous(block))));
}


// Searching functions

function isOutOfBounds(blocks, grid) {
  for (const block of blocks) {
    const x = block[0], y = block[1];

    if (!grid[y] || !grid[y][x] || grid[y][x] === 0) {
      return true;
    }
  }

  return false;
}

function isAtHole(blocks, grid) {
  for (const block of blocks) {
    const x = block[0], y = block[1];

    if (grid[y][x] !== 'X') {
      return false;
    }
  }

  return true;
}

const stringifyBlocks = blocks => JSON.stringify(blocks.map(block => JSON.stringify(block)).sort());

function addToVisited(rawBlocks, visited) {
  const blocks = stringifyBlocks(rawBlocks);

  if (!visited.includes(blocks)) {
    return [...visited, blocks];
  } else {
    return visited;
  }
}

function hasBeenVisited(rawBlocks, visited) {
  const blocks = stringifyBlocks(rawBlocks);

  return visited.includes(blocks);
}

function findShortestPathFrom(blocksPosition, grid, visited) {
  let shortestPath;
  const directions = ['U', 'D', 'L', 'R'];

  for (direction of directions) {
    const newPosition = rotateBlocks(blocksPosition, direction);

    if (isOutOfBounds(newPosition, grid) || hasBeenVisited(newPosition, visited)) {
      continue;

    } else if (isAtHole(newPosition, grid)) {
      shortestPath = direction;
      continue;

    } else {
      const updatedVisited = addToVisited(newPosition, visited);

      const subPath = findShortestPathFrom(newPosition, grid, updatedVisited);

      if (subPath) {
        const newPath = direction + subPath;

        if (!shortestPath || newPath.length < shortestPath.length) {
          shortestPath = newPath;
        }
      }
    }
  }

  return shortestPath;
}

function getStartingPosition(grid) {
  let x, y = -1;

  do {
    y++;
    x = grid[y].indexOf('B');
  } while (x === -1);

  return [
    [x, y, 0],
    [x, y, -1]
  ];
}


function boxSolver(grid) {
  const startingPosition = getStartingPosition(grid);
  const visited = [];

  return findShortestPathFrom(startingPosition, grid, visited);
}


const grid = ['1110000000',
'1B11110000',
'1111111110',
'0111111111',
'0000011X11',
'0000001110']

console.log(boxSolver(grid));