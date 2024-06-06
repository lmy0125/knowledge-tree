import './globals.css';
import { Inter } from 'next/font/google';
import { AI } from './actions';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
	title: 'ScribeGPT',
	description: 'Generated deatiled lecture notes for self-study and review',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<AI>{children}</AI>
			</body>
		</html>
	);
}
