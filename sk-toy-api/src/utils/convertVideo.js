const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

// Formats that need transcoding to mp4 for browser compatibility
const NEEDS_TRANSCODE = new Set(['.mov', '.avi', '.mkv', '.m4v', '.3gp', '.wmv', '.flv']);

/**
 * Converts a video buffer to mp4 format if needed for browser compatibility.
 * Returns { buffer, originalname, mimetype } with converted values,
 * or the original values if no conversion is needed.
 */
async function convertToMp4(buffer, originalname, mimetype) {
  const ext = path.extname(originalname).toLowerCase();

  if (!NEEDS_TRANSCODE.has(ext)) {
    return { buffer, originalname, mimetype };
  }

  const tmpId = crypto.randomBytes(8).toString('hex');
  const tmpInput = path.join(os.tmpdir(), `input-${tmpId}${ext}`);
  const tmpOutput = path.join(os.tmpdir(), `output-${tmpId}.mp4`);

  try {
    // Write input buffer to temp file
    fs.writeFileSync(tmpInput, buffer);

    // Transcode to mp4 (H.264 video + AAC audio)
    await new Promise((resolve, reject) => {
      ffmpeg(tmpInput)
        .outputOptions([
          '-c:v', 'libx264',
          '-preset', 'medium',        // balanced speed and quality
          '-crf', '20',               // high quality (slightly reduced from visually lossless 17)
          '-profile:v', 'high',       // H.264 High profile for best quality
          '-level', '4.2',            // wide device compatibility
          '-c:a', 'aac',
          '-b:a', '192k',             // high quality audio
          '-ar', '48000',             // 48kHz audio sample rate
          '-movflags', '+faststart',  // enables progressive playback in browser
          '-pix_fmt', 'yuv420p',      // max browser compatibility
        ])
        .output(tmpOutput)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Read the converted file
    const convertedBuffer = fs.readFileSync(tmpOutput);
    const newName = originalname.replace(/\.[^.]+$/, '.mp4');

    return {
      buffer: convertedBuffer,
      originalname: newName,
      mimetype: 'video/mp4',
    };
  } finally {
    // Clean up temp files
    try { fs.unlinkSync(tmpInput); } catch {}
    try { fs.unlinkSync(tmpOutput); } catch {}
  }
}

module.exports = { convertToMp4, NEEDS_TRANSCODE };
