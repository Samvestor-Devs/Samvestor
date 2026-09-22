'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const logoWhite = '/sv-logo-white.png';

/* `href` starting with "/" is a route; "#..." is a section on the home page. */
const navItems = [
    { id: 'home', href: '#home', label: 'Home' },
    { id: 'about-us', href: '/about', label: 'About us' },
    { id: 'services', href: '#services', label: 'Services' },
    { id: 'careers', href: '#careers', label: 'Careers' },
    { id: 'case-studies', href: '#case-studies', label: 'Case Studies' },
    { id: 'contact-us', href: '#contact-us', label: 'Contact Us' },
];

const ctaLink = {
    href: '#book-a-call',
    label: 'Book A Call',
};

const isRoute = (href) => href.startsWith('/');

// a section link points back at the home page when you're on another route
const toHref = (href, pathname) =>
    isRoute(href) || pathname === '/' ? href : `/${href}`;

const PhoneIcon = () => (
    <svg className="cta-icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.07 21 3 13.93 3 5.5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
);

function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeHash, setActiveHash] = useState('#home');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.pageYOffset > 50);

        const handleResize = () => {
            if (window.innerWidth > 992 && mobileOpen) {
                setMobileOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && mobileOpen) {
                setMobileOpen(false);
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [mobileOpen]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
    }, [mobileOpen]);

    // hide while scrolling down, bring back on any scroll up (and always at
    // the top of the page) — the sections then get the whole screen
    const [hidden, setHidden] = useState(false);
    useEffect(() => {
        const TOP_ZONE = 80; // px from the top where it always shows
        const THRESHOLD = 6; // ignore tiny jitters (trackpads, rubber-banding)
        let lastY = window.scrollY;
        let raf = 0;

        const update = () => {
            raf = 0;
            const y = window.scrollY;
            const dy = y - lastY;
            if (y < TOP_ZONE) {
                setHidden(false);
                lastY = y;
            } else if (Math.abs(dy) > THRESHOLD) {
                setHidden(dy > 0);
                lastY = y;
            }
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    const closeMobileMenu = () => setMobileOpen(false);
    const toggleMobileMenu = () => setMobileOpen((prev) => !prev);

    const isActive = (href) =>
        isRoute(href) ? pathname === href : pathname === '/' && activeHash === href;

    const handleNavigationClick = (event, href, isCta = false) => {
        if (!href) return;
        closeMobileMenu();

        // route links (e.g. /about) are handled by <Link> itself
        if (isRoute(href)) return;

        if (!isCta) {
            setActiveHash(href);
        }

        // on another route, let the router take us to /#section
        if (pathname !== '/') {
            return;
        }

        // already home — smooth-scroll to the section instead of jumping
        event.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <>
            <nav
                className={`navbar-container ${scrolled ? 'scrolled' : ''} ${
                    hidden && !mobileOpen ? 'navbar-container--hidden' : ''
                }`}
                // tabbing into a hidden navbar brings it back
                onFocus={() => setHidden(false)}
            >
                <div className="navbar">
                    <Link
                        href={toHref('#home', pathname)}
                        className="navbar-brand"
                        onClick={(event) => handleNavigationClick(event, '#home')}
                    >
                        <img className="brand-logo" src={logoWhite} alt="SamVestor" />
                    </Link>

                    <ul className="navbar-nav" id="navbarNav">
                        {navItems.map((item) => (
                            <li className="nav-item" key={item.id}>
                                <Link
                                    href={toHref(item.href, pathname)}
                                    className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                                    onClick={(event) => handleNavigationClick(event, item.href)}
                                >
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <ThemeToggle className="navbar-theme-toggle" />

                    <Link
                        href={toHref(ctaLink.href, pathname)}
                        className="cta-button"
                        onClick={(event) => handleNavigationClick(event, ctaLink.href, true)}
                    >
                        <span className="cta-icon">
                            <PhoneIcon />
                        </span>
                        <span className="cta-label">{ctaLink.label}</span>
                    </Link>

                    <button
                        className={`mobile-toggle ${mobileOpen ? 'active' : ''}`}
                        id="mobileToggle"
                        type="button"
                        aria-label="Toggle navigation"
                        aria-expanded={mobileOpen}
                        onClick={toggleMobileMenu}
                    >
                        <div className="hamburger">
                            <span />
                            <span />
                            <span />
                        </div>
                    </button>
                </div>
            </nav>

            <div
                className={`mobile-menu-overlay ${mobileOpen ? 'active' : ''}`}
                onClick={closeMobileMenu}
            />

            <div className={`mobile-menu ${mobileOpen ? 'active' : ''}`} id="mobileMenu" aria-hidden={!mobileOpen}>
                <div className="mobile-menu-header">
                    <Link
                        href={toHref('#home', pathname)}
                        className="mobile-menu-brand"
                        onClick={(event) => handleNavigationClick(event, '#home')}
                    >
                        <img className="brand-logo" src={logoWhite} alt="SamVestor" />
                    </Link>
                    <button
                        className="mobile-menu-close"
                        type="button"
                        id="mobileMenuClose"
                        aria-label="Close menu"
                        onClick={closeMobileMenu}
                    >
                        ×
                    </button>
                </div>

                <ul className="mobile-menu-nav">
                    {navItems.map((item) => (
                        <li className="mobile-menu-item" key={item.id}>
                            <Link
                                href={toHref(item.href, pathname)}
                                className={`mobile-menu-link ${isActive(item.href) ? 'active' : ''}`}
                                onClick={(event) => handleNavigationClick(event, item.href)}
                            >
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="mobile-theme-row">
                    <span className="mobile-theme-label">Light / dark mode</span>
                    <ThemeToggle />
                </div>

                <div className="mobile-cta">
                    <Link
                        href={toHref(ctaLink.href, pathname)}
                        className="cta-button mobile-cta-button"
                        onClick={(event) => handleNavigationClick(event, ctaLink.href, true)}
                    >
                        <span className="cta-icon">
                            <PhoneIcon />
                        </span>
                        <span className="cta-label">{ctaLink.label}</span>
                    </Link>
                </div>
            </div>
        </>
    );
}

export default Navbar;
