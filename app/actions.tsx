'use server';

import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { createAI, getMutableAIState, streamUI, createStreamableValue } from 'ai/rsc';
import { ReactNode } from 'react';
import { LectureNote, KeyPoint } from '@/types/lectureNote';

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

export async function generateLectureNote(input: string) {
	'use server';
	const stream = createStreamableValue();

	(async () => {
		const { partialObjectStream } = await streamObject({
			model: openai('gpt-3.5-turbo'),
			system: `You are a professional professor that are good at explaining terminologies and concepts.
			You are asked to break up a conecept into smaller parts and explain it in detail.
			You are tasked with generating a knowledge tree base on a specific topic.
			You need to create detailed, comprehensive, in-depth notes as if you are teaching a high achieving student step-bt-step.
			 Generate as much content as possible. For the root node, summarize the whole lecture and any logistics that were mentioned. Then create sub nodes on the key points in the lecture,
			  and each of them should have children of sub key points, which builds a tree structure of content.`,
			prompt: input,
			schema: z.object({
				lectureNote: z.object({
					summary: z.string().describe('The general explanation of the topic'),
					logistic: z.string().describe('The logistic of the lecture, such as homework, exam, etc.'),
					children: z
						.array(
							z.object({
								id: z.string().describe('uuid'),
								title: z.string().describe('The title of the key point'),
								content: z.string().describe('The content of the key point'),
								children: z.array(KeyPoint).min(2).describe('The sub key points of the key point'),
							})
						)
						.min(3)
						.describe('The key points of the topic'),
				}),
			}),
			maxTokens: 4096,
		});

		for await (const partialObject of partialObjectStream) {
			stream.update(partialObject);
		}

		stream.done();
	})();

	return { object: stream.value };
}

export async function generateMore(input: string) {
	'use server';
	const stream = createStreamableValue();

	(async () => {
		const { partialObjectStream } = await streamObject({
			model: openai('gpt-3.5-turbo'),
			system:
				'You are a professor that are good at explaining terminologies and concepts. You are tasked with generating more content for a lecture note. You need to provide more detailed explanation for the key points in the lecture. For each key point, provide a detailed explanation of the concept, and any sub concepts that are related to it.',
			prompt: input,
			schema: z.object({
				KeyPoint,
			}),
		});

		for await (const partialObject of partialObjectStream) {
			stream.update(partialObject);
		}

		stream.done();
	})();

	return { object: stream.value };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
	actions: {
		generateLectureNote,
		generateMore,
	},
	initialAIState: [],
	initialUIState: [],
});
