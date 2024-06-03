import { z } from 'zod';

export const KeyPoint: z.ZodSchema = z.lazy(() =>
	z.object({
		title: z.string().optional().describe('The title of the key point'),
		content: z.string().optional().describe('The content of the key point'),
		children: z.array(KeyPoint).optional().describe('The sub key points of the key point'),
	})
);

export const LectureNote = z.object({
	summary: z.string().describe('The summary of the lecture'),
	logistic: z.string().describe('The logistic of the lecture, including homework, exam, etc.'),
	children: z.array(KeyPoint).describe('The key points of the lecture'),
});

export type LectureNote = z.infer<typeof LectureNote>;

export type KeyPoint = z.infer<typeof KeyPoint>;

// export interface KeyPoint {
// 	title?: string;
// 	content?: string;
// 	children?: KeyPoint[];
// }
