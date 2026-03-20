import { supabase } from "../../lib/supabase";

export const fetchVideoUrl = async (videoPath) => {
  try {
    const { data, error } = await supabase.storage
      .from("recordings")
      .createSignedUrl(videoPath, 3600); // URL expires in 1 hour

    if (error) throw error;

    return data.signedUrl;
  } catch (error) {
    console.error("Error fetching video:", error);
    throw error;
  }
};
