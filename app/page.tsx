'use client';
export const dynamic = 'force-dynamic';
import { ChangeEvent, useEffect, useState } from 'react';
import { useActions, useUIState } from 'ai/rsc';
import { ClientMessage } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { readStreamableValue } from 'ai/rsc';
import { LectureNoteComponent } from '@/components/LectureNote';
import { LectureNote, KeyPoint } from '@/types/lectureNote';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { unstable_noStore as noStore } from 'next/cache';
import { KeyPointsProvider, useKeyPointsContext } from '@/contexts/KeyPointsContext';
import { FlowChart } from '@/components/FlowChart';
import { ReactFlowProvider } from 'reactflow';
interface StreamedObject {
	lectureNote: LectureNote;
}

export default function Home() {
	noStore();
	const [input, setInput] = useState<string>('');
	const [lectureNote, setLectureNote] = useState<LectureNote>();
	const [openInput, setOpenInput] = useState<boolean>(true);
	const { generateLectureNote } = useActions();

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]; // Get the first file from the input
		if (file && file.type === 'text/plain') {
			// Check if it's a text file
			const reader = new FileReader();

			reader.onload = (e) => {
				setInput(e.target?.result as string); // Set the read content into state
				console.log(e.target?.result);
			};

			reader.onerror = (e) => {
				console.error('Failed to read file!', e);
			};

			reader.readAsText(file); // Read the file content as text
		} else {
			event.preventDefault();
			alert('Please upload a txt file.');
		}
	};

	return (
		<KeyPointsProvider>
			<div className="flex flex-col min-h-screen">
				<Collapsible open={openInput} onOpenChange={setOpenInput}>
					<CollapsibleTrigger>
						<div className="flex justify-end w-full px-10">{openInput ? <ChevronUp /> : <ChevronDown />}</div>
					</CollapsibleTrigger>
					<CollapsibleContent className="sticky top-0 z-10 w-full flex justify-center bg-white border-b-4">
						<div className="border border-gray-300 rounded shadow-xl p-2 flex justify-center bg-white space-x-5">
							<Tabs defaultValue="text" className="w-[400px]">
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="text">Text</TabsTrigger>
									<TabsTrigger value="file">File Upload</TabsTrigger>
								</TabsList>
								<TabsContent value="file">
									<Label htmlFor="transcript">Text File</Label>
									<Input id="transcript" type="file" onChange={(e) => handleFileChange(e)} />
								</TabsContent>
								<TabsContent value="text">
									<Label htmlFor="transcript">Input</Label>
									<Textarea
										value={input}
										placeholder="Type your question here..."
										onChange={(event) => {
											setInput(event.target.value);
										}}
									/>
								</TabsContent>
							</Tabs>
							<Button
								onClick={async () => {
									setOpenInput(false);
									const { object } = await generateLectureNote(input);

									for await (const partialObject of readStreamableValue<StreamedObject>(object)) {
										if (partialObject) {
											setLectureNote(partialObject.lectureNote);
										}
									}
								}}>
								Generate
							</Button>
						</div>
					</CollapsibleContent>
				</Collapsible>

				{lectureNote && (
					<div className="flex justify-center">
						<Tabs defaultValue="graph">
							<TabsList className="grid grid-cols-2 w-[400px]">
								<TabsTrigger value="graph">Graph View</TabsTrigger>
								<TabsTrigger value="markdown">Markdown View</TabsTrigger>
							</TabsList>
							<TabsContent value="markdown">
								<div style={{ width: '95vw' }} className="px-48 max-w">
									<LectureNoteComponent lectureNote={lectureNote} />
								</div>
							</TabsContent>
							<TabsContent value="graph">
								<div style={{ width: '95vw', height: '85vh' }}>
									<ReactFlowProvider>
										<FlowChart lectureNote={lectureNote} />
									</ReactFlowProvider>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				)}
			</div>
		</KeyPointsProvider>
	);
}
