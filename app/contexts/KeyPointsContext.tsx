import React, { createContext, useContext, useState } from 'react';
import { z } from 'zod';
import { KeyPoint } from '@/types/lectureNote';

interface KeyPointsContextType {
	keyPoints: KeyPoint | null;
	setKeyPoints: React.Dispatch<any>;
	insertNode: (nodes: KeyPoint[], id: string, newNode: KeyPoint[]) => void;
}

const KeyPointsContext = createContext<KeyPointsContextType>({
	keyPoints: null,
	setKeyPoints: () => {},
	insertNode: () => {},
});

export const KeyPointsProvider = ({ children }: { children: React.ReactNode }) => {
	const [keyPoints, setKeyPoints] = useState<KeyPoint | null>(null);

	function insertNode(nodes: KeyPoint[] = keyPoints, id: string, newNode: Partial<KeyPoint>) {
		const newTree = nodes.map((keyPoint: KeyPoint) => {
			console.log(id, keyPoint.id, keyPoint.title, keyPoint.children);
			if (keyPoint.id === id) {
				// Found the target node, apply the update
				if (!keyPoint.children) {
					return { ...keyPoint, children: [newNode] };
				} else {
					return { ...keyPoint, children: [...keyPoint.children, newNode] };
				}
			} else if (keyPoint.children && keyPoint.children.length > 0) {
				// Recursively update children
				return { ...keyPoint, children: insertNode(keyPoint.children, id, newNode) };
			}
			return keyPoint;
		});
		console.log('newTree', newTree);
		// setKeyPoints(newTree);
	}

	return (
		<KeyPointsContext.Provider value={{ keyPoints, setKeyPoints, insertNode }}>{children}</KeyPointsContext.Provider>
	);
};

export const useKeyPointsContext = () => useContext(KeyPointsContext);
