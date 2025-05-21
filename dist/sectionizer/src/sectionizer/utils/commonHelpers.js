/**
 * Common Helper Functions
 *
 * This module provides utility functions used across the sectionizer to reduce redundancy.
 * It consolidates common operations for file manipulation, string processing, and more.
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import logger from './logging.js';
/**
 * Ensure a directory exists, creating it if necessary
 * @param dirPath Path to the directory
 */
export async function ensureDirectoryExists(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    }
    catch (error) {
        console.error(`Error creating directory ${dirPath}:`, error);
        throw error;
    }
}
/**
 * Save JSON data to a file with proper formatting
 * @param filePath Path to save the file
 * @param data Data to save as JSON
 * @param spaces Number of spaces for indentation (default: 2)
 */
export async function saveJsonToFile(filePath, data, spaces = 2) {
    try {
        const dirPath = path.dirname(filePath);
        await ensureDirectoryExists(dirPath);
        const jsonContent = JSON.stringify(data, null, spaces);
        await fs.writeFile(filePath, jsonContent, 'utf8');
        console.log(chalk.green(`Data successfully saved to ${filePath}`));
    }
    catch (error) {
        console.error(chalk.red(`Error saving data to ${filePath}:`), error);
        throw error;
    }
}
/**
 * Load JSON data from a file
 * @param filePath Path to the JSON file
 * @returns Parsed JSON data
 */
export async function loadJsonFromFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    }
    catch (error) {
        console.error(chalk.red(`Error loading JSON from ${filePath}:`), error);
        throw error;
    }
}
/**
 * Create a deep clone of an object
 * @param obj Object to clone
 * @returns Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Normalize a string by removing special characters and lowercasing
 * @param str String to normalize
 * @returns Normalized string
 */
export function normalizeString(str) {
    if (!str)
        return '';
    return str
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .trim();
}
/**
 * Extract a numeric value from a string
 * @param str String containing a number
 * @param defaultValue Default value if no number is found
 * @returns Extracted number or default value
 */
export function extractNumberFromString(str, defaultValue = 0) {
    if (!str)
        return defaultValue;
    const matches = str.match(/\d+/);
    if (matches && matches.length > 0) {
        return parseInt(matches[0], 10);
    }
    return defaultValue;
}
/**
 * Format a timestamp for logging
 * @returns Formatted timestamp string
 */
export function getFormattedTimestamp() {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
}
/**
 * Log a message with a timestamp and optional color
 * @param message Message to log
 * @param color Optional chalk color function
 */
export function logWithTimestamp(message, color = chalk.white) {
    logger.info(message);
}
/**
 * Group an array by a key or key function
 * @param array Array to group
 * @param keyFn Function to extract the key from each item
 * @returns Record with groups
 */
export function groupBy(array, keyFn) {
    return array.reduce((result, item) => {
        const key = keyFn(item);
        (result[key] = result[key] || []).push(item);
        return result;
    }, {});
}
/**
 * Check if two arrays are equal (same elements in any order)
 * @param arr1 First array
 * @param arr2 Second array
 * @returns True if arrays have the same elements
 */
export function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length)
        return false;
    const set1 = new Set(arr1);
    return arr2.every(item => set1.has(item));
}
/**
 * Memoize a function to cache results (simple version without timeout)
 * @param fn Function to memoize
 * @returns Memoized function
 */
export function memoize(fn) {
    const cache = new Map();
    return ((...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    });
}
/**
 * Batch async operations with a concurrency limit
 * @param items Items to process
 * @param fn Async function to apply to each item
 * @param concurrency Maximum number of concurrent operations
 * @returns Promise resolving to array of results
 */
export async function batchAsync(items, fn, concurrency = 5) {
    const results = [];
    const inProgress = new Set();
    for (const item of items) {
        const promise = (async () => {
            const result = await fn(item);
            results.push(result);
        })();
        inProgress.add(promise);
        promise.then(() => inProgress.delete(promise));
        if (inProgress.size >= concurrency) {
            await Promise.race(inProgress);
        }
    }
    await Promise.all(inProgress);
    return results;
}
/**
 * Sleep for a specified duration
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the duration
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Retry an async function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param initialDelay Initial delay in ms
 * @returns Result of the function
 */
export async function retry(fn, maxRetries = 3, initialDelay = 100) {
    let lastError = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt);
                console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }
    }
    throw lastError;
}
