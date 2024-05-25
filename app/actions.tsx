'use server';

import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableUI } from 'ai/rsc';
import { z } from 'zod';
import { createAI, getMutableAIState, streamUI, createStreamableValue } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { ReactNode } from 'react';
import Accordion from './components/Accordion';

export interface ServerMessage {
	role: 'user' | 'assistant';
	content: string;
}

export interface ClientMessage {
	id: string;
	role: 'user' | 'assistant';
	display: ReactNode;
}

export interface Message {
	role: 'user' | 'assistant';
	content: string;
}

interface KeyPoint {
	title: string;
	content: string;
	children?: KeyPoint[];
}

const renderNestedAccordion = (keyPoints: KeyPoint[]) => {
	return keyPoints.map((keyPoint, index) => (
		<Accordion key={index} title={keyPoint.title} content={keyPoint.content}>
			{keyPoint.children && keyPoint.children.length > 0 ? renderNestedAccordion(keyPoint.children) : null}
		</Accordion>
	));
};

export async function continueConversation(input: string): Promise<ClientMessage> {
	'use server';
	const history = getMutableAIState();

	const lectureNoteSchema: z.ZodSchema = z.lazy(() =>
		z.object({
			keyPoints: z.array(keyPoints).optional().describe('The key points of the lecture.'),
		})
	);

	const keyPoints: z.ZodSchema = z.lazy(() =>
		z.object({
			title: z.string().describe('The title of the key point'),
			content: z.string().describe('The content of the key point'),
			children: z.array(keyPoints).describe('The sub key points of the key point'),
		})
	);

	const result = await streamUI({
		model: openai('gpt-3.5-turbo'),
		system:
			'You are a professional note taker. You are tasked with generating a knowledge tree base on a lecture transcript. You need to create detailed notes by summarizing what the speaker says as if you are a high achieving student almost word by word. Start by listing the main key points, and each of them should have children of sub key points, which builds a tree structure of content.',
		messages: [...history.get(), { role: 'user', content: input }],
		text: ({ content, done }) => {
			if (done) {
				history.done((messages: ServerMessage[]) => [...messages, { role: 'assistant', content }]);
			}

			return <span>{content}</span>;
		},
		tools: {
			summarizeLecture: {
				description: 'Generate lecture note from transcript.',
				parameters: lectureNoteSchema,
				generate: async (lectureNoteSchema) => {
					// history.done((messages: ServerMessage[]) => [
					// 	...messages,
					// 	{
					// 		role: 'assistant',
					// 		content: '',
					// 	},
					// ]);
					return lectureNoteSchema.keyPoints.map((keyPoint: KeyPoint, index: number) => (
						<Accordion key={index} title={keyPoint.title} content={keyPoint.content}>
							{keyPoint.children && keyPoint.children.length > 0
								? renderNestedAccordion(keyPoint.children)
								: null}
						</Accordion>
					));
				},
			},
		},
	});

	return {
		id: nanoid(),
		role: 'assistant',
		display: result.value,
	};
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
	actions: {
		continueConversation,
	},
	initialAIState: [],
	initialUIState: [],
});
