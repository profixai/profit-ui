import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/benchmark.css';
import Benchmark from './pages/Benchmark';

createRoot(document.getElementById('benchmark-root')!).render(<Benchmark />);
