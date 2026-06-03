import './App.css';
import Navbar from './components/Navbar';
import WorkSection from './components/WorkSection';
import ServicesSection from './components/ServicesSection';
import ProcessSection from './components/ProcessSection';
import TeamSection from './components/TeamSection';
import WhoSection from './components/WhoSection';
import AboutSection from './components/AboutSection';

function App() {
  return (
    <>
      <Navbar />
      <AboutSection />
      <ProcessSection />
      <WhoSection />
      <TeamSection />
      <WorkSection />
      <ServicesSection />
    </>
  );
}

export default App;
