import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";

import { supabase } from "./supabase";

// must match the bucket name in supabase exactly
const BUCKET = "diary_media";

// copies a capture into storage and returns a link to it. exported so a
// capture going to the hub and to friends only uploads once
export async function uploadMedia(uri, userId) {
  // the camera file has to be read as base64 to upload it
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });

  const isVideo = uri.endsWith(".mov") || uri.endsWith(".mp4");
  const extension = isVideo ? "mp4" : "jpg";
  const contentType = isVideo ? "video/mp4" : "image/jpeg";

  // a folder per user, timestamped so captures dont overwrite
  const path = `${userId}/${Date.now()}.${extension}`;

  // decode() turns the base64 back into bytes
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, decode(base64), { contentType });

  if (error) throw new Error(`storage upload: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// writes a diary row. pass mediaUrl if the file is already uploaded,
// otherwise it uploads first
export async function saveDiaryEntry({
  photoUri,
  videoUri,
  mediaUrl,
  privacyStatus,
  content = null,
  promptText = null,
  mood = null,
}) {
  const uri = photoUri || videoUri;
  if (!uri && !mediaUrl) throw new Error("nothing to save");

  // needed for the folder name and the row's user_id
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) throw new Error("not signed in");

  const url = mediaUrl ?? (await uploadMedia(uri, session.user.id));

  // the row holds the link, not the photo
  const { error } = await supabase.from("diary_entries").insert({
    user_id: session.user.id,
    media_url: url,
    privacy_status: privacyStatus,
    content,
    prompt_text: promptText,
    mood,
  });

  // tagged so the log says which half failed
  if (error) throw new Error(`table insert: ${error.message}`);
}