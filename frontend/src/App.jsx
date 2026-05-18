import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Alerts from './components/Alerts';
import EyeAnimation from './components/EyeAnimation';
import Prompts from './components/Prompts';
import History from './components/History';
import 'driver.js/dist/driver.css';


function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<EyeAnimation />} />
          <Route path="/devices" element={<Dashboard/>} />     
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/logout" element={<Dashboard />} />    
          <Route path="/prompts" element={<Prompts/>} />    
          <Route path="/history" element={<History/>} /> 
        </Routes>
    </Router>
  );
}

export default App;