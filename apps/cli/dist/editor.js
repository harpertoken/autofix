"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextEditor = void 0;
const readline = __importStar(require("readline"));
const gemini_1 = require("./gemini");
const fs = __importStar(require("fs"));
class TextEditor {
    constructor(options) {
        this.text = '';
        this.suggestion = '';
        this.isGenerating = false;
        this.mode = options.mode;
        this.style = options.style;
        this.text = options.initialContent || '';
        this.outputFile = options.outputFile;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> ',
        });
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.rl.on('line', async (input) => {
            await this.handleInput(input);
        });
        this.rl.on('SIGINT', () => {
            this.saveAndExit();
        });
    }
    async handleInput(input) {
        if (input === '.exit' || input === '.quit') {
            this.saveAndExit();
            return;
        }
        if (input === '.save') {
            this.saveFile();
            this.rl.prompt();
            return;
        }
        if (input === '.help') {
            this.showHelp();
            this.rl.prompt();
            return;
        }
        // If there's a suggestion and user pressed Enter on empty input, accept it
        if (this.suggestion && input.trim() === '') {
            this.text += this.suggestion + '\n';
            this.suggestion = '';
            this.rl.prompt();
            return;
        }
        // Clear any previous suggestion
        if (this.suggestion) {
            this.suggestion = '';
        }
        // Add the input to our text
        this.text += input + '\n';
        // Generate AI suggestion
        await this.generateSuggestion();
        this.rl.prompt();
    }
    async generateSuggestion() {
        if (this.isGenerating)
            return;
        this.isGenerating = true;
        try {
            this.suggestion = await (0, gemini_1.generateTextCompletion)(this.text, this.mode, this.style);
            if (this.suggestion) {
                console.log(this.suggestion);
            }
        }
        catch (error) {
            console.error('Generation failed:', error);
        }
        finally {
            this.isGenerating = false;
        }
    }
    showHelp() {
        console.log('Commands:');
        console.log('  .help  - Show help');
        console.log('  .save  - Save to file');
        console.log('  .exit  - Save and exit');
        console.log('  Ctrl+C - Save and exit');
        console.log('Suggestions:');
        console.log('  Type text + Enter for suggestions');
        console.log('  Empty Enter accepts suggestion');
        console.log('  New text gets fresh suggestions');
    }
    saveFile() {
        if (!this.outputFile) {
            console.log('No output file. Use --output flag.');
            return;
        }
        try {
            fs.writeFileSync(this.outputFile, this.text);
            console.log(`Saved: ${this.outputFile}`);
        }
        catch (error) {
            console.error(`Save failed: ${error}`);
        }
    }
    saveAndExit() {
        if (this.text.trim()) {
            this.saveFile();
        }
        this.rl.close();
        process.exit(0);
    }
    async start() {
        console.log('Type text + Enter for suggestions. .help for commands.');
        if (this.text) {
            console.log(this.text);
        }
        this.rl.prompt();
    }
}
exports.TextEditor = TextEditor;
