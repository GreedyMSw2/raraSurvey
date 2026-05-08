# 📧 EmailJS Setup Guide for raraSurvey

Follow these steps to receive survey data in your email.

---

## Step 1 — Create a free EmailJS account
Go to https://www.emailjs.com and sign up (free tier allows 200 emails/month).

---

## Step 2 — Add an Email Service
1. In your EmailJS dashboard, go to **Email Services** → **Add New Service**
2. Choose your email provider (Gmail is easiest)
3. Connect your account and click **Save**
4. Copy the **Service ID** (looks like `service_xxxxxxx`)

---

## Step 3 — Create an Email Template
1. Go to **Email Templates** → **Create New Template**
2. Set the **To Email** field to your own email address
3. Paste this as the template body:

```
New Survey Response 🌸

Event:     {{event}}
Time:      {{timestamp}}
Elapsed:   {{elapsed_sec}}s into session

Location:  {{location}}
Feeling:   {{feeling}}

Extra info:
- location_choice: {{location_choice}}
- feeling_label:   {{feeling_label}}
- total_time_sec:  {{total_time_sec}}

User Agent: {{user_agent}}
```

4. Click **Save** and copy the **Template ID** (looks like `template_xxxxxxx`)

---

## Step 4 — Get your Public Key
1. Go to **Account** → **API Keys**
2. Copy your **Public Key**

---

## Step 5 — Paste the keys into script.js
Open `script.js` and fill in the top three lines:

```js
var EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";   // ← paste here
var EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";   // ← paste here
var EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";  // ← paste here
```

---

## What data gets sent?

| Trigger | Event name |
|---|---|
| Shiraa clicks **Yes** | `answered_yes_to_survey` |
| Shiraa clicks **No** | `pressed_no` |
| Location selected | `selected_location` |
| Feeling selected | `selected_feeling` |
| Clicks **Done 🌸** | `survey_completed` ✅ ← main one |

Each email includes: timestamp (Jakarta time), location answer, feeling answer, and how long they spent on the survey.

---

## Files changed
- `script.js` — updated (EmailJS integrated)
- `index.html` — no changes needed
- `style.css` — no changes needed
