'use client';

import React, { useState, ReactNode } from 'react';

const Accordion = ({ title, content, children }: { title: string; content: string; children?: ReactNode | null }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div>
			<button onClick={() => setIsOpen(!isOpen)} style={{ marginBottom: '10px', cursor: 'pointer' }}>
				{isOpen ? '▼' : '►'} {title}
			</button>

			{isOpen && (
				<div className="pl-8">
					<p className="mb-2">{content}</p>
					<div className="mb-2">{children}</div>
				</div>
			)}
		</div>
	);
};

export default Accordion;
