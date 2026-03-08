#!/usr/bin/env node
/**
 * Generate minimal valid WAV placeholder files (0.1s silence).
 * WAV PCM format is trivial to construct and universally decodable.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const audioDir = join(__dirname, '..', 'public', 'assets', 'audio');

mkdirSync(audioDir, { recursive: true });

function createSilentWav(durationSeconds = 0.1, sampleRate = 22050, bitsPerSample = 16, numChannels = 1) {
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * blockAlign;
  const fileSize = 36 + dataSize;

  const buf = Buffer.alloc(44 + dataSize);
  let offset = 0;

  // RIFF header
  buf.write('RIFF', offset); offset += 4;
  buf.writeUInt32LE(fileSize, offset); offset += 4;
  buf.write('WAVE', offset); offset += 4;

  // fmt sub-chunk
  buf.write('fmt ', offset); offset += 4;
  buf.writeUInt32LE(16, offset); offset += 4;          // Sub-chunk size (PCM)
  buf.writeUInt16LE(1, offset); offset += 2;            // Audio format (1 = PCM)
  buf.writeUInt16LE(numChannels, offset); offset += 2;
  buf.writeUInt32LE(sampleRate, offset); offset += 4;
  buf.writeUInt32LE(byteRate, offset); offset += 4;
  buf.writeUInt16LE(blockAlign, offset); offset += 2;
  buf.writeUInt16LE(bitsPerSample, offset); offset += 2;

  // data sub-chunk
  buf.write('data', offset); offset += 4;
  buf.writeUInt32LE(dataSize, offset); offset += 4;
  // Remaining bytes are already 0 (silence)

  return buf;
}

// Short silence for SFX, slightly longer for BGM
const sfxWav = createSilentWav(0.1);
const bgmWav = createSilentWav(0.5);

const files = [
  { name: 'bgm.wav', buf: bgmWav },
  { name: 'discover.wav', buf: sfxWav },
  { name: 'success.wav', buf: sfxWav },
];

for (const { name, buf } of files) {
  writeFileSync(join(audioDir, name), buf);
  console.log(`Created ${name} (${buf.length} bytes)`);
}

console.log('Audio placeholders generated.');
