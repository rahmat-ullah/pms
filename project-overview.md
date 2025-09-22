# Project Management Software — Functional Documentation (Non-Technical)

> **Scope note:** This document elaborates only the features you listed. It avoids technical implementation details and focuses on clear behavior, rules, roles, and workflows.

---

## 1) Employee Profile Management

### 1.1 Overview

Maintain a structured profile for each employee, capturing identity, competencies, and project history. All selectable lists (Projects, Skills, Additional Skills, Hobbies, Roles) are curated by **Admin**; employees only select from these lists.

### 1.2 Profile Fields

* **Image**: Current profile photo.
* **Name**: Full legal/working name.
* **Designation**: Current job title.
* **Skills**: Primary skills selected from the admin-managed catalog.
* **Previous Projects**:

  * **Project list**: Link to one or more system projects.
  * **Timeline of each project**: Start & end dates; **overlaps are allowed** and must be visibly distinguishable.
  * **Used skills**: Multi-select from the skills catalog for each project.
  * **Role in each project**: Selected from an admin-managed “roles” list.
* **Additional Skills**: Optional extended skills from the admin list.
* **Hobby**: Optional interests from the admin list.
* **Rule**: **Admin** owns master data; employees select only from the provided lists.

### 1.3 Permissions & Responsibilities

* **Employee**: View own profile; update image; select skills/additional skills/hobbies; link existing projects to history; view project-level role & used skills.
* **HR / Admin**: Edit any employee profile fields; correct designation; maintain master lists.
* **Manager / Director / Project Lead**: View profiles relevant to their teams/projects.

### 1.4 Behavior & Rules

* Overlapping project periods are supported and shown clearly on timelines.
* Employees cannot introduce new skills/hobbies/projects/roles; requests go to Admin for curation.
* Archiving (handled by HR in another module) preserves all profile data and project history.

### 1.5 Example User Journeys

* **Employee updates skills**: Opens profile → selects skills from catalog → saves.
* **Employee links past project**: Adds project from system list → sets project dates → selects “used skills” & “role”.

---

## 2) Project Management

### 2.1 Overview

Enable staffing, capacity control, collaboration via comments, and shared project documents.

### 2.2 Team & Capacity

* **Add/Remove Employees**: **Manager** and **HR** can add or remove members from a project.
* **Capacity Assignment**: Each member is assigned a **percentage of their personal 100% capacity** per project.
* **Over-Capacity Indicator**: If an employee’s **total active allocations** across projects exceed 100%, show a **red circular halo** around their profile picture wherever it appears to indicate overwork.

### 2.3 Archiving Impact

* **HR** can archive a user. An archived user is **removed from all associated active projects**, but **all project history remains visible** under the employee’s record.

### 2.4 Collaboration (Comments)

* Each project includes a **comment section** for discussion and status notes.
* Comments are viewable by project members (and other roles per organization policy).

### 2.5 Project Documents

* **Allowed Types**: PDF, `.md`, `.txt`, and images.
* **Visibility**: Uploaded documents are viewable by all project members.
* **Deletion**: **Admin** or **Manager** can delete project documents.

### 2.6 Roles & Permissions (Project Scope)

* **Manager**: Add/remove members; set capacity %; delete documents; post/read comments.
* **HR**: Add/remove members; archive users (global effect); view documents and comments.
* **Project Lead**: Post/read comments; view documents; (optional org policy can allow staffing assistance).
* **Employee (Project Member)**: View project; upload allowed documents (if policy permits); post/read comments.
* **Admin**: Full oversight, including document deletion.

### 2.7 Behavior & Rules

* Capacity totals are computed from all **active and time-overlapping** assignments.
* Red capacity halo persists until allocations return to **≤ 100%** total.
* Document deletions by Admin/Manager remove access for all project members.

### 2.8 Example User Journeys

* **Manager staffs project**: Adds members → sets capacity % → visualizes red halos for over-allocated members → adjusts.
* **Team shares files**: Members upload PDFs/images/notes → everyone can view → Manager can delete if needed.
* **Project discussion**: Members post updates/questions in comments.

---

## 3) Employee Management (Attendance, Leave, Work Location, Daily Activity)

### 3.1 Overview

Provide HR with per-employee calendars, policy-based leave tracking, and daily workforce visibility; empower employees to request leave, set work location, and manage breaks with proper approvals.

### 3.2 HR Calendar & Attendance View

* **Per-Employee Calendar**: HR can mark **Casual**, **Sick**, **Annual**, or **Other** leave types.
* **Attendance Metrics**: HR can see **working days elapsed**, **presence**, and counts of leave taken per category.

### 3.3 Leave Balances & Requests

* **Policy-Based Balances**: Each employee is assigned **Casual/Sick/Annual** leave balances based on organizational policy.
* **Employee Self-Service**: Regular employees can log in and **request leave**, selecting a leave category; the **current balance** per category is shown to the user.
* **Approvals**: Leave and work-location changes **must be approved** by the designated approvers (see 3.6).

### 3.4 Work Location & Daily Start/End

* **Start Work**: Employee logs in and **starts work** by selecting **Home**, **Office**, or **Other**.
* **Breaks**: Employee uses **Break** to start and **Back** to end breaks.
* **Time Adjustments**:

  * Only **HR** and **Director** can directly modify **break/start/end** times.
  * Employees submit **time change requests** with reasons; **HR**, **Manager**, or **Director** can approve.

### 3.5 Visibility for HR & Directors

* **Daily Workforce Table**: HR and Directors can see:

  * Who is working today.
  * Who is on leave (with type).
  * Who is working from **Home**, **Office**, or **Other**.
* **Access to Records**: HR and Directors can view **any employee’s records**.

### 3.6 Approvals (Leave & Work-Location & Time Changes)

* **Leave Requests**: Require approval by **HR, Manager, Director (Technical or Program), or Project Lead** (any one approver suffices, per policy).
* **Work From Home / Work From Office / Other**: Same approver set as above (any one).
* **Time Change Requests**: Approver can be **HR**, **Manager**, or **Director** (any one).

### 3.7 Project Member Status Check

* Employees can view the **status of project members** for their **active projects** (e.g., present/leave and work location).

### 3.8 Messaging

* **Anyone can send a message to any user** for queries within the organization directory (direct, user-to-user).

### 3.9 Example User Journeys

* **Employee requests sick leave**: Opens leave page → selects **Sick** → submits → approver reviews → balance updates upon approval.
* **Employee starts day**: Chooses **Office** → works → takes **Break** → **Back** → ends day.
* **Time correction**: Employee submits a **time change request** with reason → HR/Manager/Director approves → records update.

---

## 4) User Management

### 4.1 Overview

Provision and maintain user accounts and access details.

### 4.2 User Creation & Credentials

* **Who can add users**: **HR, Manager, or Directors** add users and **share credentials** with them.

### 4.3 Updating User Information

* **HR and Directors** can **change any user’s information**, **including their passwords**.

### 4.4 Notes

* Role assignments and access align with the modules above.
* Admin retains overarching governance per organizational policy (e.g., master lists, global settings).

---

## 5) Finance

### 5.1 Overview

Support expense submission by employees and ensure proper approvals.

### 5.2 Expense Requests

* **Who can request**: **Any user** can submit an expense request.
* **Request details**: Title/description, amount, category, date, related project (optional), and attachments (e.g., receipts).

### 5.3 Approval Flow

* **Finance Review**: Finance users review and approve/reject.
* **CEO Approval**: Final approval by **CEO** after Finance approval.
* **Outcome**: Request is either fully approved (Finance → CEO) or rejected at any stage; the decision and remarks are recorded.

### 5.4 Other Finance Activities

* Space reserved for additional finance activities (e.g., viewing historical approvals, summaries) in line with organizational practices.

### 5.5 Example User Journey

* **Employee submits expense** → Finance reviews and approves → CEO provides final approval → requester is notified of the outcome.

---

## 6) Common Behaviors & Visual Indicators

### 6.1 Capacity Halo

* If an employee’s total active allocations exceed **100%**, a **red circular halo** appears around their profile picture throughout the system (profiles, project rosters, lists).

### 6.2 Archiving

* **HR** archives a user → user is **removed from all active projects** → **all project history remains** in the employee’s record.

### 6.3 Documents (Projects)

* **Upload**: PDF, `.md`, `.txt`, and images are supported and viewable by all project members.
* **Delete**: **Admin** or **Manager** can delete documents when required.

### 6.4 Calendars & Balances

* HR maintains per-employee calendars and assigns balances per policy.
* Leave balance only reduces upon **approval** of the request.

### 6.5 Messaging

* Direct, user-to-user messaging is available for queries.

---

## 7) Roles Summary (Across Modules)

| Role                             | Key Abilities (within the defined features)                                                                                                                                                                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Employee**                     | Maintain own profile selections; request leave; start/end work; take breaks; submit time change requests; see balances; view active project members’ status; upload/view project docs (as permitted); comment; message any user.                                              |
| **Manager**                      | Add/remove project members; assign capacity %; delete project documents; approve leave/WFH/WFO/time changes; view employee records relevant to projects; add users and share credentials.                                                                                     |
| **Project Lead**                 | Participate in leave/WFH/WFO approvals; collaborate in comments; view docs; view statuses for active projects.                                                                                                                                                                |
| **HR**                           | Create/archive users; edit any user information; view all employee records; manage calendars and mark leave; assign policy balances; add/remove project members; approve leave/WFH/WFO/time changes; view workforce table; change passwords; add users and share credentials. |
| **Director (Technical/Program)** | View employee records; approve leave/WFH/WFO/time changes; view workforce table; change user information and passwords; add users and share credentials.                                                                                                                      |
| **Finance**                      | Review and approve/reject expense requests.                                                                                                                                                                                                                                   |
| **CEO**                          | Final approval for all expense requests.                                                                                                                                                                                                                                      |
| **Admin**                        | Maintain master lists (Projects, Skills, Additional Skills, Hobbies, Roles); delete project documents; global governance.                                                                                                                                                     |

---

## 8) Representative Workflows

### 8.1 Staffing & Capacity Control

1. **Manager/HR** adds employee to a project.
2. Assign capacity % for the project.
3. System recalculates the employee’s **total active allocation**.
4. If **>100%**, the **red halo** appears; Manager/HR can adjust allocations or staffing.

### 8.2 Leave Request & Approval

1. **Employee** selects leave category and dates; submits request.
2. **Approver** (HR/Manager/Director/Project Lead) reviews and approves/rejects.
3. On approval, the **balance decreases**; the calendar updates; notifications are sent.

### 8.3 Work Location & Daily Activity

1. **Employee** starts day selecting **Home/Office/Other**.
2. Uses **Break/Back** during the day.
3. For corrections, submits **time change request** with reason → **HR/Manager/Director** approves → attendance updates.

### 8.4 Archiving a User

1. **HR** archives a user.
2. User is **removed from all active projects**.
3. Profile and **project history remain intact**.

### 8.5 Expense Request

1. **Employee** submits expense with details/attachments.
2. **Finance** approves/rejects.
3. If approved, routes to **CEO** for final approval.
4. Decision and comments are recorded; requester notified.

---

## 9) Acceptance Criteria (Selected)

* **Profile Catalog Control**: Employees can only select Projects, Skills, Additional Skills, Hobbies, and Roles from **Admin-managed lists**.
* **Overlapping Timelines**: Previous projects support overlapping date ranges and are displayed without ambiguity.
* **Capacity Halo**: When an employee’s total capacity across active projects **exceeds 100%**, a **red circular halo** appears on their avatar everywhere.
* **Archiving**: Archiving a user **removes them from all active projects** while **retaining** their project history within their profile.
* **Comments**: Each project supports comments visible to project members.
* **Documents**: PDF, `.md`, `.txt`, and images can be uploaded to a project and viewed by all project members; **Admin** and **Manager** can delete them.
* **HR Calendar**: HR can mark Casual/Sick/Annual/Other on a per-employee calendar and view days worked, presence, and leave counts.
* **Balances & Requests**: Employees see category balances and can request leave; balances reduce only after approval.
* **Approvals**: Leave and work-location requests may be approved by **HR, Manager, Director, or Project Lead** (any one approver); time changes by **HR, Manager, or Director** (any one).
* **Workforce Table**: HR and Directors can see who is working today, on what leave type, and where (Home/Office/Other).
* **Messaging**: Any user can send a direct message to any other user for queries.
* **User Management**: **HR, Manager, or Directors** can add users and share credentials; **HR and Directors** can change any user’s information, including passwords.
* **Finance**: Any user can submit an expense request; **Finance** approves first, followed by **CEO** for final approval.
