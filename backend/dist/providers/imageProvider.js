import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { nanoid } from 'nanoid';
import { config } from '../config.js';
const execFileAsync = promisify(execFile);
export async function generateImage(input) {
    const enhancedPrompt = buildPrompt(input);
    const response = await runFigureImageScript(input, enhancedPrompt);
    const first = response.data?.[0];
    if (!first?.url && !first?.b64_json) {
        throw new Error('Image provider returned no image.');
    }
    return {
        provider: 'figure-script',
        providerJobId: response.providerJobId ?? response.id ?? nanoid(),
        imageUrl: first.url ?? `data:image/png;base64,${first.b64_json}`
    };
}
async function runFigureImageScript(input, prompt) {
    const scriptPath = config.figureImageScriptPath;
    if (input.mode === 'textToImage') {
        const { stdout, stderr } = await execFileAsync('zsh', [
            '-lc',
            `source ~/.zshrc >/dev/null 2>&1; python3 ${shellEscape(scriptPath)} ${shellEscape(prompt)} --print-json`
        ]);
        return parseScriptResponse(stdout, stderr);
    }
    const tempDir = await mkdtemp(join(tmpdir(), 'tutu-vision-'));
    const inputImagePath = join(tempDir, 'input-image.png');
    await writeReferenceImage(inputImagePath, input);
    const command = input.mode === 'localEdit'
        ? `source ~/.zshrc >/dev/null 2>&1; python3 ${shellEscape(scriptPath)} --edit --image ${shellEscape(inputImagePath)} ${shellEscape(prompt)} --print-json`
        : `source ~/.zshrc >/dev/null 2>&1; python3 ${shellEscape(scriptPath)} --edit --image ${shellEscape(inputImagePath)} ${shellEscape(prompt)} --print-json`;
    const { stdout, stderr } = await execFileAsync('zsh', ['-lc', command], {
        maxBuffer: 10 * 1024 * 1024
    });
    return parseScriptResponse(stdout, stderr);
}
async function writeReferenceImage(filePath, input) {
    if (input.referenceImageBase64) {
        await writeFile(filePath, Buffer.from(input.referenceImageBase64, 'base64'));
        return;
    }
    if (!input.referenceImageUrl) {
        throw new Error('Reference image is required for image-to-image and local editing.');
    }
    const response = await fetch(input.referenceImageUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch reference image: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));
}
function parseScriptResponse(stdout, stderr) {
    const trimmed = stdout.trim();
    if (!trimmed) {
        throw new Error(stderr.trim() || 'Image script returned empty output.');
    }
    try {
        return JSON.parse(trimmed);
    }
    catch (error) {
        throw new Error(`Image script returned invalid JSON: ${trimmed.slice(0, 500)}`);
    }
}
function buildPrompt(input) {
    const segments = [input.prompt, `风格：${input.style}`, `画幅比例：${input.aspectRatio}`];
    if (input.mode && input.mode !== 'textToImage') {
        segments.push(`任务模式：${input.mode === 'imageToImage' ? '图生图' : '局部修改'}`);
    }
    if (input.referenceImageUrl || input.referenceImageBase64) {
        segments.push('参考要求：请严格参考输入图片的主体结构、视角、构图与光线关系。');
    }
    if (input.mode === 'localEdit') {
        if (input.editArea)
            segments.push(`局部修改区域：${input.editArea}`);
        if (input.editStrength)
            segments.push(`修改强度：${input.editStrength}`);
        if (input.editInstruction)
            segments.push(`局部修改说明：${input.editInstruction}`);
        segments.push('保留未指定区域的主体、光影、透视和整体画面关系，只在要求区域做修改。');
    }
    return segments.join('\n');
}
function shellEscape(value) {
    return `'${value.replace(/'/g, `'"'"'`)}'`;
}
