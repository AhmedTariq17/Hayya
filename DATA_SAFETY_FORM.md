# Hayya - Google Play Data Safety Form Answers

Use this guide when filling out the Data Safety section in Google Play Console.

---

## Overview Questions

### Does your app collect or share any of the required user data types?
**Answer: Yes**

### Is all of the user data collected by your app encrypted in transit?
**Answer: Yes**

### Do you provide a way for users to request that their data be deleted?
**Answer: Yes**
(Users can clear data from Privacy Settings or uninstall the app)

---

## Data Types

### 1. Location

#### Approximate location
- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** Yes (processed but not stored on servers)
- **Required:** Yes (core functionality)
- **Purpose:** App functionality (prayer times calculation)

#### Precise location
- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** Yes (processed but not stored on servers)
- **Required:** Yes (core functionality)
- **Purpose:** App functionality (Qibla direction, accurate prayer times)

---

### 2. App activity

#### App interactions
- **Collected:** Yes (optional - analytics)
- **Shared:** No
- **Ephemeral:** No
- **Required:** No (optional analytics)
- **Purpose:** Analytics (improve app performance)

---

### 3. App info and performance

#### Crash logs
- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** No
- **Required:** No
- **Purpose:** Analytics (fix bugs and improve stability)

#### Diagnostics
- **Collected:** Yes
- **Shared:** No
- **Ephemeral:** No
- **Required:** No
- **Purpose:** Analytics (app performance monitoring)

---

## Data NOT Collected

Check "No" for all of the following:

| Data Type | Collected? |
|-----------|------------|
| Name | No |
| Email address | No |
| User IDs | No |
| Address | No |
| Phone number | No |
| Race and ethnicity | No |
| Political or religious beliefs | No |
| Sexual orientation | No |
| Other personal info | No |
| Financial info | No |
| Health info | No |
| Emails | No |
| SMS or MMS | No |
| Photos | No |
| Videos | No |
| Voice or sound recordings | No |
| Music files | No |
| Other audio files | No |
| Files and docs | No |
| Calendar events | No |
| Contacts | No |
| Web browsing history | No |
| Installed apps | No |
| Other actions | No |
| Search history | No |
| Device identifiers | No |
| Other user-generated content | No |

---

## Data Handling Practices

### Data is collected off-device
**Answer:** No (all data stays on device)

### Data is shared with third parties
**Answer:** No

### Data is processed ephemerally
**Answer:** Yes (for location - used for calculations then discarded)

### Data collected is required or optional
| Data Type | Required/Optional |
|-----------|-------------------|
| Location | Required (core functionality) |
| Crash logs | Optional |
| Analytics | Optional |

---

## Security Practices

### Data encrypted in transit
**Answer:** Yes

### Data encrypted at rest
**Answer:** Yes (on-device storage)

### You can request data deletion
**Answer:** Yes

### Independent security review
**Answer:** No (not required for most apps)

---

## Summary for Copy-Paste

When Google Play asks these questions, use these answers:

```
Q: Does your app collect any user data?
A: Yes

Q: Is all collected data encrypted in transit?
A: Yes

Q: Do you provide a way for users to delete their data?
A: Yes

Q: What data does your app collect?
A: Location (approximate and precise) - for prayer times and Qibla
   Crash logs - for app stability
   App interactions - for analytics (optional)

Q: Is the data shared with third parties?
A: No

Q: Is data collection required or can users opt out?
A: Location is required for core functionality
   Analytics/crash logs are optional

Q: Purpose of data collection?
A: App functionality and analytics only
```

---

## Notes

1. **Location is essential** - Without it, the app cannot calculate prayer times or Qibla direction. This is clearly disclosed in the app.

2. **No advertising** - We don't collect data for advertising purposes.

3. **No account required** - Users don't need to create an account, so no personal info is collected.

4. **Local-first approach** - Almost all data stays on the device. Only anonymous crash reports may be sent.

5. **User control** - Users can disable location in device settings, opt out of analytics in app settings, or clear all data.

---

## Privacy Policy URL

When asked for Privacy Policy URL, use:
```
https://[your-github-username].github.io/hayya-privacy-policy/
```

Or host the `docs/privacy-policy.html` file on any web hosting service.

---

*Last updated: December 18, 2024*
