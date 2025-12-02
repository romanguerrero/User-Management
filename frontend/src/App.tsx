import { Table } from './components/table'

const Header = () => (
  <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="mt-1 text-sm text-gray-400">Search through your user database</p>
      </div>
    </div>
  </header>
);

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <main>
        <Table />
      </main>
    </div>
  )
}

export default App
