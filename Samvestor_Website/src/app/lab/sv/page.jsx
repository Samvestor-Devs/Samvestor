import SvLab from '../../../components/lab/SvLab';

/* Internal concept page — not linked from the navbar and not meant to ship
   as-is. Kept out of search either way. */
export const metadata = {
    title: 'SV — monogram concept',
    robots: { index: false, follow: false },
};

export default function SvLabPage() {
    return <SvLab />;
}
