import {
	Button,
	Container,
	Text,
	VerticalSpace,
	TextboxMultiline,
	Toggle,
	render,
} from '@create-figma-plugin/ui';
import { emit } from '@create-figma-plugin/utilities';
import { h, Fragment } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';

import { MessageToUI, MessageToPlugin, TransformOptions } from './types';

function Plugin() {
	const [generatedCode, setGeneratedCode] = useState<string>('');
	const [error, setError] = useState<string | null>(null);
	const [isCopied, setIsCopied] = useState(false);
	const [options, setOptions] = useState<TransformOptions>({
		withStyles: true,
		withVariants: true,
		generateInterface: true,
		useSubzeroProps: true,
	});

	useEffect(() => {
		const handleMessage = (event: MessageEvent<any>) => {
			const message = event.data.pluginMessage as MessageToUI;
			if (!message) return;

			if (message.type === 'error') {
				setError(message.error || 'Unknown error occurred');
				return;
			}

			if (message.type === 'selection') {
				setGeneratedCode(message.code || '');
				setError(null);
			}
		};

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

	const handleCopy = useCallback(() => {
		try {
			const el = document.createElement('textarea');
			el.value = generatedCode;
			el.setAttribute('readonly', '');
			el.style.position = 'absolute';
			el.style.left = '-9999px';
			document.body.appendChild(el);
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);

			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy code to clipboard', err);
			setError('Failed to copy code to clipboard');
		}
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

			<VerticalSpace space='medium' />

			{error && (
				<Fragment>
					<Text style={{ color: 'red' }}>{error}</Text>
					<VerticalSpace space='small' />
				</Fragment>
			)}

			<Button fullWidth onClick={handleTransform}>
				Transform
			</Button>

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
					<Button fullWidth onClick={handleCopy}>
						{isCopied ? '✓ Copied!' : 'Copy Code'}
					</Button>
				</Fragment>
			)}

			<VerticalSpace space='large' />
		</Container>
	);
}

export default render(Plugin);
