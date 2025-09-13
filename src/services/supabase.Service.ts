import { supabase } from "../db/supabase";

export const uploadSubtitle = async (movieId: string, lang: string, file: Buffer) => {
  const fileName = `subs/${movieId}-${lang}.vtt`;
  const { data, error } = await supabase.storage.from("media").upload(fileName, file, {
    contentType: "text/vtt",
    upsert: true, // ghi đè nếu đã tồn tại
  });

  if (error) throw error;

  // Lấy public URL (nếu bucket public)
  const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(fileName);
  return publicUrl.publicUrl;
};


export const getSubtitleUrl = async (movieId: string, lang: string) => {
  const fileName = `subs/${movieId}-${lang}.vtt`;
  const { data, error } = await supabase
    .storage
    .from("media")
    .createSignedUrl(fileName, 60 * 60); // 1 giờ

  if (error) throw error;
  return data.signedUrl;
};
