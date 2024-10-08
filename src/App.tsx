import React, { useState } from 'react'
import SortingVisualizer from './components/SortingVisualizer'
import PathfindingVisualizer from './components/PathfindingVisualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'

function App() {
  const [activeTab, setActiveTab] = useState('sorting')

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Sorting and Pathfinding Visualizer</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="sorting">Sorting</TabsTrigger>
          <TabsTrigger value="pathfinding">Pathfinding</TabsTrigger>
        </TabsList>
        <TabsContent value="sorting">
          <SortingVisualizer />
        </TabsContent>
        <TabsContent value="pathfinding">
          <PathfindingVisualizer />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App