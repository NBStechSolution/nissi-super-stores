/**
 * Utility to downscale and compress images before storing in state or Supabase.
 * Keeps payloads well within browser localStorage limits (~5MB quota)
 * and Supabase REST request payload limits.
 */
export function compressImage(file, maxWidth = 600, maxHeight = 600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target.result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Convert to JPEG format with specified quality (~30-60KB)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for processing.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
