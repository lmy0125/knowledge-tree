import { useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { LectureNote, KeyPoint } from '@/types/lectureNote';

const handleStyle = { left: 10 };

export const SummaryNode = (props: NodeProps<LectureNote>) => {
	const { data } = props;

	return (
		<div className="border-2 border-slate-500 rounded-md w-[800px] p-3">
			<Handle type="target" position={Position.Top} />
			<div>
				<section className="mb-4">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Summary</h2>
					<p>{data.summary}</p>
				</section>
				<section className="mb-4">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Logistics</h2>
					<p>{data.logistic}</p>
				</section>
			</div>
			<Handle type="source" position={Position.Bottom} id="a" />
		</div>
	);
};

export const KeyPointNode = (props: NodeProps<KeyPoint>) => {
	const { data } = props;

	return (
		<div className="border-2 border-slate-500 rounded-md w-[500px] p-3">
			<Handle type="target" position={Position.Top} />
			<div>
				<section className="mb-4">
					<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{data.title}</h3>
					<p className="select-text whitespace-pre-wrap">{data.content}</p>
				</section>
			</div>
			<Handle type="source" position={Position.Bottom} id="a" />
			<Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
		</div>
	);
};
