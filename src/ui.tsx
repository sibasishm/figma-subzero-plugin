import '!prismjs/themes/prism.css';

import {
	Button,
	Container,
	Columns,
	Text,
	VerticalSpace,
	TextboxMultiline,
} from '@create-figma-plugin/ui';
import { emit } from '@create-figma-plugin/utilities';
import { h, Fragment } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { highlight, languages } from 'prismjs';
import Editor from 'react-simple-code-editor';

import styles from './styles.css';
import {
	InsertCodeHandler,
	MessageToUI,
	MessageToPlugin,
	TransformOptions,
} from './types';

export default function UI() {
	const [selectedComponents, setSelectedComponents] = useState<
		MessageToUI['components']
	>([]);
	const [generatedCode, setGeneratedCode] = useState<string>('');
	const [error, setError] = useState<string | null>(null);
	const [options, setOptions] = useState<TransformOptions>({
		withStyles: true,
		withVariants: true,
		generateInterface: true,
	});

	// Handle messages from the plugin
	window.onmessage = (event: MessageEvent) => {
		const message = event.data.pluginMessage as MessageToUI;

		if (message.type === 'error') {
			setError(message.error || 'Unknown error occurred');
			return;
		}

		if (message.type === 'selection') {
			setSelectedComponents(message.components);
			if (message.code) {
				setGeneratedCode(message.code);
			}
			setError(null);
		}
	};

	const handleTransform = useCallback(() => {
		parent.postMessage(
			{
				pluginMessage: {
					type: 'transform',
					options,
				} as MessageToPlugin,
			},
			'*'
		);
	}, [options]);

	const handleInsertCode = useCallback(() => {
		emit<InsertCodeHandler>('INSERT_CODE', generatedCode);
	}, [generatedCode]);

	return (
		<Container space='medium'>
			<VerticalSpace space='large' />

			<Text>
				{selectedComponents?.length
					? `Selected ${selectedComponents.length} component(s)`
					: 'Select components in Figma to transform'}
			</Text>

			<VerticalSpace space='small' />

			{error && (
				<Fragment>
					<Text style={{ color: 'red' }}>{error}</Text>
					<VerticalSpace space='small' />
				</Fragment>
			)}

			<Columns space='small'>
				<Button fullWidth onClick={handleTransform}>
					Transform
				</Button>
			</Columns>

			<VerticalSpace space='small' />

			{generatedCode && (
				<Fragment>
					<TextboxMultiline
						rows={10}
						value={generatedCode}
						variant='border'
						disabled
					/>
					<VerticalSpace space='small' />
					<Button fullWidth onClick={handleInsertCode}>
						Copy Code
					</Button>
				</Fragment>
			)}

			<VerticalSpace space='large' />
		</Container>
	);
}
