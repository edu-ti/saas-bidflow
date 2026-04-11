import KanbanBoard from './components/KanbanBoard';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto h-screen">
         {/* Route rendered here, let's keep Kanban as default for the demo */}
         <KanbanBoard />
      </div>
    </div>
  );
}

export default App;
