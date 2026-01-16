// Sandbox runner for executing user JavaScript code safely
// This script reads JSON input from stdin, executes user code, and outputs results to stdout

const readline = require('readline');

// Available libraries for user code
const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const Decimal = require('decimal.js');

// Capture console.log for debugging
const logs = [];
const originalConsoleLog = console.log;
console.log = (...args) => {
    logs.push(args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
};

// Read input from stdin
let inputData = '';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    inputData += line;
});

rl.on('close', async () => {
    try {
        const input = JSON.parse(inputData);
        const { code, data } = input;

        if (!code) {
            throw new Error('No code provided');
        }

        // Create execution context with available libraries
        const context = {
            axios,
            _,
            lodash: _,
            moment,
            Decimal,
            data,
            console: { log: console.log }
        };

        // Execute user code with timeout
        const timeoutMs = 5000;
        const result = await executeWithTimeout(code, context, timeoutMs);

        // Output result
        process.stdout.write(JSON.stringify({
            success: true,
            result,
            logs,
        }));
        process.exit(0);

    } catch (error) {
        process.stdout.write(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack,
            logs,
        }));
        process.exit(1);
    }
});

/**
 * Execute user code with timeout
 */
async function executeWithTimeout(code, context, timeoutMs) {
    return new Promise(async (resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`Execution timeout after ${timeoutMs}ms`));
        }, timeoutMs);

        try {
            // Create async function from user code
            const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
            const userFunction = new AsyncFunction(
                'axios', '_', 'lodash', 'moment', 'Decimal', 'data', 'console',
                `
                ${code}
                
                // If user defined processData function, call it
                if (typeof processData === 'function') {
                    return await processData(data);
                }
                
                // Otherwise return data as-is
                return data;
                `
            );

            const result = await userFunction(
                context.axios,
                context._,
                context.lodash,
                context.moment,
                context.Decimal,
                context.data,
                context.console
            );

            clearTimeout(timeout);
            resolve(result);
        } catch (error) {
            clearTimeout(timeout);
            reject(error);
        }
    });
}
