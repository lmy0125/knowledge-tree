'use client';

import { useEffect, useState } from 'react';
import { useActions, useUIState } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { ClientMessage } from './actions';

export default function Home() {
	const [input, setInput] = useState<string>('');
	const [conversation, setConversation] = useUIState();
	const { continueConversation } = useActions();

	return (
		<div className="relative mx-auto py-32 w-full max-w-md flex flex-col">
			<div className="fixed w-full max-w-md top-0 border border-gray-300 rounded mt-10 shadow-xl p-2 flex justify-around bg-white">
				<textarea
					className="w-1/2"
					value={input}
					onChange={(event) => {
						setInput(event.target.value);
					}}
				/>
				<button
					onClick={async () => {
						if (input !== '') {
							setInput('');
							// setConversation((currentConversation: ClientMessage[]) => [
							// 	...currentConversation,
							// 	{ id: nanoid(), role: 'user', display: input },
							// ]);
							const message = await continueConversation(input);

							setConversation((currentConversation: ClientMessage[]) => [...currentConversation, message]);
						}
					}}>
					Generate
				</button>
			</div>

			<div>
				{conversation.map((message: ClientMessage, index: number) => (
					<div key={index}>
						{message.role}: {message.display}
					</div>
				))}
			</div>
		</div>
	);
}
