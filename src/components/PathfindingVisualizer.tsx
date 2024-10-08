import React, { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

type CellType = 'empty' | 'wall' | 'start' | 'end' | 'path' | 'visited'

interface Cell {
  type: CellType
  x: number
  y: number
}

const GRID_ROWS = 20
const GRID_COLS = 20

const PathfindingVisualizer: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [algorithm, setAlgorithm] = useState<string>('dfs')
  const [startCell, setStartCell] = useState<Cell | null>(null)
  const [endCell, setEndCell] = useState<Cell | null>(null)
  const [isSelecting, setIsSelecting] = useState<'start' | 'end' | null>(null)
  const [isPathfinding, setIsPathfinding] = useState(false)

  const generateMaze = useCallback(() => {
    const newGrid: Cell[][] = Array(GRID_ROWS).fill(null).map((_, y) =>
      Array(GRID_COLS).fill(null).map((_, x) => ({
        type: Math.random() < 0.3 ? 'wall' : 'empty',
        x,
        y
      }))
    )
    setGrid(newGrid)
    setStartCell(null)
    setEndCell(null)
    resetPath()
  }, [])

  useEffect(() => {
    generateMaze()
  }, [generateMaze])

  const resetPath = useCallback(() => {
    setGrid(prevGrid => prevGrid.map(row => row.map(cell => 
      cell.type === 'path' || cell.type === 'visited' ? { ...cell, type: 'empty' } : cell
    )))
  }, [])

  useEffect(() => {
    resetPath()
  }, [algorithm, resetPath])

  const handleCellClick = (cell: Cell) => {
    if (isPathfinding) return

    if (isSelecting === 'start') {
      setStartCell(cell)
      setIsSelecting(null)
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row])
        if (startCell) newGrid[startCell.y][startCell.x].type = 'empty'
        newGrid[cell.y][cell.x] = { ...cell, type: 'start' }
        return newGrid
      })
    } else if (isSelecting === 'end') {
      setEndCell(cell)
      setIsSelecting(null)
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row])
        if (endCell) newGrid[endCell.y][endCell.x].type = 'empty'
        newGrid[cell.y][cell.x] = { ...cell, type: 'end' }
        return newGrid
      })
    } else {
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row])
        newGrid[cell.y][cell.x].type = newGrid[cell.y][cell.x].type === 'wall' ? 'empty' : 'wall'
        return newGrid
      })
    }
  }

  const dfs = async (start: Cell, end: Cell): Promise<Cell[]> => {
    const visited: boolean[][] = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(false))
    const path: Cell[] = []
    const stack: Cell[] = [start]

    while (stack.length > 0) {
      const current = stack.pop()!
      if (current.x === end.x && current.y === end.y) {
        path.push(current)
        return path
      }
      if (!visited[current.y][current.x] && grid[current.y][current.x].type !== 'wall') {
        visited[current.y][current.x] = true
        path.push(current)
        await animateStep(current)
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]
        for (const [dx, dy] of directions) {
          const newX = current.x + dx
          const newY = current.y + dy
          if (newX >= 0 && newX < GRID_COLS && newY >= 0 && newY < GRID_ROWS) {
            stack.push(grid[newY][newX])
          }
        }
      }
    }
    return []
  }

  const bfs = async (start: Cell, end: Cell): Promise<Cell[]> => {
    const visited: boolean[][] = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(false))
    const queue: Cell[] = [start]
    const parent: Map<string, Cell> = new Map()

    while (queue.length > 0) {
      const current = queue.shift()!
      if (current.x === end.x && current.y === end.y) {
        return reconstructPath(parent, end)
      }
      if (!visited[current.y][current.x] && grid[current.y][current.x].type !== 'wall') {
        visited[current.y][current.x] = true
        await animateStep(current)
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]
        for (const [dx, dy] of directions) {
          const newX = current.x + dx
          const newY = current.y + dy
          if (newX >= 0 && newX < GRID_COLS && newY >= 0 && newY < GRID_ROWS && !visited[newY][newX]) {
            queue.push(grid[newY][newX])
            parent.set(`${newY},${newX}`, current)
          }
        }
      }
    }
    return []
  }

  const reconstructPath = (parent: Map<string, Cell>, end: Cell): Cell[] => {
    const path: Cell[] = [end]
    let current = end
    while (parent.has(`${current.y},${current.x}`)) {
      current = parent.get(`${current.y},${current.x}`)!
      path.unshift(current)
    }
    return path
  }

  const animateStep = (cell: Cell) => {
    return new Promise<void>(resolve => {
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row])
        if (newGrid[cell.y][cell.x].type === 'empty') {
          newGrid[cell.y][cell.x] = { ...cell, type: 'visited' }
        }
        return newGrid
      })
      setTimeout(resolve, 10)
    })
  }

  const handlePathfind = async () => {
    if (!startCell || !endCell) {
      alert('Please select start and end points')
      return
    }
    setIsPathfinding(true)
    resetPath()
    let path: Cell[]
    if (algorithm === 'dfs') {
      path = await dfs(startCell, endCell)
    } else {
      path = await bfs(startCell, endCell)
    }
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row])
      path.forEach(cell => {
        if (newGrid[cell.y][cell.x].type !== 'start' && newGrid[cell.y][cell.x].type !== 'end') {
          newGrid[cell.y][cell.x] = { ...cell, type: 'path' }
        }
      })
      return newGrid
    })
    setIsPathfinding(false)
  }

  const handleAlgorithmChange = (newAlgorithm: string) => {
    setAlgorithm(newAlgorithm)
    resetPath()
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Pathfinding Visualizer</h2>
      <div className="mb-4 flex space-x-2 items-center">
        <Select value={algorithm} onValueChange={handleAlgorithmChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select pathfinding algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dfs">Depth-First Search</SelectItem>
            <SelectItem value="bfs">Breadth-First Search</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handlePathfind} disabled={isPathfinding || !startCell || !endCell}>Find Path</Button>
        <Button onClick={generateMaze} disabled={isPathfinding}>Generate New Maze</Button>
        <Button onClick={() => setIsSelecting('start')} disabled={isPathfinding}>Set Start</Button>
        <Button onClick={() => setIsSelecting('end')} disabled={isPathfinding}>Set End</Button>
      </div>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`, gap: '1px', width: 'fit-content' }}>
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`w-6 h-6 border cursor-pointer ${
                cell.type === 'wall' ? 'bg-gray-800' :
                cell.type === 'start' ? 'bg-green-500' :
                cell.type === 'end' ? 'bg-red-500' :
                cell.type === 'path' ? 'bg-yellow-300' :
                cell.type === 'visited' ? 'bg-blue-200' :
                'bg-white'
              }`}
              onClick={() => handleCellClick(cell)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default PathfindingVisualizer