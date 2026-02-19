
# Pre-Launch Smoke Test Checklist

This checklist covers critical functionality to verify before launching HighVibe Retreats to a wider audience.

## Public Site & Waitlist

- [ ] **Homepage:**
  - [ ] Page loads correctly.
  - [ ] All images and text are displayed as expected.
  - [ ] Clicking on role cards (Guide, Host, etc.) opens the waitlist modal.
  - [ ] "Join the Waitlist" button opens the waitlist modal.

- [ ] **Waitlist Modal:**
  - [ ] Submit with an email for the "Seeker" role.
    - [ ] **Result:** On-screen confirmation appears.
    - [ ] **Result:** A confirmation email is received (Seeker version, no code).
    - [ ] **Result:** A new document is created in the `waitlist` collection in Firestore.
  - [ ] Submit with a *new* email for the "Guide" role.
    - [ ] **Result:** On-screen confirmation appears.
    - [ ] **Result:** A confirmation email is received (Provider version, with a Founder Code).
    - [ ] **Result:** A `founderCodes` document is marked as `claimed`.
  - [ ] Submit with the *same* Guide email again.
    - [ ] **Result:** On-screen confirmation appears.
    - [ ] **Result:** **No new email** is sent.
  - [ ] Verify UTM parameters (`?utm_source=test`) are captured and saved to the waitlist document in Firestore.

- [ ] **Static Pages:**
  - [ ] `/terms` loads.
  - [ ] `/privacy` loads.
  - [ ] `/about` loads.
  - [ ] `/contact` loads and form submission works.
  - [ ] `/support` loads.

## User Authentication & Gating (in Launch Mode)

- [ ] **Admin Login:**
  - [ ] Log in with an email from `ADMIN_EMAIL_ALLOWLIST`.
  - [ ] **Result:** Successful login and can access admin pages (`/admin/waitlist`).
- [ ] **Invited User Login:**
  - [ ] In the admin view, mark a "new" waitlist user as "invited".
  - [ ] Log out.
  - [ ] Sign up/Log in with that invited user's email.
  - [ ] **Result:** Successful login and can access the application.
- [ ] **Non-Invited User Login:**
  - [ ] Log out.
  - [ ] Attempt to sign up/log in with a new email that is **not** on the waitlist or is not "invited".
  - [ ] **Result:** User is redirected to the homepage with a "pre-launch access is limited" message. Access is blocked.

## Admin Functionality

- [ ] **Waitlist Admin Page (`/admin/waitlist`):**
  - [ ] Page loads and displays waitlist submissions.
  - [ ] Filtering by email and role works.
  - [ ] "Mark as Invited" action works and updates the user's status in Firestore.
  - [ ] "Export CSV" button successfully downloads a CSV file of the current view.
- [ ] **Contact Submissions Page (`/admin/contact`):**
  - [ ] Page loads and displays contact form submissions.
  - [ ] "Export CSV" button works.

## Core App (as Logged-in User)

- [ ] **Account & Profile:**
  - [ ] View account page (`/account`).
  - [ ] Edit profile page (`/account/edit`) loads with user data.
  - [ ] Make a small change and save it.
    - [ ] **Result:** Change is reflected on the `/account` page.
  - [ ] View public profile (`/u/<slug>`).

- [ ] **Dashboards:**
  - [ ] Navigate to each primary role dashboard (Seeker, Guide, Host, Vendor).
  - [ ] **Result:** All dashboards load without errors.

- [ ] **Logout:**
  - [ ] Click "Log out" from the user menu.
  - [ ] **Result:** User is logged out and redirected to the homepage.
  - [ ] **Result:** Admin pages are no longer accessible.
