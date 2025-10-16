// Servicio de Storage para Supabase
import { supabase } from '../lib/supabase';

export const storageService = {
  // ============================================
  // SUBIR ARCHIVOS
  // ============================================
  
  // Subir imagen
  async uploadImage(file, bucket = 'images', path = '') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        data: {
          path: filePath,
          url: urlData.publicUrl,
          fileName: fileName
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Subir audio
  async uploadAudio(file, bucket = 'audios', path = '') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        data: {
          path: filePath,
          url: urlData.publicUrl,
          fileName: fileName
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Subir archivo genérico
  async uploadFile(file, bucket = 'files', path = '') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        data: {
          path: filePath,
          url: urlData.publicUrl,
          fileName: fileName
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // ============================================
  // ELIMINAR ARCHIVOS
  // ============================================
  
  // Eliminar archivo
  async deleteFile(bucket, filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // ============================================
  // OBTENER ARCHIVOS
  // ============================================
  
  // Listar archivos en bucket
  async listFiles(bucket, path = '') {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Obtener URL pública
  getPublicUrl(bucket, filePath) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // ============================================
  // CREAR BUCKETS
  // ============================================
  
  // Crear bucket si no existe
  async createBucket(bucketName, isPublic = true) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
        allowedMimeTypes: isPublic ? ['image/*', 'audio/*', 'video/*'] : null,
        fileSizeLimit: 50 * 1024 * 1024 // 50MB
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // ============================================
  // UTILIDADES
  // ============================================
  
  // Validar tipo de archivo
  validateFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  },

  // Validar tamaño de archivo
  validateFileSize(file, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  // Generar nombre único
  generateUniqueFileName(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${random}.${extension}`;
  },

  // ============================================
  // SUBIR MÚLTIPLES ARCHIVOS
  // ============================================
  
  // Subir múltiples imágenes
  async uploadMultipleImages(files, bucket = 'images', path = '') {
    try {
      const uploadPromises = files.map(file => 
        this.uploadImage(file, bucket, path)
      );

      const results = await Promise.all(uploadPromises);
      
      const successful = results.filter(result => !result.error);
      const failed = results.filter(result => result.error);

      return {
        data: successful.map(result => result.data),
        errors: failed.map(result => result.error),
        successCount: successful.length,
        errorCount: failed.length
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // ============================================
  // COMPRESIÓN DE IMÁGENES
  // ============================================
  
  // Comprimir imagen antes de subir
  async compressImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(resolve, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }
};

export default storageService;
