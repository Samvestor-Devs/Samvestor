import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ProcessSection from '../components/ProcessSection';
import WhoSection from '../components/WhoSection';
import TeamSection from '../components/TeamSection';
import WorkSection from '../components/WorkSection';
import ServicesSection from '../components/ServicesSection';
import BlueprintSection from '../components/BlueprintSection';
import Footer from '../components/Footer';

export default function HomePage() {
    return (
        <>
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
}
