import { Table } from './components/table'
import ThemeToggle from './components/ThemeToggle'
import { useTheme } from './contexts/ThemeContext'

const Header = () => {
  const { theme } = useTheme();
  return (
    <header className={`backdrop-blur-sm border-b sticky top-0 z-10 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-gray-50/90 border-gray-300'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-6 flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>User Management</h1>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>Search through your user database</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

function App() {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100'}`}>
      <Header />
      <main>
        <Table />
      </main>
    </div>
  )
}

export default App
