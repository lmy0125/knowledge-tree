'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { useActions, useUIState } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { ClientMessage } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { readStreamableValue } from 'ai/rsc';
import Accordion from './components/Accordion';
import { LectureNoteComponent } from '@/components/LectureNote';
import { LectureNote, KeyPoint } from '@/types/lectureNote';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface StreamedObject {
	lectureNote: LectureNote;
}

export default function Home() {
	const [input, setInput] = useState<string>('');
	const [conversation, setConversation] = useUIState();
	const [lectureNote, setLectureNote] = useState();
	const [openInput, setOpenInput] = useState<boolean>(true);
	const { customUI, generateLectureNote } = useActions();
	const [generation, setGeneration] = useState<string>('');
	console.log(lectureNote);

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
		<div className="flex flex-col min-h-screen">
			<Collapsible open={openInput} onOpenChange={setOpenInput}>
				<CollapsibleTrigger>
					<div className="flex justify-end w-screen px-10">{openInput ? <ChevronUp /> : <ChevronDown />}</div>
				</CollapsibleTrigger>
				<CollapsibleContent className="sticky top-0 z-10 w-full flex justify-center bg-white border-b-4">
					<div className="border border-gray-300 rounded shadow-xl p-2 flex justify-center bg-white space-x-5">
						<Tabs defaultValue="text" className="w-[400px]">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="text">Text</TabsTrigger>
								<TabsTrigger value="file">File Upload</TabsTrigger>
							</TabsList>
							<TabsContent value="file">
								<Label htmlFor="transcript">Transcript</Label>
								<Input id="transcript" type="file" onChange={(e) => handleFileChange(e)} />
							</TabsContent>
							<TabsContent value="text">
								<Label htmlFor="transcript">Transcript</Label>
								<Textarea
									value={input}
									placeholder="Paste your transcript here."
									onChange={(event) => {
										setInput(event.target.value);
									}}
								/>
							</TabsContent>
						</Tabs>
						<Button
							onClick={async () => {
								if (input !== '') {
									setInput('');
									// setConversation((currentConversation: ClientMessage[]) => [
									// 	...currentConversation,
									// 	{ id: nanoid(), role: 'user', display: input },
									// ]);
									const message = await customUI(input);
									setConversation((currentConversation: ClientMessage[]) => [...currentConversation, message]);
								}
							}}>
							Generate
						</Button>
						<Button
							onClick={async () => {
								setOpenInput(false);
								const { object } = await generateLectureNote(input);

								for await (const partialObject of readStreamableValue<StreamedObject>(object)) {
									if (partialObject) {
										setLectureNote(partialObject.lectureNote as any);
										setGeneration(JSON.stringify(partialObject.lectureNote, null, 2));
									}
								}
							}}>
							Ask
						</Button>
					</div>
				</CollapsibleContent>
			</Collapsible>

			<div className="flex-1 p-4 px-48">
				{conversation.map((message: ClientMessage, index: number) => (
					<div key={index}>
						{message.role}: {message.display}
					</div>
				))}
				{lectureNote && <LectureNoteComponent lectureNote={lectureNote} />}
			</div>
		</div>
	);
}
