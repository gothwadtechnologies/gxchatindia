/**
 * Service for interacting with Gofile.io API
 * Documentation: https://gofile.io/api
 */

export const GofileService = {
  /**
   * Uploads a file to Catbox.moe via our server proxy
   * @param file The file to upload
   * @returns The direct download link for the uploaded file
   */
  uploadFile: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const data = await response.json();
      return data.downloadUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }
};
