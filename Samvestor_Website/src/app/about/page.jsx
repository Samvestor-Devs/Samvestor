import AboutHeroGlobe from '../../components/AboutHeroGlobe';
import AboutTeam from '../../components/about/AboutTeam';
import AboutStats from '../../components/about/AboutStats';
import AboutStory from '../../components/about/AboutStory';
import AboutRelentless from '../../components/about/AboutRelentless';
import Footer from '../../components/Footer';

export const metadata = {
    title: 'About — Samvestor',
    description:
        'From a bedroom in Ludhiana to ₹450+ Cr in clientele revenue — the team, the story and the ' +
        'systems behind Samvestor.',
};

/* About Us — Figma "SV About Us Page" (light 3:3898, dark 42:30, mobile
   15:2254), with Lusion-style motion. The navbar comes from the root layout. */
export default function AboutPage() {
    return (
        <main className="about-page">
            <AboutHeroGlobe />
            <AboutTeam />
            <AboutStats />
            <AboutStory />
            <AboutRelentless />
            <Footer />
        </main>
    );
}
