"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.loadConfig = loadConfig;
exports.defaultConfig = {
    defaultMode: 'sentence',
    defaultStyle: 'casual',
    autoSave: false,
    suggestionDelay: 1000,
};
function loadConfig() {
    // In a real implementation, this would load from a config file
    // For now, return defaults
    return exports.defaultConfig;
}
