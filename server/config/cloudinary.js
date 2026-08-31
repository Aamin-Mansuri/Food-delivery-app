export const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'foodrush',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'foodrush_secret',
};

export const uploadToCloudinaryMock = async (fileBuffer, folder = 'foodrush') => {
  // Simulates Cloudinary file upload returning a structured image URL
  const randomId = Math.random().toString(36).substring(7);
  return {
    public_id: `${folder}/${randomId}`,
    secure_url: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80`,
  };
};
