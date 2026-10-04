# Tracker

| Feature | Status | Evidence |
| --- | --- | --- |
| Mobile shell | DONE | Expo app with role-based flow shell |
| Role access | DONE | One-tap demo role login and profile switching |
| Search and doctor discovery | DONE | Search query and 10/15/20/25 km chips |
| Appointments | DONE | Appointment booking and duplicate-slot protection |
| Reports and Urdu summary | DONE | Mock processing, safety wording, share action |
| Hospital following | DONE | Follow/unfollow hospital state and relationship tracking |
| Blood notification rule | DONE | Follower notification fan-out for active requests |
| Donor response | DONE | I can help creates a response and updates the request count |
| Fulfillment | DONE | Hospital can mark active request fulfilled |
| Prescription scan and demo price | DONE | OCR result, confidence output, and demo price label |
| Doctor workspace | DONE | Doctor dashboard and shared report review |
| Hospital posts | DONE | Hospital update and blood request posting |
| Manual location fallback | DONE | Search supports manual area selection without location permission |
| Follow-up notification | DONE | Appointment request creates a reminder notification |
| Repository architecture | DONE | Data models, mock repository, API repository, and service abstractions added |
| Mock/API boundary | DONE | `repositoryFactory` can switch mock vs API implementation |
| Backend integration | DONE | ApiRepository with full repository contract methods ready for remote API client |
| Automated tests | DONE | 9 unit test suites (119 tests) + 1 integration suite (7 tests), all passing |
| Connection model UI | DONE | Connect/Pending/Connected/Message buttons, messaging gating by ACCEPTED status |
| Blood notification rule | DONE | Every active hospital follower receives individual notification; FULFILLED/CLOSED/EXPIRED stops notifications |
| Disease-to-speciality search | DONE | Cancer→Oncologist, Brain tumor→Neurologist+Oncologist, Heart/Cardiac→Cardiologist, Orthopedics→Orthopedic Surgeon |
| Secure file storage | TODO | Add secure session/report handling before production deployment |
