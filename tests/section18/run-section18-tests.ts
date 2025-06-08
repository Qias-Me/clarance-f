/**
 * Section 18 Test Runner
 * 
 * Comprehensive test runner for Section 18 with enhanced monitoring and reporting
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestRunOptions {
  browser?: string;
  headed?: boolean;
  debug?: boolean;
  workers?: number;
  retries?: number;
  timeout?: number;
  grep?: string;
  reporter?: string;
}

class Section18TestRunner {
  private options: TestRunOptions;
  private testResultsDir: string;

  constructor(options: TestRunOptions = {}) {
    this.options = {
      browser: 'chromium',
      headed: false,
      debug: false,
      workers: 1,
      retries: 0,
      timeout: 120000,
      reporter: 'html',
      ...options
    };
    
    this.testResultsDir = 'test-results/section18';
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    const dirs = [
      this.testResultsDir,
      path.join(this.testResultsDir, 'console-logs'),
      path.join(this.testResultsDir, 'screenshots'),
      path.join(this.testResultsDir, 'videos'),
      path.join(this.testResultsDir, 'traces')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private buildPlaywrightCommand(): string[] {
    const cmd = ['npx', 'playwright', 'test'];
    
    // Test directory
    cmd.push('tests/section18');
    
    // Browser selection
    if (this.options.browser) {
      cmd.push('--project', this.options.browser);
    }
    
    // Headed mode
    if (this.options.headed) {
      cmd.push('--headed');
    }
    
    // Debug mode
    if (this.options.debug) {
      cmd.push('--debug');
    }
    
    // Workers
    if (this.options.workers) {
      cmd.push('--workers', this.options.workers.toString());
    }
    
    // Retries
    if (this.options.retries) {
      cmd.push('--retries', this.options.retries.toString());
    }
    
    // Timeout
    if (this.options.timeout) {
      cmd.push('--timeout', this.options.timeout.toString());
    }
    
    // Grep pattern
    if (this.options.grep) {
      cmd.push('--grep', this.options.grep);
    }
    
    // Reporter
    if (this.options.reporter) {
      cmd.push('--reporter', this.options.reporter);
    }
    
    // Configuration file
    cmd.push('--config', 'tests/section18/playwright.config.ts');
    
    return cmd;
  }

  async runTests(): Promise<void> {
    console.log('🚀 Starting Section 18 Comprehensive Tests...\n');
    
    console.log('📋 Test Configuration:');
    console.log(`   Browser: ${this.options.browser}`);
    console.log(`   Headed: ${this.options.headed}`);
    console.log(`   Debug: ${this.options.debug}`);
    console.log(`   Workers: ${this.options.workers}`);
    console.log(`   Retries: ${this.options.retries}`);
    console.log(`   Timeout: ${this.options.timeout}ms`);
    console.log(`   Reporter: ${this.options.reporter}`);
    if (this.options.grep) {
      console.log(`   Grep: ${this.options.grep}`);
    }
    console.log('');

    const startTime = Date.now();
    const command = this.buildPlaywrightCommand();
    
    console.log(`🔧 Running command: ${command.join(' ')}\n`);

    return new Promise((resolve, reject) => {
      const process = spawn(command[0], command.slice(1), {
        stdio: 'inherit',
        shell: true
      });

      process.on('close', (code) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`\n⏱️ Test execution completed in ${duration}ms`);
        
        if (code === 0) {
          console.log('✅ All tests passed successfully!');
          this.generateSuccessReport(duration);
          resolve();
        } else {
          console.log(`❌ Tests failed with exit code: ${code}`);
          this.generateFailureReport(code, duration);
          reject(new Error(`Tests failed with exit code: ${code}`));
        }
      });

      process.on('error', (error) => {
        console.error('❌ Failed to start test process:', error);
        reject(error);
      });
    });
  }

  private generateSuccessReport(duration: number): void {
    const report = {
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      duration,
      configuration: this.options,
      message: 'All Section 18 tests completed successfully'
    };

    fs.writeFileSync(
      path.join(this.testResultsDir, 'execution-report.json'),
      JSON.stringify(report, null, 2)
    );
  }

  private generateFailureReport(exitCode: number, duration: number): void {
    const report = {
      status: 'FAILURE',
      timestamp: new Date().toISOString(),
      duration,
      exitCode,
      configuration: this.options,
      message: `Section 18 tests failed with exit code: ${exitCode}`
    };

    fs.writeFileSync(
      path.join(this.testResultsDir, 'execution-report.json'),
      JSON.stringify(report, null, 2)
    );
  }

  async runSpecificTest(testName: string): Promise<void> {
    this.options.grep = testName;
    await this.runTests();
  }

  async runBasicInfoTests(): Promise<void> {
    console.log('🧪 Running Section 18.1 - Basic Information Tests...');
    this.options.grep = 'Section 18.1';
    await this.runTests();
  }

  async runCurrentAddressTests(): Promise<void> {
    console.log('🧪 Running Section 18.2 - Current Address Tests...');
    this.options.grep = 'Section 18.2';
    await this.runTests();
  }

  async runContactForeignRelationsTests(): Promise<void> {
    console.log('🧪 Running Section 18.3 - Contact and Foreign Relations Tests...');
    this.options.grep = 'Section 18.3';
    await this.runTests();
  }

  async runIntegrationTests(): Promise<void> {
    console.log('🧪 Running Section 18 - Comprehensive Integration Tests...');
    this.options.grep = 'Comprehensive Integration';
    await this.runTests();
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Running All Section 18 Tests...');
    await this.runTests();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options: TestRunOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--browser':
        options.browser = args[++i];
        break;
      case '--headed':
        options.headed = true;
        break;
      case '--debug':
        options.debug = true;
        break;
      case '--workers':
        options.workers = parseInt(args[++i]);
        break;
      case '--retries':
        options.retries = parseInt(args[++i]);
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i]);
        break;
      case '--grep':
        options.grep = args[++i];
        break;
      case '--reporter':
        options.reporter = args[++i];
        break;
    }
  }

  const runner = new Section18TestRunner(options);

  try {
    // Check for specific test commands
    if (args.includes('--basic-info')) {
      await runner.runBasicInfoTests();
    } else if (args.includes('--current-address')) {
      await runner.runCurrentAddressTests();
    } else if (args.includes('--contact-foreign')) {
      await runner.runContactForeignRelationsTests();
    } else if (args.includes('--integration')) {
      await runner.runIntegrationTests();
    } else {
      await runner.runAllTests();
    }
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Export for programmatic use
export { Section18TestRunner, TestRunOptions };

// Run if called directly
if (require.main === module) {
  main();
}
