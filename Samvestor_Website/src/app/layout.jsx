import { Anton, Inter } from 'next/font/google';
import '../index.css';
import '../App.css';
import Navbar from '../components/Navbar';
import Preloader from '../components/Preloader';

/* Self-hosted by Next — no external Google Fonts request, and the same
   faces render on every device. Exposed as CSS variables consumed by
   --font-body / --font-accent in index.css. */
const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-inter',
    display: 'swap',
});

const anton = Anton({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-anton',
    display: 'swap',
});

export const metadata = {
    title: 'Samvestor — We Build Revenue',
    description:
        'Samvestor blends data-led strategy, performance marketing, and relentless ' +
        'execution to build systems that scale - across Meta, Google, email, funnels ' +
        'and creative.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${anton.variable}`}>
            <body>
                {/* #root keeps the layout rules the sections were built against */}
                <div id="root">
                    <Preloader />
                    <Navbar />
                    {children}
                </div>
            </body>
        </html>
    );
}
