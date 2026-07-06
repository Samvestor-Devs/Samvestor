import { useEffect, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import WorkSection from './components/WorkSection';
import ServicesSection from './components/ServicesSection';
import ProcessSection from './components/ProcessSection';
import TeamSection from './components/TeamSection';
import WhoSection from './components/WhoSection';
import AboutSection from './components/AboutSection';
import Preloader from './components/Preloader';
import BlueprintSection from './components/BlueprintSection';
import Footer from './components/Footer';

// minimal hash routing so the About page is viewable at #/about
function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

function App() {
  const hash = useHashRoute();
  const [loading, setLoading] = useState(true);

  // About page  ->  localhost:5173/#/about
  const page = hash.startsWith('#/about') ? (
    <div className="about-page">
      <Navbar />
    </div>
  ) : (
    // Home page
    <>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ProcessSection />
      <WhoSection />
      <TeamSection />
      <WorkSection />
      <ServicesSection />
      <BlueprintSection />
      <Footer />
    </>
  );

  return (
    <>
      {loading && <Preloader onFinish={() => setLoading(false)} />}
      {page}
    </>
  );
}

export default App;
