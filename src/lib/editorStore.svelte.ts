import { browser } from '$app/environment';
import LZString from 'lz-string';

type Log = { type: 'info' | 'error' | 'warn' | 'system'; content: string };
type Snippet = { label: string; code: string };

let initialCode = 'console.log("Wassup?🥔");';

if (browser) {
	const hash = window.location.hash.slice(1);
	if (hash) {
		try {
			const decompressed = LZString.decompressFromEncodedURIComponent(hash);
			if (decompressed) initialCode = decompressed;
		} catch (e) {
			console.error('Failed to load code from URL', e);
		}
	} else if (localStorage.getItem('potatoCode')) {
		console.log("i will add if god plans..");
	}
}

const savedSnippets = browser && localStorage.getItem('potatoSnippets')
	? JSON.parse(localStorage.getItem('potatoSnippets')!) : [];
const savedTheme = browser && localStorage.getItem('potatoTheme')
	? localStorage.getItem('potatoTheme') : 'dark';
const savedFontSize = browser && localStorage.getItem('potatoFontSize')
	? parseInt(localStorage.getItem('potatoFontSize')!) : 17;

let editorRef = $state<any>(null);
let logs = $state<Log[]>([]);
let autoRun = $state<boolean>(false);
let theme = $state<string>(savedTheme!);
let lang = $state<string>('js');
let fontSize = $state<number>(savedFontSize);
let snippets = $state<Snippet[]>(savedSnippets);
let runCodeCallback: (() => void) | null = null;

export function getEditorStore() {
	return {
		get editorRef() { return editorRef; },
		setEditorRef(ref: any) {
			editorRef = ref;
			if (ref && initialCode) {
				ref.setValue(initialCode);
			}
		},

		get logs() { return logs; },
		clearConsole() { logs = []; },
		addLog(type: 'info' | 'error' | 'warn' | 'system', content: string) {
			logs.push({ type, content });
		},

		get autoRun() { return autoRun; },
		setAutoRun(value: boolean) { autoRun = value; },

		get theme() { return theme; },
		setTheme(value: string) {
			theme = value;
			if (browser) localStorage.setItem('potatoTheme', value);
		},

		get lang() { return lang; },
		setLang(value: string) { lang = value; },

		get fontSize() { return fontSize; },
		setFontSize(value: number) {
			fontSize = value;
			if (browser) localStorage.setItem('potatoFontSize', value.toString());
		},

		get snippets() { return snippets; },
		addSnippet(label: string, code: string) {
			snippets.push({ label, code });
			if (browser) localStorage.setItem('potatoSnippets', JSON.stringify(snippets));
		},

		setRunCodeCallback(callback: () => void) { runCodeCallback = callback; },
		runCode() { if (runCodeCallback) runCodeCallback(); }
	};
}