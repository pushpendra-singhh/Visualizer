import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

const SortingVisualizer: React.FC = () => {
  const [array, setArray] = useState<number[]>([])
  const [algorithm, setAlgorithm] = useState<string>('bubble')
  const [history, setHistory] = useState<{ array: number[], algorithm: string }[]>([])
  const [sorting, setSorting] = useState(false)
  const [currentStep, setCurrentStep] = useState<number[]>([])
  const [inputArray, setInputArray] = useState<string>('')

  useEffect(() => {
    const savedHistory = localStorage.getItem('sortingHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
    generateRandomArray()
  }, [])

  useEffect(() => {
    localStorage.setItem('sortingHistory', JSON.stringify(history))
  }, [history])

  const generateRandomArray = () => {
    const newArray = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100) + 1)
    setArray(newArray)
    setCurrentStep(newArray)
    setInputArray(newArray.join(', '))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputArray(e.target.value)
  }

  const handleInputSubmit = () => {
    const newArray = inputArray.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num))
    if (newArray.length > 0) {
      setArray(newArray)
      setCurrentStep(newArray)
    } else {
      alert('Please enter valid numbers separated by commas')
    }
  }

  const handleSort = async () => {
    setSorting(true)
    let sortedArray: number[] = [...array]
    const steps: number[][] = []

    switch (algorithm) {
      case 'bubble':
        await bubbleSort(sortedArray, steps)
        break
      case 'quick':
        await quickSort(sortedArray, 0, sortedArray.length - 1, steps)
        break
      default:
        break
    }

    setHistory([...history, { array: sortedArray, algorithm }])
    setSorting(false)
  }

  const bubbleSort = async (arr: number[], steps: number[][]) => {
    const n = arr.length
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
          steps.push([...arr])
          await animateStep(steps[steps.length - 1])
        }
      }
    }
  }

  const quickSort = async (arr: number[], low: number, high: number, steps: number[][]) => {
    if (low < high) {
      const pi = await partition(arr, low, high, steps)
      await quickSort(arr, low, pi - 1, steps)
      await quickSort(arr, pi + 1, high, steps)
    }
  }

  const partition = async (arr: number[], low: number, high: number, steps: number[][]): Promise<number> => {
    const pivot = arr[high]
    let i = low - 1

    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++
        [arr[i], arr[j]] = [arr[j], arr[i]]
        steps.push([...arr])
        await animateStep(steps[steps.length - 1])
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
    steps.push([...arr])
    await animateStep(steps[steps.length - 1])

    return i + 1
  }

  const animateStep = (step: number[]) => {
    return new Promise<void>(resolve => {
      setCurrentStep(step)
      setTimeout(resolve, 50)
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Sorting Visualizer</h2>
      <div className="mb-4 flex space-x-2">
        <Input
          value={inputArray}
          onChange={handleInputChange}
          placeholder="Enter numbers separated by commas"
          className="flex-grow"
        />
        <Button onClick={handleInputSubmit}>Set Array</Button>
        <Button onClick={generateRandomArray}>Random Array</Button>
      </div>
      <div className="mb-4 flex space-x-2">
        <Select value={algorithm} onValueChange={setAlgorithm}>
          <SelectTrigger>
            <SelectValue placeholder="Select sorting algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bubble">Bubble Sort</SelectItem>
            <SelectItem value="quick">Quick Sort</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSort} disabled={sorting}>Sort</Button>
      </div>
      <div className="h-64 flex items-end space-x-1">
        {currentStep.map((value, index) => (
          <div
            key={index}
            className="bg-blue-500 w-2"
            style={{ height: `${(value / Math.max(...currentStep)) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Sorting History:</h3>
        <ul>
          {history.map((item, index) => (
            <li key={index}>
              {item.algorithm}: [{item.array.join(', ')}]
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SortingVisualizer