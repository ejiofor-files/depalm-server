const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = 'room-media';

async function uploadFile({ fileBuffer, originalname, mimetype, roomId, index = 0 }) {
  if (!fileBuffer) throw new Error('fileBuffer is required');
  const timestamp = Date.now();
  const sanitized = originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `rooms/${roomId}/${index}-${timestamp}-${sanitized}`;

  const { data, error } = await supabase.storage.from(BUCKET).upload(path, fileBuffer, {
    contentType: mimetype,
    upsert: false,
  });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  return {
    path: data.path,
    url: urlData.publicUrl,
    type: mimetype.startsWith('video') ? 'video' : 'image',
  };
}

async function deleteFile(path) {
  if (!path) throw new Error('path is required');
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

module.exports = {
  uploadFile,
  deleteFile,
};
