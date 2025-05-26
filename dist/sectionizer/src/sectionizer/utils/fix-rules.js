/**
 * Fix-rules utility to correct regex patterns in rule files
 * This fixes issues with unterminated character classes and improper bracket escaping
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
// Directory containing rule files
const RULES_DIR = path.join(process.cwd(), 'src', 'sectionizer', 'rules');
/**
 * Fix pattern escaping in a rule file
 * @param filePath Path to the rule file
 */
async function fixRuleFile(filePath) {
    console.log(chalk.blue(`Processing ${path.basename(filePath)}...`));
    try {
        // Read the file content
        const content = await fs.readFile(filePath, 'utf-8');
        // Fix pattern expressions in the file
        const fixedContent = fixPatternExpressions(content);
        // Only write the file if changes were made
        if (content !== fixedContent) {
            await fs.writeFile(filePath, fixedContent, 'utf-8');
            console.log(chalk.green(`  Fixed patterns in ${path.basename(filePath)}`));
        }
        else {
            console.log(chalk.gray(`  No issues found in ${path.basename(filePath)}`));
        }
    }
    catch (error) {
        console.error(chalk.red(`  Error processing ${path.basename(filePath)}:`), error);
    }
}
/**
 * Fix regex pattern expressions in a string
 * @param content Content to fix
 * @returns Fixed content
 */
function fixPatternExpressions(content) {
    // Fix form1[ patterns - common source of unterminated character class errors
    let fixedContent = content.replace(/pattern: \/\^form1\\\\\[/g, 'pattern: /^form1\\\\\\[');
    // Fix other bracket patterns
    fixedContent = fixedContent.replace(/pattern: \/(\^?)\\\\?\[(\d+)\\\\?\]/g, 'pattern: /$1\\\\[$2\\\\]');
    // Fix any unescaped forward slashes in patterns
    fixedContent = fixedContent.replace(/(\w)\/(\w)/g, '$1\\/$2');
    // Fix any incomplete escape sequences for backslashes
    fixedContent = fixedContent.replace(/([^\\])\\([^\\\/])/g, '$1\\\\$2');
    return fixedContent;
}
/**
 * Main function to process all rule files
 */
async function main() {
    try {
        console.log(chalk.cyan('Starting rule file fix script...'));
        // Get all .rules.ts files
        const files = await fs.readdir(RULES_DIR);
        const ruleFiles = files.filter(file => file.endsWith('.rules.ts'));
        console.log(chalk.cyan(`Found ${ruleFiles.length} rule files to process`));
        // Process each file
        for (const file of ruleFiles) {
            const filePath = path.join(RULES_DIR, file);
            await fixRuleFile(filePath);
        }
        console.log(chalk.green('Rule file fix script completed successfully'));
    }
    catch (error) {
        console.error(chalk.red('Error running rule file fix script:'), error);
        process.exit(1);
    }
}
// Run the script directly
main();
export { fixRuleFile, fixPatternExpressions };
