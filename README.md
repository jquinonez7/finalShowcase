<a name="readme-top"></a>
# My Journal
 
Our project aims to raise awareness about mental health issues and foster meaningful social connections directly within Snapchat. Built as a integrated mental health hub, this feature helps Snapchatters stay connected with their support network while providing interactive tools for personal reflection and emotional processing.
 
## Table of Contents

- [Usage](#usage)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Supabase Tables and Buckets](#supabase-tables-and-buckets)
  - [Install & Run](#install--run)
- [License](#license)

## Usage

Check out this brief demo on how to use the feature.
 
### Toggle On &rarr; Choose a Prompt + Mood &rarr; Record!
 
 
https://github.com/user-attachments/assets/ecd55911-0496-44c3-9460-c82389d01f38
 
 
 
 
 
### Save Entries to the Hub

<table>
  <tr>
    <td><img width="130" height="288" alt="IMG_2677 2" src="https://github.com/user-attachments/assets/c022c32e-e224-4e3c-bce2-0f1c9dd69db5" /></td>
    <td><img width="130" height="288" alt="Simulator Screenshot - iPhone 17 - 2026-08-10 at 08 54 53" src="https://github.com/user-attachments/assets/2dcb79af-5e57-4146-ac02-99d9f3e198c7" /></td>
    <td><img width="130" height="288" alt="Simulator Screenshot - iPhone 17 - 2026-08-10 at 08 55 05" src="https://github.com/user-attachments/assets/fec4b61c-0ad4-409b-b9a4-ce126811a9d5" /></td>
  </tr>
</table>

### Send Entries to Friends & Friend Check In

<table>
  <tr>
    <td><img width="130" height="288" alt="IMG_2679 2" src="https://github.com/user-attachments/assets/ca52e5af-c244-4d6f-bd7d-8299e043a5e2" /></td>
    <td><img width="130" height="288" alt="Simulator Screenshot - iPhone 17 - 2026-08-10 at 08 55 27" src="https://github.com/user-attachments/assets/cf18cf99-2923-4f78-88f7-e9b4e1793ac4" /></td>
    <td><img width="130" height="288" alt="Simulator Screenshot - iPhone 17 - 2026-08-10 at 08 56 04" src="https://github.com/user-attachments/assets/2be8613c-0f7a-4cdf-8884-c075ec75cca5" /></td>
    <td><img width="130" height="288" alt="Simulator Screenshot - iPhone 17 - 2026-08-10 at 08 56 15" src="https://github.com/user-attachments/assets/91cf0f6d-06e7-4830-ac6b-d13aa5d60bc6" /></td>
  </tr>
</table>

## Key Features
 
* **Friend Check-In**
  * Automatically sends gentle reminders to reach out if you haven't interacted with someone on your Snapchat best friends list in the past 72 hours.
  * Helps maintain consistent, supportive relationships without the mental burden of keeping track of when you last talked.
* **Reflect Mode**
  * Capture video reflections using Snapchat's camera interface.
  * Flexible post-recording actions to suit your current emotional state:
    * **"Let It Go"** — Instantly delete the entry as a symbolic release of negative emotions.
    * **"Thoughts"** — Share the Snap directly with a trusted friend for advice and support.
    * **"Save to Diary"** — Store the video tagged by emoji mood (e.g., 🙁 &rarr; *Sad*, 😐 &rarr; *Meh*, 😁 &rarr; *Great*) to revisit later as a source of personal encouragement and motivation.
 
## Getting Started

Here are a few simple steps to get our project running on your computer.

### Prerequisites

1. Fork & Clone
 * Fork the above repository, then clone the copy to your computer.
```bash
git clone https://github.com/jackiepantoja78/sea-academy-catalog.git
```
 
2. Set Up Supabase
 * Create a free project at https://supabase.com
 * In your project, go to **Settings → API** and copy the **Project URL**
   and the **anon/public key**
 * Create an `.env.local` on the root. Paste in the following keys with YOUR values.
```js
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-KEY";
```
 
 * In Supabase, go to **Authentication →
   Settings** you may want to turn **off** "Confirm email" so users can
   sign up and log straight in without checking an inbox.
   
### Supabase Tables and Buckets
 
* Enter the **Storage** tab on the left hand side. Create a **New Bucket** and label it **diary_media**.  Make sure to toggle on **Public Bucket**. This is where you will store videos and images taken from the camera.
* Navigate to **Table Editor** on the left hand side. Create a **New Table**, and label it **profiles**. Be sure to make this table and all other tables **Unrestricted**.
Do this by: 
1. Click on the **Table Editor** icon in the left-hand sidebar.
2. Select your table from the list.
3. Click on the **Policies** tab or the three vertical dots next to the table name.
4. Click the **Disable RLS** button (or toggle the RLS switch to **OFF**) and confirm your choice.
Here is a list of the tables that should exist in your Supabase, and some dummy values you can insert:
 
**profiles**:
| Column             | Value                                                                                                                                              |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| id                 | `11111111-1111-1111-1111-111111111111`                                                                                                            |
| created_at         | `2025-01-14 09:12:00+00`                                                                                                                           |
| email              | `awood3@icloud.com`                                                                                                                                |
| birthday           | `2003-04-11`                                                                                                                                        |
| userName           | `Abby`                                                                                                                                              |
| bitmojiUrl         | `https://sdk.bitmoji.com/render/panel/41a01283-c0e3-4b0a-99d1-f7269a38be29-bf805f4d-9775-4138-8615-4126079b03f4-v1.png?transparent=1&palette=1`   |
| bitmoji_profile    | `https://sdk.bitmoji.com/render/panel/1f7f0270-a0f4-4970-8dba-aef8c3ded1ff-bf805f4d-9775-4138-8615-4126079b03f4-v1.png?transparent=1&palette=1`   |
| bitmoji_hub        | `https://sdk.bitmoji.com/render/panel/6808389a-2a12-4bfb-b971-f53c2b5d222e-bf805f4d-9775-4138-8615-4126079b03f4-v1.png?transparent=1&palette=1`   |
| profile-user-name  | `abby-wood`                                                                                                                                          |
 
**messages**:
| Column | Value |
|--------|-------|
| id | `1` |
| created_at | `2026-07-30 19:00:00+00` |
| content | `hey did you see the new update` |
| sender_id | `33333333-3333-3333-3333-333333333333` |
| chat_id | `3` |
| media_url | `https://mvzrfegujbrrnvbqgpzj.supabase.co/storage/v1/object/public/diary_media/65b07d33-955d-4224-bf00-a33545217532/1785898802030.jpg` |
| prompt_text | `What's a truth you've been avoiding lately?` |
| opened | `false` |
| message_type | `chat` |
 
**friends**:
| Column | Value |
|--------|-------|
| id | `1` |
| userID | `33333333-3333-3333-3333-333333333333` |
| friendID | `11111111-1111-1111-1111-111111111111` |
| status | `aaaaaaaa-0000-0000-0000-000000000001` |
| bestfriendStatus | `true` |
| createdAt | `2025-02-01 10:00:00` |
 
**diary_shares**:
| Column | Value |
|--------|-------|
| id | `e1111111-0000-0000-0000-000000000001` |
| diary_id | `d1111111-0000-0000-0000-000000000001` |
| shared_with_user_id | `11111111-1111-1111-1111-111111111111` |
| status | `viewed` |
| created_at | `2026-07-28 21:05:00+00` |
 
**diary_entries**:
| Column | Value |
|--------|-------|
| id | `0a936634-7a8d-4e01-af9c-93a128875a3a` |
| user_id | `85521599-ca7d-432d-b921-8f9d3f0f847b` |
| content | `today was actually such a good day` |
| prompt_text | `What made you smile today, even for a second?` |
| media_url | `https://mvzrfegujbrrnvbqgpzj.supabase.co/storage/v1/object/public/diary_media/85521599-ca7d-432d-b921-8f9d3f0f847b/1785950227405.mp4` |
| privacy_status | `private` |
| created_at | `2026-08-05 17:17:08.718597+00` |
| mood | `great` |
 
**chats**:
| Column | Value |
|--------|-------|
| id | `1` |
| created_at | `2025-02-01 09:00:00+00` |
| chatType | `direct` |
| last_message_at | `2026-08-01 20:15:00` |
| user_a | `11111111-1111-1111-1111-111111111111` |
| user_b | `33333333-3333-3333-3333-333333333333` |
 
### Install & Run

1. Run these commands to launch app
```bash
npm install
npx expo start
```
 
Scan the QR code with the **Expo Go** app (SDK 54 build) on your phone.
Camera access requires a physical device or a simulator with camera
support — it will not work in the web preview. Please allow Expo Go to access your camera
 
[back to top](#readme-top)
 
## License

Distributed under the project_license. See LICENSE.txt for more information.
