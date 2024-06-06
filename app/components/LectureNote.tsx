import { useActions, readStreamableValue } from 'ai/rsc';
import { LectureNote, KeyPoint } from '@/types/lectureNote';
import { useEffect, useRef, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { KeyPointsProvider, useKeyPointsContext } from '@/contexts/KeyPointsContext';

export const LectureNoteComponent = ({ lectureNote }: { lectureNote: LectureNote }) => {
	return (
		<>
			<section className="mb-4">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Summary</h2>
				<p>{lectureNote.summary}</p>
			</section>
			<section className="mb-4">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Logistics</h2>
				<p>{lectureNote.logistic}</p>
			</section>

			<section className="mb-4">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Points</h2>
				<Accordion type="multiple" className="w-full">
					{lectureNote.children?.map((keyPoint: KeyPoint, index: number) => (
						<AccordionItem value={keyPoint?.title + index} key={keyPoint?.title + index}>
							<KeyPointComponent key={index} keyPoint={keyPoint} />
						</AccordionItem>
					))}
				</Accordion>
			</section>
		</>
	);
};

const KeyPointComponent = ({ keyPoint }: { keyPoint: KeyPoint }) => {
	const { generateMore } = useActions();
	const { keyPoints, insertNode } = useKeyPointsContext();
	const [children, setChildren] = useState<KeyPoint[]>([]);
	const [buttonPosition, setButtonPosition] = useState({ visible: false, x: 0, y: 0 });
	const textRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		if (keyPoint?.children) {
			setChildren(keyPoint?.children);
		} else {
			setChildren([]);
		}
	}, [keyPoint?.children]);

	const handleTextSelection = () => {
		const selection = window.getSelection();
		if (!selection?.rangeCount) return;

		const range = selection.getRangeAt(0);
		const rects = range.getClientRects(); // Get the list of rectangles

		// Check if the text is selected and it is within our component
		if (selection.toString() && rects.length > 0 && textRef.current?.contains(range.commonAncestorContainer)) {
			// Calculate position for the tooltip button
			const firstRect = rects[0];

			setButtonPosition({
				visible: true,
				x: firstRect.left + window.scrollX, // Align button to start of the text selection
				y: firstRect.top + window.scrollY - 40, // 40px above the selection
			});
		} else {
			setButtonPosition((prev) => ({ ...prev, visible: false }));
		}
	};

	const handleAddChild = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.stopPropagation();
		setButtonPosition((prev) => ({ ...prev, visible: false }));
		const text = window.getSelection()?.toString();
		console.log('clicked', text);
		window.getSelection()?.removeAllRanges(); // Remove selection after action
		if (text) {
			const { object } = await generateMore(`Explain: ${text}. Context: ${keyPoint.content}`);

			for await (const partialObject of readStreamableValue<any>(object)) {
				if (partialObject) {
					setChildren([...children, partialObject.KeyPoint as KeyPoint]);
				}
			}
		}
	};

	// Effect to bind and unbind the global click listener
	// useEffect(() => {
	// 	// Handle global click to potentially hide the button
	// 	const handleClickOutside = (event: MouseEvent) => {
	// 		console.log('listen');
	// 		if (!textRef.current?.contains(event.target as Node)) {
	// 			setButtonPosition((prev) => ({ ...prev, visible: false }));
	// 		}
	// 	};
	// 	document.addEventListener('click', handleClickOutside, true); // Capture during the capture phase
	// 	return () => {
	// 		document.removeEventListener('click', handleClickOutside, true);
	// 	};
	// }, []);

	return (
		<div>
			<AccordionTrigger>{keyPoint?.title}</AccordionTrigger>
			<AccordionContent>
				<p ref={textRef} className="select-text whitespace-pre-wrap" onMouseUp={handleTextSelection}>
					{keyPoint?.content}
				</p>
				{buttonPosition.visible && (
					<Button
						onClick={(e) => handleAddChild(e)}
						className="absolute bg-gray-500 hover:bg-gray-700"
						style={{ position: 'absolute', left: `${buttonPosition.x}px`, top: `${buttonPosition.y}px` }}>
						Know More
					</Button>
				)}
				<Accordion type="multiple" className="w-full">
					{children && children.length > 0 && (
						<>
							{children?.map((child: KeyPoint, index: number) => (
								<AccordionItem value={keyPoint?.title + index} key={keyPoint?.title + index}>
									<KeyPointComponent key={index} keyPoint={child} />
								</AccordionItem>
							))}
						</>
					)}
				</Accordion>
			</AccordionContent>
		</div>
	);
};
