// TypeScript sandbox runner — strips types, then runs as JavaScript

const readline = require('readline');
const nodeModule = require('node:module');
const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const Decimal = require('decimal.js');

const logs = [];
console.log = (...args) => {
    logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};

/** Light TypeScript type stripping (fallback when built-in API unavailable) */
function stripTypes(code) {
    // Try built-in first (Node 22.12+)
    if (typeof nodeModule.stripTypeScriptTypes === 'function') {
        try { return nodeModule.stripTypeScriptTypes(code); } catch(e) {}
    }
    // Fallback: regex-based stripping for common TS patterns
    let js = code;
    // Remove interface and type alias blocks
    js = js.replace(/\binterface\s+\w+\s*(<[^>]*>)?\s*\{[^}]*\}/g, '');
    js = js.replace(/\btype\s+\w+\s*(<[^>]*>)?\s*=\s*[^;]+;/g, '');
    // Remove type annotations: : Type, : Type[], : Type<T>
    js = js.replace(/:\s*(readonly\s+)?([A-Za-z_$][\w$]*(<[^>]*>)?(\[\])*(\s*\|\s*[A-Za-z_$][\w$]*(<[^>]*>)?(\[\])*)*)/g, '');
    // Remove return type annotations on functions: ): Type {
    js = js.replace(/\)\s*:\s*[A-Za-z_$][\w$<>\[\]|,\s.]*/g, ') ');
    // Remove generic type params from functions/classes: <T>, <T extends ...>
    js = js.replace(/<[A-Za-z_$][\w$,\s extends=]*>/g, '');
    // Remove "as Type" casts (not inside template literals)
    js = js.replace(/\s+as\s+[A-Za-z_$][\w$<>\[\]|.]+/g, '');
    // Remove access modifiers
    js = js.replace(/\b(public|private|protected|readonly|abstract|override)\s+/g, '');
    return js;
}

let inputData = '';
const rl = readline.createInterface({ input: process.stdin, terminal: false });
rl.on('line', line => { inputData += line; });
rl.on('close', async () => {
    try {
        const { code, data } = JSON.parse(inputData);
        if (!code) throw new Error('No code provided');

        const jsCode = stripTypes(code);

        const timeoutMs = 5000;
        const result = await new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
            try {
                const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
                const fn = new AsyncFunction(
                    'axios', '_', 'lodash', 'moment', 'Decimal', 'data', 'console',
                    `${jsCode}\nif (typeof processData === 'function') return await processData(data);\nreturn data;`
                );
                const r = await fn(axios, _, _, moment, Decimal, data, { log: console.log });
                clearTimeout(timeout);
                resolve(r);
            } catch(e) { clearTimeout(timeout); reject(e); }
        });

        process.stdout.write(JSON.stringify({ success: true, result, logs }));
        process.exit(0);
    } catch(e) {
        process.stdout.write(JSON.stringify({ success: false, error: e.message, logs }));
        process.exit(1);
    }
});
