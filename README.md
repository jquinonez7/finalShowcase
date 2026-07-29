# About The Project

Our project aims to raise awareness about mental health issues and foster meaningful social connections directly within Snapchat. Built as a integrated mental health hub, this feature helps Snapchatters stay connected with their support network while providing interactive tools for personal reflection and emotional processing.

## Key Features

* **Proactive Friend Check-Ins**
  * Automatically sends gentle reminders to reach out if you haven't interacted with someone on your Snapchat best friends list in the past 48 hours.
  * Helps maintain consistent, supportive relationships without the mental burden of keeping track of when you last talked.

* **Interactive Video Diaries**
  * Capture video reflections using Snapchat's camera interface.
  * Flexible post-recording actions to suit your current emotional state:
    * **"Let Go"** — Instantly delete the video entry as a symbolic release of negative emotions.
    * **"Ask for Advice"** — Share the Snap directly with a trusted friend for advice and support.
    * **"Save to Diary"** — Store the video tagged by mood (e.g., *Grateful*, *Hopeful*, *Resilient*) to revisit later as a source of personal encouragement and motivation.


Built With React

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

### Install & Run
1. Run these commands to launch app

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (SDK 54 build) on your phone.
Camera access requires a physical device or a simulator with camera
support — it will not work in the web preview. Please allow Expo Go to access your camera

## Usage
Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

(back to top)

License
Distributed under the project_license. See LICENSE.txt for more information.
