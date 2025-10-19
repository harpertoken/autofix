#!/usr/bin/env node
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
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const editor_1 = require("./editor");
const dotenv_1 = require("dotenv");
const package_json_1 = require("../package.json");
// Load .env from project root (traverse up from current directory)
function findEnvFile(startDir) {
    let currentDir = startDir;
    const root = path.parse(startDir).root;
    while (currentDir !== root) {
        const envPath = path.join(currentDir, '.env');
        if (fs.existsSync(envPath)) {
            return envPath;
        }
        currentDir = path.dirname(currentDir);
    }
    return null;
}
const envPath = findEnvFile(process.cwd()) || path.join(__dirname, '../.env');
(0, dotenv_1.config)({ path: envPath });
const program = new commander_1.Command();
program
    .name('autofix')
    .description('AI-powered text completion editor for the command line')
    .version(package_json_1.version);
program
    .command('new')
    .description('Create a new document')
    .option('-m, --mode <mode>', 'completion mode: word, sentence, paragraph', 'sentence')
    .option('-s, --style <style>', 'writing style: casual, formal, creative, technical', 'casual')
    .option('-o, --output <file>', 'output file path')
    .action(async (options) => {
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY required');
        console.error('Set in .env file or export GEMINI_API_KEY=your_key');
        process.exit(1);
    }
    const editor = new editor_1.TextEditor({
        mode: options.mode,
        style: options.style,
        outputFile: options.output,
    });
    await editor.start();
});
program
    .command('edit <file>')
    .description('Edit an existing file')
    .option('-m, --mode <mode>', 'completion mode: word, sentence, paragraph', 'sentence')
    .option('-s, --style <style>', 'writing style: casual, formal, creative, technical', 'casual')
    .action(async (file, options) => {
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY required');
        console.error('Set in .env file or export GEMINI_API_KEY=your_key');
        process.exit(1);
    }
    if (!fs.existsSync(file)) {
        console.error(`❌ File not found: ${file}`);
        process.exit(1);
    }
    const content = fs.readFileSync(file, 'utf-8');
    const editor = new editor_1.TextEditor({
        mode: options.mode,
        style: options.style,
        initialContent: content,
        outputFile: file,
    });
    await editor.start();
});
program.parse(process.argv);
