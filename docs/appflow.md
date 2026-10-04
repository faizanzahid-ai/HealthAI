# App Flow

```text
Role login -> role home -> role navigation

Patient -> search -> doctor -> slot -> appointment -> notification
Patient -> reports -> process -> Urdu summary -> explicit share

Donor/patient -> hospital page -> follow
Hospital -> blood -> create request -> follower notifications
Follower -> notification -> request details -> I can help
Hospital -> blood -> request -> response count -> mark fulfilled
```

All paths use a shared in-memory state during a session. Profile mode switching is provided to demonstrate both sides of a cross-role workflow.
