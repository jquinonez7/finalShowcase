import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "checkInFriends";
const DEMO_DAYS_KEY = "checkInDemoDays";

// { [friendId]: true } for every friend with check-in reminders turned on
async function readMap() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.log("[checkin] read failed:", error.message);
    return {};
  }
}

export async function getCheckInMap() {
  return readMap();
}

export async function getCheckInEnabled(friendId) {
  if (!friendId) return false;
  const map = await readMap();
  return Boolean(map[friendId]);
}

export async function setCheckInEnabled(friendId, enabled) {
  if (!friendId) return;
  const map = await readMap();

  if (enabled) map[friendId] = true;
  else delete map[friendId];

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.log("[checkin] write failed:", error.message);
  }
}

async function readDemoDaysMap() {
  try {
    const raw = await AsyncStorage.getItem(DEMO_DAYS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.log("[checkin] demo days read failed:", error.message);
    return {};
  }
}

// stable per-friend random "days since you last talked", used only to
// demo the check-in button before any real chat history is old enough.
// once real activity actually passes the threshold, this stops mattering
export async function getOrCreateDemoDaysQuiet(friendId) {
  const map = await readDemoDaysMap();
  if (map[friendId]) return map[friendId];

  const days = 3 + Math.floor(Math.random() * 7); // 3-9
  map[friendId] = days;

  try {
    await AsyncStorage.setItem(DEMO_DAYS_KEY, JSON.stringify(map));
  } catch (error) {
    console.log("[checkin] demo days write failed:", error.message);
  }

  return days;
}