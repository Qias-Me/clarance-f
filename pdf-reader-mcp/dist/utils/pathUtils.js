import path from 'path';
import fs from 'fs';
// Removed unused import: import { fileURLToPath } from 'url';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
// Default configuration
const DEFAULT_CONFIG = {
    allowAbsolutePaths: false,
    workingDirectory: undefined,
    debugMode: true,
    validationMode: false
};
// Current configuration (can be updated)
let currentConfig = { ...DEFAULT_CONFIG };
// Use a more flexible approach to find the project root
// Try to find the main project directory that contains the workspace folder
const findProjectRoot = () => {
    const cwd = process.cwd();
    // If we're in the pdf-reader-mcp directory, go up one level
    if (cwd.endsWith('pdf-reader-mcp')) {
        return path.resolve(cwd, '..');
    }
    // Look for common project indicators
    const possibleRoots = [
        cwd,
        path.resolve(cwd, '..'),
        path.resolve(cwd, '../..'),
        // Try to find the clarance-f project directory
        'C:\\Users\\Jason\\Desktop\\AI-Coding\\clarance-f'
    ];
    for (const root of possibleRoots) {
        try {
            // Check if this directory contains workspace folder
            const workspacePath = path.join(root, 'workspace');
            if (fs.existsSync(workspacePath)) {
                console.info(`[PDF Reader MCP] Found project root with workspace: ${root}`);
                return root;
            }
        }
        catch (e) {
            // Continue searching
        }
    }
    // Fallback to current directory
    console.warn(`[PDF Reader MCP] Could not find project root with workspace, using: ${cwd}`);
    return cwd;
};
export const PROJECT_ROOT = findProjectRoot();
/**
 * Update the path resolution configuration
 */
export const updatePathConfig = (config) => {
    currentConfig = { ...currentConfig, ...config };
    if (currentConfig.debugMode) {
        console.info(`[PDF Reader MCP] Configuration updated:`, currentConfig);
    }
};
if (currentConfig.debugMode) {
    console.info(`[PDF Reader MCP - pathUtils] Project Root determined from CWD: ${PROJECT_ROOT}`);
}
/**
 * Enhanced path resolution with flexible configuration support.
 * Supports both relative and absolute paths based on configuration.
 * @param userPath The path provided by the user.
 * @returns The resolved absolute path.
 */
export const resolvePath = (userPath) => {
    if (typeof userPath !== 'string') {
        throw new McpError(ErrorCode.InvalidParams, 'Path must be a string.');
    }
    const normalizedUserPath = path.normalize(userPath);
    let resolved;
    // Handle absolute paths if allowed
    if (path.isAbsolute(normalizedUserPath)) {
        if (!currentConfig.allowAbsolutePaths) {
            throw new McpError(ErrorCode.InvalidParams, 'Absolute paths are not allowed. Enable allowAbsolutePaths in configuration.');
        }
        resolved = normalizedUserPath;
    }
    else {
        // Handle relative paths - try multiple base directories
        const baseDir = currentConfig.workingDirectory || PROJECT_ROOT;
        resolved = path.resolve(baseDir, normalizedUserPath);
        // If file doesn't exist in primary location, try alternative locations
        if (!fs.existsSync(resolved)) {
            const alternativeLocations = [
                path.resolve(PROJECT_ROOT, normalizedUserPath),
                path.resolve(process.cwd(), normalizedUserPath),
                path.resolve('C:\\Users\\Jason\\Desktop\\AI-Coding\\clarance-f', normalizedUserPath),
                // Try common download locations
                path.resolve('C:\\Users\\Jason\\Downloads', normalizedUserPath),
                path.resolve('C:\\Users\\Jason\\AppData\\Local\\Temp\\playwright-mcp-output', normalizedUserPath)
            ];
            for (const altPath of alternativeLocations) {
                if (fs.existsSync(altPath)) {
                    resolved = altPath;
                    if (currentConfig.debugMode) {
                        console.info(`[PDF Reader MCP] Found file at alternative location: ${resolved}`);
                    }
                    break;
                }
            }
        }
    }
    if (currentConfig.debugMode) {
        console.info(`[PDF Reader MCP] Enhanced path resolution debug:`);
        console.info(`  User path: ${userPath}`);
        console.info(`  Normalized: ${normalizedUserPath}`);
        console.info(`  Is absolute: ${path.isAbsolute(normalizedUserPath)}`);
        console.info(`  Base directory: ${currentConfig.workingDirectory || PROJECT_ROOT}`);
        console.info(`  Resolved: ${resolved}`);
        console.info(`  Config: ${JSON.stringify(currentConfig)}`);
    }
    // Security check for relative paths only (absolute paths are user's responsibility)
    if (!path.isAbsolute(normalizedUserPath) && !currentConfig.validationMode) {
        const baseDir = currentConfig.workingDirectory || PROJECT_ROOT;
        if (!resolved.startsWith(baseDir) && !resolved.startsWith('C:\\Users\\Jason')) {
            throw new McpError(ErrorCode.InvalidRequest, 'Path traversal detected. Access denied.');
        }
    }
    // Check if file exists
    try {
        fs.accessSync(resolved);
        if (currentConfig.debugMode) {
            console.info(`  File exists: YES`);
        }
    }
    catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        if (currentConfig.debugMode) {
            console.info(`  File exists: NO - ${errorMsg}`);
        }
        throw new McpError(ErrorCode.InvalidRequest, `File not found at '${userPath}'. Resolved path: ${resolved}. Error: ${errorMsg}`);
    }
    return resolved;
};
/**
 * Enable validation mode for SF-86 PDF validation workflows
 */
export const enableValidationMode = () => {
    updatePathConfig({
        allowAbsolutePaths: true,
        debugMode: true,
        validationMode: true
    });
    console.info(`[PDF Reader MCP] Validation mode enabled - absolute paths allowed, debug mode on`);
};
/**
 * Resolve path with absolute path support (for validation workflows)
 */
export const resolvePathWithAbsoluteSupport = (userPath) => {
    // Temporarily enable absolute paths for this resolution
    const originalConfig = { ...currentConfig };
    updatePathConfig({
        allowAbsolutePaths: true,
        validationMode: true,
        debugMode: true
    });
    try {
        return resolvePath(userPath);
    }
    finally {
        // Restore original configuration
        currentConfig = originalConfig;
    }
};
