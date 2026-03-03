import { api } from "./api";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class FileUploadService {
  /**
   * Upload a file directly to R2 using a signed URL
   */
  static async uploadToR2(
    file: File,
    type: "question_image" | "avatar" | "test_attachment" | "bulk_import" | "branding_logo" | "branding_favicon" | "branding_banner",
    tenantId: string,
    token: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ path: string; url: string }> {
    // 1. Get signed URL from API
    const response = await api("/signed-url", {
      method: "POST",
      token,
      tenant: tenantId,
      body: JSON.stringify({
        type,
        filename: file.name,
        content_type: file.type,
        tenant_id: tenantId,
      }),
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to get signed URL");
    }

    const { signed_url, path, url } = response.data;

    // 2. Upload directly to R2
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open("PUT", signed_url);
      xhr.setRequestHeader("Content-Type", file.type);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded * 100) / event.total);
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage,
            });
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          resolve({ path, url });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    });
  }
}
