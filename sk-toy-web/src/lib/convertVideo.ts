import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

const NEEDS_CONVERT = ['video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/x-m4v', 'video/3gpp', 'video/x-ms-wmv', 'video/x-flv'];
const CONVERT_EXTENSIONS = ['.mov', '.avi', '.mkv', '.m4v', '.3gp', '.wmv', '.flv'];

let ffmpeg: FFmpeg | null = null;
let loadPromise: Promise<void> | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;

  if (!loadPromise) {
    ffmpeg = new FFmpeg();
    loadPromise = (async () => {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg!.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    })();
  }

  await loadPromise;
  return ffmpeg!;
}

/**
 * Check if a file needs conversion to MP4.
 */
export function needsConversion(file: File): boolean {
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
  return CONVERT_EXTENSIONS.includes(ext) || NEEDS_CONVERT.includes(file.type);
}

/**
 * Convert a video file to MP4 in the browser using FFmpeg WASM.
 * Returns the original file if it's already MP4 or not a video that needs conversion.
 */
export async function convertToMp4(file: File, onProgress?: (ratio: number) => void): Promise<File> {
  if (!needsConversion(file)) return file;

  const ff = await getFFmpeg();

  if (onProgress) {
    ff.on('progress', ({ progress }) => onProgress(progress));
  }

  const inputName = `input_${Date.now()}${file.name.match(/\.[^.]+$/)?.[0] || '.mov'}`;
  const outputName = `output_${Date.now()}.mp4`;

  try {
    await ff.writeFile(inputName, await fetchFile(file));

    await ff.exec([
      '-i', inputName,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-pix_fmt', 'yuv420p',
      outputName,
    ]);

    const data = await ff.readFile(outputName);
    const mp4Name = file.name.replace(/\.[^.]+$/, '.mp4');
    const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
    const converted = new File([blob], mp4Name, { type: 'video/mp4' });

    // Cleanup
    await ff.deleteFile(inputName);
    await ff.deleteFile(outputName);

    return converted;
  } catch (err) {
    console.error('[convertVideo] Client-side conversion failed:', err);
    // Cleanup on error
    try { await ff.deleteFile(inputName); } catch {}
    try { await ff.deleteFile(outputName); } catch {}
    // Return original file so upload still proceeds
    return file;
  }
}

/**
 * Process an array of files — convert videos that need conversion, pass through the rest.
 */
export async function processFilesForUpload(files: File[], onProgress?: (fileName: string, ratio: number) => void): Promise<File[]> {
  const results: File[] = [];
  for (const file of files) {
    if (needsConversion(file)) {
      const converted = await convertToMp4(file, onProgress ? (r) => onProgress(file.name, r) : undefined);
      results.push(converted);
    } else {
      results.push(file);
    }
  }
  return results;
}
