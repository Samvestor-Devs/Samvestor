import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ServicePanel from './ServicePanel';
import './ServicesSection.css';

gsap.registerPlugin(ScrollTrigger);

// Placeholder image (swap with your real per-service images).
const PLACEHOLDER =
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80';

/**
 * Each entry becomes one stacking panel.
 *  - number    : "01" .. "06"
 *  - title     : big heading (supports \n for a line break)
 *  - paragraphs: array of body paragraphs
 *  - image     : right-side image
 *  - bg        : panel background colour
 *  - accent    : "gold" | "white"  -> Book A Call button outline
 */
const SERVICES = [
  {
    number: '01',
    title: 'Performance\nMarketing',
    paragraphs: [
      'We plan, launch and scale paid campaigns across Meta, Google, TikTok and Bing - built around what your brand actually needs, not a generic template. Every rupee you spend is tracked, every decision is tied to data and every move is backed by numbers you can see. No gut feel. No guessing. No wasted budget on audiences that were never going to buy.',
      'We go deep into your funnel, find where the money is leaking and fix it before we scale. From the first test campaign to your highest-revenue month, we are focused on one thing - acquiring customers at the lowest possible cost and scaling what works until your revenue compounds month after month.',
    ],
    image: PLACEHOLDER,
    bg: '#0b1d3a',
    accent: 'gold',
  },
  {
    number: '02',
    title: 'Content & Copywriting',
    paragraphs: [
      'We write the words that do the actual selling - hooks that stop the scroll, ads that pull people in, emails that get opened and landing pages that turn visitors into buyers. Every single word is written with one goal in mind - to make the person reading it take action. Not to sound good. Not to fill space. To sell.',
      'Good copy is not about being clever. It is about understanding exactly what your customer is thinking, meeting them where they are and giving them a clear reason to buy. We dig into your brand, your audience and your product before we write a single line - because strategy-backed words always outperform words written on instinct.',
    ],
    image: PLACEHOLDER,
    bg: '#1a2f52',
    accent: 'white',
  },
  {
    number: '03',
    title: 'Email & WhatsApp Marketing',
    paragraphs: [
      'Your customers are already on WhatsApp and email every single day - the only question is whether they are hearing from you or from your competitor. Most brands either do not show up at all or send messages so generic that people stop opening them after the first week. That is where most of the revenue gets left on the table, and most brands never even realise it.',
      'We build campaigns and flows that feel like they were written for one person, not blasted to a list of thousands. From the first welcome message to the re-engagement sequence that brings lost customers back, every single touchpoint is designed to feel personal, timely and worth reading. The result is simple - more opens, more clicks and more purchases from the audience you have already worked hard to build.',
    ],
    image: PLACEHOLDER,
    bg: '#243d66',
    accent: 'gold',
  },
  {
    number: '04',
    title: 'Creative &\nVisual Lab',
    paragraphs: [
      'From static ads to full creative systems, we build visuals that do more than just look good in the feed. Every graphic, every frame and every design decision is made with one question in mind - will this make someone stop and want to know more. Because in a feed where hundreds of brands are competing for the same three seconds of attention, average visuals are the same as invisible ones.',
      'We do not just make things look pretty. We build creative systems that communicate your offer instantly, convert consistently across every placement and scale without falling apart when your budgets go up. From the first scroll-stopping static to a full library of tested ad creatives, every visual we produce is built around one goal - getting the person looking at it to take action.',
    ],
    image: PLACEHOLDER,
    bg: '#4a6fa5',
    accent: 'gold',
  },
  {
    number: '05',
    title: 'Video Editing',
    paragraphs: [
      'We cut, pace and structure every video with one thing in mind - keeping the person watching until the very last second. In a world where someone can swipe away in under two seconds, every frame has to earn its place. The first second hooks them in, the middle builds the case and the final call-to-action tells them exactly what to do next.',
      'Every video we produce is built specifically for the platform it lives on - because a video that works on TikTok is structured completely differently from one that converts on YouTube or Meta. We understand the nuances of each platform, the attention patterns of each audience and the creative triggers that turn a viewer into a buyer.',
    ],
    image: PLACEHOLDER,
    bg: '#243d66',
    accent: 'gold',
  },
  {
    number: '06',
    title: 'CRO & Funnel Optimization',
    paragraphs: [
      'Getting traffic is the easy part - almost any agency can run ads and send people to your website. What happens after that click is where most brands quietly lose money every single day without realising it. A slow loading page, a confusing layout, a checkout with one too many steps - any one of these can kill a sale that was already halfway done.',
      'We go through every single step of your user journey with a fine tooth comb - from the moment someone lands on your page to the moment they complete a purchase. We test, refine and optimise everything in between. Because when your funnel is tight, every rupee you spend on traffic works harder, your cost per acquisition drops and the revenue you were always capable of generating finally starts to show up in your bank account.',
    ],
    image: PLACEHOLDER,
    bg: '#0b1d3a',
    accent: 'gold',
  },
];

function ServicesSection() {
  const sectionRef = useRef(null);

  // 3D recede: as the NEXT panel scrolls up to the top 25% line, the current
  // (underneath) panel tilts back / scales down in 3D, sinking into the stack.
  useEffect(() => {
    const ctx = gsap.context(() => {
      // desktop only — no 3D recede / dimming on phones (panels just stack)
      const mm = gsap.matchMedia();
      mm.add('(min-width: 901px)', () => {
      const panels = gsap.utils.toArray('.panel', sectionRef.current);

      panels.forEach((panel, i) => {
        if (i === panels.length - 1) return; // last panel stays flat

        const card = panel.querySelector('.panel__card');
        const overlay = panel.querySelector('.panel__overlay');
        if (!card) return;

        // alternate the slight z-rotation so panels don't all lean the same way
        const dir = i % 2 === 0 ? 1 : -1;

        // animate the INNER card (not the sticky panel) so there's no pin/unpin
        // jump; one timeline scrubbed across a full viewport of scroll = a
        // smooth, continuous recede with the dimmer fading in alongside it.
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: panel, // the sticky panel = stable measurement
            // when this panel pins (matches the CSS sticky top: 0 on tall
            // screens, bottom-aligned negative offset on wide screens)
            start: () =>
              'top ' +
              Math.min(
                0,
                window.innerHeight -
                  document.documentElement.clientWidth * (800 / 1440)
              ) +
              'px',
            end: () => '+=' + panel.offsetHeight, // until the next card fully covers it
            scrub: 1, // 1s smoothing — eases toward the scroll position
            invalidateOnRefresh: true,
          },
        });

        tl.to(
          card,
          {
            rotate: 2.0287 * dir, // z-rotation
            rotateX: 18, // tilt back in 3D (elegant, stays within the clip)
            scale: 0.9,
            y: -28, // drift up slightly as it sinks back
            force3D: true,
          },
          0
        );

        if (overlay) tl.to(overlay, { opacity: 0.55 }, 0);
      });

      ScrollTrigger.refresh();
      }); // mm.add
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="services" ref={sectionRef}>
      {SERVICES.map((service) => (
        <ServicePanel key={service.number} {...service} />
      ))}
    </section>
  );
}

export default ServicesSection;
