'use client';

import { useState } from 'react';
import { useActions, useUIState } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { ClientMessage } from './actions';

export default function Home() {
	const [input, setInput] = useState<string>('');
	const [conversation, setConversation] = useUIState();
	const { continueConversation } = useActions();

	return (
		<div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
			<div>
				{conversation.map((message: ClientMessage, index: number) => (
					<div key={index}>
						{message.role}: {message.display}
					</div>
				))}
			</div>

			<div className="fixed w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2">
				<input
					value={input}
					onChange={(event) => {
						setInput(event.target.value);
					}}
				/>
				<button
					onClick={async () => {
						setInput('');
						setConversation((currentConversation: ClientMessage[]) => [
							...currentConversation,
							{ id: nanoid(), role: 'user', display: input },
						]);

						const message = await continueConversation(input);

						setConversation((currentConversation: ClientMessage[]) => [...currentConversation, message]);
					}}>
					Send Message
				</button>
			</div>
		</div>
	);
}
