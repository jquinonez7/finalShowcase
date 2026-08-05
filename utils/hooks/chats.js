import { supabase } from "./supabase";

/**
 * Finds the chat between two people, creating one if they have never
 * spoken. Either of them could be user_a, hence the two and() groups.
 */
export async function getOrCreateChat(userId, friendId) {
  const { data: existing, error } = await supabase
    .from("chats")
    .select("id")
    .or(
      `and(user_a.eq.${userId},user_b.eq.${friendId}),` +
        `and(user_a.eq.${friendId},user_b.eq.${userId})`,
    )
    .maybeSingle();

  if (error) throw error;
  if (existing) return existing.id;

  const { data: created, error: createError } = await supabase
    .from("chats")
    .insert({ user_a: userId, user_b: friendId, chatType: "direct" })
    .select("id")
    .single();

  if (createError) throw createError;
  return created.id;
}

/**
 * Sends a capture to one friend as an unopened snap.
 *
 * The media is already in storage by this point, so this only writes
 * the row pointing at it. opened stays false until they tap it, which
 * is what makes the chat list show "New Snap".
 */
export async function sendSnapToFriend({
  userId,
  friendId,
  mediaUrl,
  promptText = null,
}) {
  const chatId = await getOrCreateChat(userId, friendId);

  const { error } = await supabase.from("messages").insert({
    chat_id: chatId,
    sender_id: userId,
    media_url: mediaUrl,
    prompt_text: promptText,
    opened: false,
  });

  if (error) throw new Error(`send snap: ${error.message}`);

  // so the chat list can sort and show how long its been
  await supabase
    .from("chats")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", chatId);

  return chatId;
}

// flips a snap to opened once its been viewed
export async function markSnapOpened(messageId) {
  const { error } = await supabase
    .from("messages")
    .update({ opened: true })
    .eq("id", messageId);

  if (error) console.log("[chat] could not mark opened:", error.message);
}