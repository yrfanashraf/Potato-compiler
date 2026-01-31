interface EditorStore {
	addLog: (type: 'info' | 'error' | 'warn' | 'system', content: string) => void;
	clearConsole: () => void;
}

export function runCode(editor: any, store: EditorStore) {
	if (!editor) return;

	const code = editor.getValue();
	store.clearConsole();


	const originalLog = console.log;
	const originalError = console.error;
	const originalWarn = console.warn;

	try {
		const customConsole = {
			log: (...args: any[]) => {
				store.addLog('info', args.map(a => String(a)).join(' '));
				originalLog(...args);
			},
			error: (...args: any[]) => {
				store.addLog('error', args.map(a => String(a)).join(' '));
				originalError(...args);
			},
			warn: (...args: any[]) => {
				store.addLog('warn', args.map(a => String(a)).join(' '));
				originalWarn(...args);
			}
		};

		const runFunction = new Function('console', code);

		runFunction(customConsole);

		store.addLog('system', '--- Execution Khatam! ---');

	} catch (err: any) {
		store.addLog('error', err.toString());
	}
}