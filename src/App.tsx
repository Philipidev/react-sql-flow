import './globals.css';
import SqlInputForm from './components/SqlInputForm';
import SqlFlowDiagram from './components/flow/SqlFlowDiagram';
import { useSqlStore } from './store/sqlStore';

function App() {
  const { nodes } = useSqlStore();
  const hasNodes = nodes.length > 0;
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">SQL Flow Visualizer</h1>
        <p className="text-muted-foreground">
          Visualize SQL Server database schemas as interactive diagrams
        </p>
      </header>
      
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        <div className="w-full">
          <SqlInputForm />
        </div>
        
        <div className="w-full">
          {hasNodes ? (
            <SqlFlowDiagram />
          ) : (
            <div className="flex items-center justify-center h-[600px] border rounded-lg bg-card text-card-foreground">
              <div className="text-center p-8">
                <h3 className="text-xl font-medium mb-2">No Schema Loaded</h3>
                <p className="text-muted-foreground">
                  Enter a SQL script on the left and click "Process SQL Script" to visualize your database schema.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
