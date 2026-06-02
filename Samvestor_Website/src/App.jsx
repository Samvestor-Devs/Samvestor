import './App.css';
import Navbar from './components/Navbar';
import WorkSection from './components/WorkSection';
import ServicesSection from './components/ServicesSection';
import ProcessSection from './components/ProcessSection';
import TeamSection from './components/TeamSection';
import WhoSection from './components/WhoSection';

function App() {
  return (
    <>
      <Navbar />
      <ProcessSection />
      <TeamSection />
      <WorkSection />
      <ServicesSection />
      <WhoSection />
    </>
  );
}

export default App;
