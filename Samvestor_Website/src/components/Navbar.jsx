import { useEffect, useState } from 'react';
import './Navbar.css';

const navItems = [
    {
        id: 'home',
        href: '#home',
        label: 'Home',
        // icon: (
        //     <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
        //         <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        //         <polyline points="9,22 9,12 15,12 15,22"></polyline>
        //     </svg>
        // ),
    },
    {
        id: 'about-us',
        href: '#about-us',
        label: 'About Us',
        // icon: (
        //     <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
        //         <circle cx="12" cy="12" r="10"></circle>
        //         <line x1="12" y1="16" x2="12" y2="12"></line>
        //         <line x1="12" y1="8" x2="12.01" y2="8"></line>
        //     </svg>
        // ),
    },
    {
        id: 'services',
        href: '#services',
        label: 'Services',
        // icon: (
        //     <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
        //         <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        //         <line x1="8" y1="21" x2="16" y2="21"></line>
        //         <line x1="12" y1="17" x2="12" y2="21"></line>
        //     </svg>
        // ),
    },
    {
        id: 'case-studies',
        href: '#case-studies',
        label: 'Case Studies',
        // icon: (
        //     <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
        //         <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        //         <path d="M16 3h6v4"></path>
        //         <path d="m22 7-10-4-10 4"></path>
        //     </svg>
        // ),
    },
    {
        id: 'contact-us',
        href: '#contact-us',
        label: 'Contact Us',
        // icon: (
        //     <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
        //         <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        //         <polyline points="22,6 12,13 2,6"></polyline>
        //     </svg>
        // ),
    },
];

const ctaLink = {
    href: '#cta',
    label: 'Get Started',
};

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
                        <div className="logo-icon" aria-hidden="true"></div>
                        <span className="brand-text">NeoNav</span>
                    </a>

                    <ul className="navbar-nav" id="navbarNav">
                        {navItems.map((item) => (
                            <li className="nav-item" key={item.id}>
                                <a
                                    href={item.href}
                                    className={`nav-link ${activeHref === item.href ? 'active' : ''}`}
                                    onClick={(event) => handleNavigationClick(event, item.href)}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </a>
                            </li>
                        ))}
                        <li className="nav-item">
                            <a
                                href={ctaLink.href}
                                className="cta-button"
                                onClick={(event) => handleNavigationClick(event, ctaLink.href, true)}
                            >
                                {ctaLink.label}
                            </a>
                        </li>
                    </ul>

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
                        <div className="logo-icon" aria-hidden="true"></div>
                        <span>NeoNav</span>
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
                                <span className="mobile-menu-icon" aria-hidden="true">{item.icon}</span>
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="mobile-cta">
                    <a
                        href={ctaLink.href}
                        className="mobile-cta-button"
                        onClick={(event) => handleNavigationClick(event, ctaLink.href, true)}
                    >
                        {ctaLink.label}
                    </a>
                </div>
            </div>
        </>
    );
}

export default Navbar;
