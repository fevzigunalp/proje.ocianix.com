import { useState, useEffect, useCallback } from 'react';
import { loadData, saveData } from './store';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import TaskList from './components/TaskList';
import LearningList from './components/LearningList';
import LearningDetail from './components/LearningDetail';
import NoteList from './components/NoteList';
import AssetList from './components/AssetList';
import ReviewList from './components/ReviewList';
import SearchView from './components/SearchView';
import QuickAdd from './components/QuickAdd';
import AlertBar from './components/AlertBar';
import { Menu, Plus } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [view, setView] = useState('dashboard');
  const [selectedId, setSelectedId] = useState(null);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState(null);

  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const update = useCallback((key, item) => {
    setData((d) => ({
      ...d,
      [key]: Array.isArray(d[key])
        ? d[key].some((x) => x.id === item.id)
          ? d[key].map((x) => (x.id === item.id ? item : x))
          : [...d[key], item]
        : item,
    }));
  }, []);

  const remove = useCallback((key, id) => {
    setData((d) => ({ ...d, [key]: d[key].filter((x) => x.id !== id) }));
  }, []);

  const updateData = useCallback((fn) => {
    setData((d) => fn(d));
  }, []);

  const navigate = (v, id) => {
    setView(v);
    setSelectedId(id || null);
    setSidebarOpen(false);
  };

  const sidebarView = view.includes('detail') ? view.replace('-detail', 's') : view;

  return (
    <div className="flex h-screen bg-surface-alt dark:bg-surface-dark text-text-dark dark:text-gray-100 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <Sidebar
        view={sidebarView}
        navigate={navigate}
        dark={dark}
        setDark={setDark}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        data={data}
      />

      <main className="flex-1 overflow-y-auto relative">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark bg-surface dark:bg-surface-dark-alt sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-primary/10">
            <Menu size={20} />
          </button>
          <h1 className="font-semibold text-lg">Ocianix Ops</h1>
          <button onClick={() => setQuickAdd('task')} className="p-2 rounded-lg hover:bg-primary/10 text-primary">
            <Plus size={20} />
          </button>
        </div>

        {/* Smart Alerts from Proje 1 */}
        <AlertBar data={data} updateData={updateData} navigate={navigate} />

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto pb-24">
          {view === 'dashboard' && <Dashboard data={data} navigate={navigate} update={update} />}
          {view === 'projects' && <ProjectList data={data} update={update} remove={remove} navigate={navigate} onQuickAdd={() => setQuickAdd('project')} />}
          {view === 'project-detail' && <ProjectDetail data={data} projectId={selectedId} update={update} remove={remove} navigate={navigate} />}
          {view === 'tasks' && <TaskList data={data} update={update} remove={remove} navigate={navigate} onQuickAdd={() => setQuickAdd('task')} />}
          {view === 'learning' && <LearningList data={data} update={update} remove={remove} navigate={navigate} onQuickAdd={() => setQuickAdd('learning')} />}
          {view === 'learning-detail' && <LearningDetail data={data} learningId={selectedId} update={update} remove={remove} navigate={navigate} />}
          {view === 'notes' && <NoteList data={data} update={update} remove={remove} navigate={navigate} onQuickAdd={() => setQuickAdd('note')} />}
          {view === 'assets' && <AssetList data={data} update={update} remove={remove} navigate={navigate} />}
          {view === 'reviews' && <ReviewList data={data} update={update} remove={remove} navigate={navigate} />}
          {view === 'search' && <SearchView data={data} navigate={navigate} />}
        </div>

        <button
          onClick={() => setQuickAdd('task')}
          className="hidden lg:flex fixed bottom-8 right-8 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-2xl shadow-lg items-center justify-center transition-all hover:scale-105 z-20"
        >
          <Plus size={24} />
        </button>
      </main>

      {quickAdd && (
        <QuickAdd
          type={quickAdd}
          setType={setQuickAdd}
          data={data}
          update={update}
          onClose={() => setQuickAdd(null)}
        />
      )}
    </div>
  );
}
