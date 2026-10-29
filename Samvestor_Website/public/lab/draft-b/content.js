/* ─────────────────────────────────────────────────────────────────────
   Samvestor — site copy

   ── On truth ─────────────────────────────────────────────────────────
   Nothing in this file is invented. There are no client names, no
   testimonials, no spend figures, no ROAS multiples, no "200+ brands",
   no team bios. Every one of those is what a marketing site reaches
   for by default, and not one of them can be written by someone who
   was not in the room.

   What is here instead: what the work consists of, in what order it
   happens, who it suits, who it does not, and what the first month
   looks like. All of it is checkable by the person who does it — and a
   founder learns more from that specificity than from a number they
   have no particular reason to believe.

   Where a figure genuinely belongs, on the work, there is a
   RESULTS constant below left deliberately empty. Fill it in or leave
   the section as it is. Do not let me guess.

   ── On structure ─────────────────────────────────────────────────────
   Eight sections, each a different kind of thing: a position, a list
   of services, a process, a qualification, work, an engagement, an
   objection-handler, a contact. A site that is eight variations on
   "headline plus paragraph" is a deck, not a site.
   ───────────────────────────────────────────────────────────────────── */

/* Real figures go here, or nowhere.

   Each entry is [figure, caption] and renders as a strip above the
   work list. Leave it empty and that strip does not exist — the page
   is complete without it and claims nothing it cannot back. Filling
   it is the one job on this site that cannot be done by someone who
   was not in the account.

   e.g. ['3.1x', 'Blended ROAS, fashion, 90 days']  ← only if true */
export const RESULTS = [];

/* The one video on the site: their own hero film, used as texture in
   the hero and nothing else. 5MB uncompressed — loaded last, only on
   wide screens, and the hero is complete without it. */
export const MEDIA = {
    video: 'media/hero-bg.mp4',
    logo: 'media/sv-logo-white.png',
};

/* The marquee after the hero. Platforms and disciplines they actually
   work in — a list of what is run, not a wall of partner badges
   implying accreditations nobody claimed. */
export const STRIP = [
    'Meta Ads', 'Google Ads', 'Creative Testing', 'Landing Pages',
    'Email Flows', 'WhatsApp', 'Retargeting', 'CRO', 'Attribution',
    'Retention', 'Funnel Design', 'Scaling',
];

/* One pause in a long page. Their own sentence, pulled out and given
   a screen to itself. */
export const BREAK = {
    quote: ['Traffic is the expensive half.', 'The page it lands on', 'is the half ', 'you own.'],
    gold: 2,
    by: 'On where the money is actually lost',
    img: 'media/break-wide.jpg',
};

export const META = {
    name: 'Samvestor',
    email: 'hello@samvestor.in',
    located: 'India',
};

export const HERO = {
    eyebrow: 'Performance marketing for D2C founders · India',
    title: ['We build', 'revenue.'],
    lede:
        'Meta, Google, email and the funnel underneath them — run as one ' +
        'system, measured against one number.',
    hint: 'Move your cursor',
    actions: [
        { label: 'How we work', href: '#process' },
        { label: 'Start a project', href: '#contact', primary: true },
    ],
};

export const SECTIONS = [
    {
        id: 'position',
        nav: 'Position',
        n: '01',
        kicker: 'Position',
        type: 'statement',
        title: ['Most agencies report', 'on impressions.', 'We report on', 'bank transfers.'],
        body:
            'Reach, views, engagements, saves — all real, none of them payroll. ' +
            'We count what reaches the account: revenue, what it cost to get it, ' +
            'and what is left afterwards. A channel that cannot be traced to one ' +
            'of those three stops getting money.',
    },

    {
        id: 'services',
        nav: 'Services',
        n: '02',
        kicker: 'What we do',
        type: 'list',
        title: ['Six things,', 'run as one.'],
        intro:
            'Split across four suppliers these compete with each other. Run ' +
            'together they compound.',
        items: [
            {
                name: 'Paid acquisition',
                meta: 'Meta · Google',
                body:
                    'Account structure, audience architecture, budget decisions taken ' +
                    'daily rather than reviewed monthly, and a creative testing cadence ' +
                    'that keeps producing winners instead of finding one and riding it ' +
                    'into the ground.',
            },
            {
                name: 'Creative & production',
                meta: 'Static · Video · UGC',
                body:
                    'Built as variants against a stated hypothesis, so that a result ' +
                    'tells you something. One-off assets that cannot be compared to ' +
                    'anything teach you nothing, however good they look.',
            },
            {
                name: 'Funnel & CRO',
                meta: 'Landing · Product · Checkout',
                body:
                    'Where most of the money is lost, and the cheapest place to find ' +
                    'it. Traffic is the expensive half; the page it lands on is the ' +
                    'half you own.',
            },
            {
                name: 'Email & WhatsApp',
                meta: 'Flows before campaigns',
                body:
                    'Welcome, abandoned cart, post-purchase, win-back. The flows run ' +
                    'whether or not anyone sends a campaign that week, which is exactly ' +
                    'why they get built first.',
            },
            {
                name: 'Measurement',
                meta: 'Tracking · Attribution',
                body:
                    'Events that fire correctly, attribution whose limits you ' +
                    'understand, and a report short enough to act on. Numbers nobody ' +
                    'acts on are an expense, not an asset.',
            },
            {
                name: 'Retention',
                meta: 'Repeat rate · Cohorts · LTV',
                body:
                    'What makes acquisition affordable. A second purchase changes what ' +
                    'you can afford to pay for the first, and that is the only durable ' +
                    'way to outbid a competitor.',
            },
        ],
    },

    {
        id: 'process',
        nav: 'Process',
        n: '03',
        kicker: 'How we work',
        type: 'steps',
        title: ['From strategy', 'to revenue.'],
        intro: 'Four stages. Nothing goes live until it has been through all of them.',
        items: [
            {
                name: 'Discovery & direction',
                img: 'media/process-discovery.jpg',
                tag: 'Audit',
                meta: 'Week one',
                body:
                    'Audit of the account, the creative, the funnel and the data. We ' +
                    'find where the money is leaking before spending any more of it — ' +
                    'and say so plainly, including when the answer is that the problem ' +
                    'is not advertising.',
            },
            {
                name: 'Strategy & creative',
                img: 'media/process-strategy.jpg',
                tag: 'Plan',
                meta: 'Week two',
                body:
                    'Offer, angles, funnel structure, tracking. Written down before a ' +
                    'rupee goes live, so that when something works it is clear what ' +
                    'worked and it can be done again.',
            },
            {
                name: 'Execution & optimisation',
                img: 'media/process-execution.jpg',
                tag: 'Run',
                meta: 'Week three onward',
                body:
                    'Launch, test, read, adjust — daily, not weekly. Most of the gain ' +
                    'in a performance account is in the speed of that loop rather than ' +
                    'in any single decision inside it.',
            },
            {
                name: 'Scaling & growth',
                img: 'media/process-scaling.jpg',
                tag: 'Scale',
                meta: 'Ongoing',
                body:
                    'Budget moves to what is working, weak points get fixed or cut. ' +
                    'Scaling is mostly the discipline to stop funding things that are ' +
                    'nearly working.',
            },
        ],
    },

    {
        id: 'fit',
        nav: 'Fit',
        n: '04',
        kicker: 'Fit',
        type: 'split',
        title: ['Worth reading', 'before you write.'],
        intro: 'We would rather lose the enquiry here than three months in.',
        yes: {
            head: 'This works when',
            items: [
                'You sell something that already converts for someone, somewhere.',
                'You want to see the account and the numbers, not a monthly slide.',
                'You can ship creative at a weekly cadence, or let us run it.',
                'You are willing to change the page, the offer or the price if that is where the problem turns out to be.',
            ],
        },
        no: {
            head: 'It does not when',
            items: [
                'There is no offer yet and the hope is that ads will create demand.',
                'The goal is reach, engagement, or something to show the board.',
                'You need a return quoted before a single test has run.',
                'Nothing about the product or the site is allowed to change.',
            ],
        },
    },

    {
        id: 'work',
        nav: 'Work',
        n: '05',
        kicker: 'Work',
        type: 'work',
        title: ['Categories we', 'know cold.'],
        intro:
            'What the work is in each, and why it differs. Figures belong in a ' +
            'case study, not printed on a homepage as decoration.',
        items: [
            {
                name: 'Fashion & style',
                img: 'media/work-fashion.jpg',
                meta: 'Meta · Funnels · Email · Retention · CRO',
                body:
                    'High return rates and a crowded feed. The work is in creative ' +
                    'volume, and in the post-purchase flow that makes a second order ' +
                    'cheaper than the first.',
            },
            {
                name: 'FMCG',
                img: 'media/work-fmcg.jpg',
                meta: 'Meta · Creative angles · Retargeting',
                body:
                    'Low ticket, so the whole thing turns on repeat rate and on finding ' +
                    'the angle that makes a familiar product worth a trial.',
            },
            {
                name: 'Bedding & home',
                img: 'media/work-bedding.jpg',
                meta: 'Creative testing · Retargeting · CRO',
                body:
                    'Considered purchase, long window. Retargeting and the product page ' +
                    'carry more of the result than the top of the funnel does.',
            },
            {
                name: 'Footwear & lifestyle',
                img: 'media/work-footwear.jpg',
                meta: 'Google · Meta · Scaling',
                body:
                    'Demand already exists and is searched for, so the job is capture ' +
                    'before it is persuasion — then holding efficiency while the budget ' +
                    'goes up.',
            },
        ],
    },

    {
        id: 'engagement',
        n: '06',
        kicker: 'The first month',
        type: 'timeline',
        title: ['What actually', 'happens.'],
        intro:
            'The same four weeks every time, so you know what you are buying ' +
            'before you buy it.',
        items: [
            ['01', 'Access & audit', 'Ad accounts, analytics, the creative library and whatever past data exists. You get the findings whether or not we end up working together.'],
            ['02', 'Strategy & build', 'Offer, angles, funnel fixes and tracking — signed off by you before anything goes live.'],
            ['03', 'Launch', 'First tests live. Daily reads begin. You can see the account the whole time.'],
            ['04', 'Read & scale', 'What works takes budget. What does not gets cut. The month ends with a written view of where the next one goes.'],
        ],
    },

    {
        id: 'questions',
        nav: 'Questions',
        n: '07',
        kicker: 'Before you ask',
        type: 'faq',
        title: ['The questions', 'we always get.'],
        items: [
            [
                'What return can you promise?',
                'None — and anyone quoting one before seeing your account is guessing. ' +
                'After the audit we will tell you what we think is possible and what it ' +
                'depends on. Sometimes that answer is that your margin cannot support ' +
                'paid acquisition yet.',
            ],
            [
                'Who owns the accounts and the creative?',
                'You do. Accounts stay in your name, creative is handed over, and if we ' +
                'stop working together you keep everything that was built.',
            ],
            [
                'How much creative do you need from us?',
                'As much or as little as you want to make. Most brands start by sending ' +
                'raw footage and product shots, and we handle the rest.',
            ],
            [
                'How soon does it work?',
                'Testing starts in week three. A fair read on direction takes a month, a ' +
                'fair read on scale takes a quarter. Anything faster is noise being ' +
                'reported as a result.',
            ],
            [
                'What does it cost?',
                'It depends on scope and on the budget being managed, so we quote after ' +
                'the audit rather than from a price list. The audit is how we both find ' +
                'out whether this is worth doing at all.',
            ],
        ],
    },
];

export const CONTACT = {
    id: 'contact',
    n: '08',
    kicker: 'Start',
    title: ['Send us', 'your account.'],
    body:
        'We will tell you what we would change in the first thirty days and ' +
        'what we think it is worth. If the answer is that you do not need us ' +
        'yet, you will get that answer too.',
    email: 'hello@samvestor.in',
    note: 'No deck. No discovery call about scheduling a discovery call.',
};
