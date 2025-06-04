import alias from '@rollup/plugin-alias';
import commonjs from 'rollup-plugin-commonjs';
import executable from "rollup-plugin-executable"
import fs from 'fs';
import path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

// Custom plugin to import .prompt files as text
const promptImport = () => ({
    name: 'prompt-import',
    load(id) {
        if (id.endsWith('.prompt')) {
            const content = fs.readFileSync(id, 'utf8');
            return `export default ${JSON.stringify(content)};`;
        }
    }
});

// Read all JavaScript files from the src directory
const production = process.env.NODE_ENV === 'production';

const jxaSrcDir = path.resolve(__dirname, 'src/jxa');
const jxaFiles = fs.readdirSync(jxaSrcDir).filter(file => file.endsWith('.js'));

const buildRollupConfig = (srcDir, file, type) => ({
    input: path.join(srcDir, file),
    output: {
        file: `dist/${type}/${file}`,  // Output to the dist/jxa or dist/js folder
        format: (type == 'js') ? 'es' : 'cjs',         // ES modules for JS, CommonJS for JXA
        banner: (type == 'js') ? '#!/usr/bin/env node' : '#!/usr/bin/env osascript -l JavaScript',
    },
    external: (type === 'js') ? [
        // Mark Node.js modules as external for JS files
        'express', 'body-parser', 'child_process', 'path', 'fs', 'https', 'jsonwebtoken', 'xml2js'
    ] : [],
    plugins: [
        promptImport(),
        alias({
            entries: [
                { find: '~', replacement: path.resolve(__dirname) },
            ]
        }),
        resolve(),
        commonjs(),
        production && terser(),  // minify the output for production build
        executable(), // make the output executable.
        generateWrapperScripts(), // Generate wrapper scripts
    ],
});

// Custom plugin to generate wrapper shell scripts (only for JXA files)
const generateWrapperScripts = () => ({
    name: 'generate-wrapper-scripts',
    writeBundle(options, bundle) {
        // Only generate wrappers for JXA files in the dist/jxa directory
        if (!options.file.startsWith('dist/jxa/')) return;
        
        const distFile = options.file;
        const scriptName = path.basename(distFile, '.js');
        const wrapperPath = `stream-deck/${scriptName}.sh`;
        const absoluteDistPath = path.resolve(__dirname, distFile);
        
        const wrapperContent = `#!/bin/bash\n${absoluteDistPath}\n`;
        
        // Ensure stream-deck directory exists
        const streamDeckDir = path.dirname(wrapperPath);
        if (!fs.existsSync(streamDeckDir)) {
            fs.mkdirSync(streamDeckDir, { recursive: true });
        }
        
        // Write the wrapper script
        fs.writeFileSync(wrapperPath, wrapperContent);
        fs.chmodSync(wrapperPath, 0o755); // Make executable
        
        console.log(`Generated wrapper: ${wrapperPath}`);
    }
});


const jxa = jxaFiles.map((file) => buildRollupConfig(jxaSrcDir, file, 'jxa'));

export default jxa;
