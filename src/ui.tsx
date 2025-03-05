import {
	Button,
	Container,
	Columns,
	Text,
	VerticalSpace,
	TextboxMultiline,
	Toggle,
} from '@create-figma-plugin/ui';
import { emit } from '@create-figma-plugin/utilities';
import { h, Fragment } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

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
		useSubzeroProps: true,
	});

	useEffect(() => {
		function handleMessage(event: MessageEvent<any>) {
			const message = event.data.pluginMessage as MessageToUI;
			if (!message) return;

			if (message.type === 'error') {
				setError(message.error || 'Unknown error occurred');
				return;
			}

			if (message.type === 'selection') {
				setSelectedComponents(message.components || []);
				if (message.code) {
					setGeneratedCode(message.code);
				}
				setError(null);
			}
		}

		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, []);

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

	const handleOptionChange = useCallback(
		(key: keyof TransformOptions) => (value: boolean) => {
			setOptions(prev => ({ ...prev, [key]: value }));
		},
		[]
	);

	return (
		<Container space='medium'>
			<VerticalSpace space='large' />

			<Text>
				{selectedComponents?.length
					? `Selected ${selectedComponents.length} component(s)`
					: 'Select components in Figma to transform'}
			</Text>

			<VerticalSpace space='medium' />

			<Columns space='small'>
				<Toggle
					value={options.withStyles}
					onValueChange={handleOptionChange('withStyles')}
				>
					Include styles
				</Toggle>
				<Toggle
					value={options.withVariants}
					onValueChange={handleOptionChange('withVariants')}
				>
					Include variants
				</Toggle>
			</Columns>

			<VerticalSpace space='small' />

			<Columns space='small'>
				<Toggle
					value={options.generateInterface}
					onValueChange={handleOptionChange('generateInterface')}
				>
					Generate TypeScript interfaces
				</Toggle>
				<Toggle
					value={options.useSubzeroProps}
					onValueChange={handleOptionChange('useSubzeroProps')}
				>
					Use Subzero props
				</Toggle>
			</Columns>

			<VerticalSpace space='medium' />

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
