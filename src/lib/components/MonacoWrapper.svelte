<script lang="ts">
    import * as monaco from 'monaco-editor';
    import { onMount, onDestroy, getContext } from 'svelte';
    import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
    import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

    const { setEditorRef, code = 'console.log("Hello potato...")' } = $props();
    const store: any = getContext('editor');

    let container: HTMLDivElement;
    let instance: monaco.editor.IStandaloneCodeEditor;
    let disposables: monaco.IDisposable[] = [];

    onMount(async () => {
        // Load JetBrains Mono font
        const fontFace = new FontFace(
            'JetBrains Mono',
            'url(https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOVkWM.woff2)'
        );

        try {
            await fontFace.load();
            document.fonts.add(fontFace);
            console.log('JetBrains Mono loaded');
        } catch (e) {
            console.error('Font load failed:', e);
        }

        self.MonacoEnvironment = {
            getWorker: (_, label) => {
                if (label === 'typescript' || label === 'javascript') return new tsWorker();
                return new editorWorker();
            }
        };

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            allowNonTsExtensions: true,
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            strict: true,
            noEmit: false
        });

        instance = monaco.editor.create(container, {
    value: code,
    language: store.lang === 'js' ? 'javascript' : 'typescript',
    theme: store.theme === 'dark' ? 'vs-dark' : 'vs',

    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    cursorSmoothCaretAnimation: 'on',
    cursorBlinking: 'smooth',
    renderLineHighlight: 'all',
    renderWhitespace: 'selection',

    fontFamily: 'JetBrains Mono, Consolas, monospace',
    fontLigatures: true,
    fontSize: store.fontSize,
    lineHeight: 1.6,
    letterSpacing: 0.5,

    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    wordBasedSuggestions: 'allDocuments',
    parameterHints: { enabled: true },

    formatOnPaste: true,
    formatOnType: true,
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoIndent: 'full',
    bracketPairColorization: { enabled: true },
    guides: {
        bracketPairs: true,
        indentation: true
    },

    folding: true,
    foldingStrategy: 'auto',
    showFoldingControls: 'mouseover',


    mouseWheelZoom: true,
    links: true,
    matchBrackets: 'always',
    scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
        useShadows: true
    },


    stickyScroll: { enabled: true },
});

        // Force font remeasure after a delay
        setTimeout(() => {
            monaco.editor.remeasureFonts();
            instance.layout();
        }, 100);

        (instance as any).compile = async () => {
            const model = instance.getModel();
            if (!model) return '';

            if (model.getLanguageId() === 'javascript') {
                return model.getValue();
            }

            try {
                const worker = await monaco.languages.typescript.getTypeScriptWorker();
                const client = await worker(model.uri);
                const result = await client.getEmitOutput(model.uri.toString());

                if (!result.outputFiles || result.outputFiles.length === 0) {
                    throw new Error("No output from compiler. Check for syntax errors.");
                }
                return result.outputFiles[0].text;
            } catch (e) {
                console.error("Compilation failed:", e);
                throw e;
            }
        };

        const registerSnippets = (lang: string) => {
            const provider = monaco.languages.registerCompletionItemProvider(lang, {
                provideCompletionItems: () => {
                    const suggestions = store.snippets.map((s: any) => ({
                        label: s.label,
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: s.code,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'User Snippet',
                        range: undefined as any
                    }));
                    return { suggestions };
                }
            });
            disposables.push(provider);
        };

        registerSnippets('javascript');
        registerSnippets('typescript');

        instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            store.runCode();
        });

        setEditorRef(instance);
    });

    $effect(() => {
        if (instance) monaco.editor.setTheme(store.theme === 'dark' ? 'vs-dark' : 'vs');
    });

    $effect(() => {
        if (instance) instance.updateOptions({ fontSize: store.fontSize });
    });

    $effect(() => {
        if (!instance) return;

        const isJs = store.lang === 'js';
        const langId = isJs ? 'javascript' : 'typescript';
        const model = instance.getModel();

        if (model) {
            monaco.editor.setModelLanguage(model, langId);
        }
    });

    onDestroy(() => {
        disposables.forEach(d => d.dispose());
        instance?.dispose();
    });
</script>

<div bind:this={container} class="monaco-wrapper"></div>

<style>
    .monaco-wrapper {
        width: 100%;
        height: 100%;
    }

    :global(.monaco-editor .view-lines) {
        font-family: 'JetBrains Mono', Consolas, monospace !important;
    }
</style>