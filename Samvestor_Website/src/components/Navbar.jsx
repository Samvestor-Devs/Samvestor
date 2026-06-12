import { useEffect, useState } from 'react';
import './Navbar.css';
import logoWhite from '../assets/sv-logo-white.png';

const navItems = [
    { id: 'home', href: '#home', label: 'Home' },
    { id: 'about-us', href: '#/about', label: 'About us' },
    { id: 'services', href: '#services', label: 'Services' },
    { id: 'careers', href: '#careers', label: 'Careers' },
    { id: 'case-studies', href: '#case-studies', label: 'Case Studies' },
    { id: 'contact-us', href: '#contact-us', label: 'Contact Us' },
];

const ctaLink = {
    href: '#book-a-call',
    label: 'Book A Call',
};

const PhoneIcon = () => (
    <svg className="cta-icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.07 21 3 13.93 3 5.5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
);

function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeHref, setActiveHref] = useState('#home');
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

    const closeMobileMenu = () => setMobileOpen(false);
    const toggleMobileMenu = () => setMobileOpen((prev) => !prev);

    const handleNavigationClick = (event, href, isCta = false) => {
        event.preventDefault();
        if (!href) return;

        if (!isCta) {
            setActiveHref(href);
        }

        closeMobileMenu();

        // route-level links (e.g. #/about) switch pages
        if (href.startsWith('#/')) {
            window.location.hash = href;
            window.scrollTo(0, 0);
            return;
        }

        // a normal section link — if we're on a sub-route, go back to the
        // homepage first, then scroll to the section
        if (window.location.hash.startsWith('#/')) {
            window.location.hash = '';
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <>
            <nav className={`navbar-container ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar">
                    <a href="#home" className="navbar-brand" onClick={(event) => handleNavigationClick(event, '#home')}>
                        <img className="brand-logo" src={logoWhite} alt="SamVestor" />
                    </a>

                    <ul className="navbar-nav" id="navbarNav">
                        {navItems.map((item) => (
                            <li className="nav-item" key={item.id}>
                                <a
                                    href={item.href}
                                    className={`nav-link ${activeHref === item.href ? 'active' : ''}`}
                                    onClick={(event) => handleNavigationClick(event, item.href)}
                                >
                                    <span>{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>

                    <a
                        href={ctaLink.href}
                        className="cta-button"
                        onClick={(event) => handleNavigationClick(event, ctaLink.href, true)}
                    >
                        <span className="cta-icon">
                            <PhoneIcon />
                        </span>
                        <span className="cta-label">{ctaLink.label}</span>
                    </a>

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
                    <a href="#home" className="mobile-menu-brand" onClick={(event) => handleNavigationClick(event, '#home')}>
                        <img className="brand-logo" src={logoWhite} alt="SamVestor" />
                    </a>
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
                            <a
                                href={item.href}
                                className={`mobile-menu-link ${activeHref === item.href ? 'active' : ''}`}
                                onClick={(event) => handleNavigationClick(event, item.href)}
                            >
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="mobile-cta">
                    <a
                        href={ctaLink.href}
                        className="cta-button mobile-cta-button"
                        onClick={(event) => handleNavigationClick(event, ctaLink.href, true)}
                    >
                        <span className="cta-icon">
                            <PhoneIcon />
                        </span>
                        <span className="cta-label">{ctaLink.label}</span>
                    </a>
                </div>
            </div>
        </>
    );
}

export default Navbar;
