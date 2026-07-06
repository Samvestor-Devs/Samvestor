import './Footer.css';

const QUICK_LINKS = [
    { label: 'Home', href: '#home' },
    { label: 'About Us', href: '#/about' },
    { label: 'Services', href: '#services' },
    { label: 'Case Studies', href: '#case-studies' },
    { label: 'Contact Us', href: '#contact-us' },
];

const SERVICE_LINKS = [
    { label: 'Performance Marketing', href: '#services' },
    { label: 'Content & Copywriting', href: '#services' },
    { label: 'Creative & Visual Lab', href: '#services' },
    { label: 'Email & WhatsApp Marketing', href: '#services' },
    { label: 'CRO & Funnel Optimization', href: '#services' },
];

const CONTACT = {
    email: 'samvestor@gmail.com',
    phone: '079966 00003',
    address: ['SCF 12, 13, 14, First Floor, E-Block,', 'Main Market, SBS Nagar,', 'Ludhiana, 141013'],
};

const SOCIALS = [
    {
        label: 'YouTube',
        href: '#',
        path: 'M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z',
    },
    {
        label: 'Instagram',
        href: '#',
        path: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z',
    },
    {
        label: 'Facebook',
        href: '#',
        path: 'M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95 0-5.52-4.48-10-10-10z',
    },
    {
        label: 'LinkedIn',
        href: '#',
        path: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z',
    },
];

const MailIcon = () => (
    <svg className="footer__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 4.25-7.07 4.42c-.32.2-.74.2-1.06 0L4.4 8.25a.85.85 0 1 1 .9-1.44L12 11l6.7-4.19a.85.85 0 1 1 .9 1.44z" />
    </svg>
);

const PhoneIcon = () => (
    <svg className="footer__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.07 21 3 13.93 3 5.5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
);

const PinIcon = () => (
    <svg className="footer__icon footer__icon--pin" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 8.5c0 5.25 7 13.5 7 13.5s7-8.25 7-13.5C19 5.13 15.87 2 12 2zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
);

function Footer() {
    return (
        <footer className="footer">
            <div className="footer__top">
                <div className="footer__brand">
                    <h2 className="footer__tagline">
                        <span className="footer__tagline-plain">Strategy-Led Growth.</span>
                        <span className="footer__tagline-gradient">Measured in Revenue.</span>
                    </h2>
                    <p className="footer__sub">From first idea to first crore - we build systems that scale.</p>
                </div>

                <div className="footer__columns">
                    <div className="footer__col">
                        <h3 className="footer__col-title">Quick Links</h3>
                        <ul className="footer__list">
                            {QUICK_LINKS.map((link) => (
                                <li key={link.label}>
                                    <a className="footer__link" href={link.href}>
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer__col">
                        <h3 className="footer__col-title">Services</h3>
                        <ul className="footer__list">
                            {SERVICE_LINKS.map((link) => (
                                <li key={link.label}>
                                    <a className="footer__link" href={link.href}>
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer__col">
                        <h3 className="footer__col-title">Contact Info</h3>
                        <ul className="footer__list footer__list--contact">
                            <li className="footer__contact-row">
                                <MailIcon />
                                <a className="footer__link" href={`mailto:${CONTACT.email}`}>
                                    {CONTACT.email}
                                </a>
                            </li>
                            <li className="footer__contact-row">
                                <PhoneIcon />
                                <a className="footer__link" href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>
                                    {CONTACT.phone}
                                </a>
                            </li>
                            <li className="footer__contact-row footer__contact-row--address">
                                <PinIcon />
                                <span className="footer__link footer__address">
                                    {CONTACT.address.map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < CONTACT.address.length - 1 && <br />}
                                        </span>
                                    ))}
                                </span>
                            </li>
                        </ul>
                        <div className="footer__socials">
                            {SOCIALS.map((social) => (
                                <a key={social.label} className="footer__social" href={social.href} aria-label={social.label}>
                                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d={social.path} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Giant embossed wordmark — pure code, no image. textLength stretches
                the word edge-to-edge at every viewport width; the gradient fill +
                faint top stroke give the lit-from-above metal look. */}
            <div className="footer__wordmark" aria-hidden="true">
                <svg viewBox="0 0 1440 265" preserveAspectRatio="xMidYMax meet">
                    <defs>
                        <linearGradient id="footer-wordmark-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#39424f" />
                            <stop offset="0.45" stopColor="#1c222c" />
                            <stop offset="1" stopColor="#0b0f16" />
                        </linearGradient>
                        <linearGradient id="footer-wordmark-edge" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="rgba(255,255,255,0.28)" />
                            <stop offset="0.35" stopColor="rgba(255,255,255,0.05)" />
                            <stop offset="1" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                    </defs>
                    <text
                        className="footer__wordmark-text"
                        x="720"
                        y="252"
                        textAnchor="middle"
                        textLength="1416"
                        lengthAdjust="spacingAndGlyphs"
                        fill="url(#footer-wordmark-fill)"
                        stroke="url(#footer-wordmark-edge)"
                        strokeWidth="1.5"
                    >
                        SAMVESTOR
                    </text>
                </svg>
            </div>
        </footer>
    );
}

export default Footer;
