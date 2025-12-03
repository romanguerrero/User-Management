import { Table } from './components/table'
import ThemeToggle from './components/ThemeToggle'

const Header = () => {
  return (
    <header className="backdrop-blur-sm border-b sticky top-0 z-10 bg-surface-secondary border-border-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="mt-1 text-sm text-foreground-muted">Search through your user database</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-gradient-start via-background-secondary to-background-gradient-end">
      <Header />
      <main>
        <Table />
      </main>
    </div>
  )
}

export default App
