# Frontend Architecture Specification (Next.js, TypeScript)

## 1. Executive Summary

This document defines the comprehensive frontend architecture for the Project Management Software (PMS), designed to deliver an enterprise-grade user experience with modern web technologies. The frontend serves as the primary interface for all user interactions, providing intuitive workflows for project management, employee administration, time tracking, and financial operations.

### 1.1 Architectural Goals

**Primary Objectives**
* **Intuitive User Experience**: Streamlined workflows for complex business processes
* **Real-time Responsiveness**: Near real-time updates for critical operations (capacity allocation, approvals, status changes)
* **Role-Based Interface**: Dynamic UI adaptation based on user roles and permissions
* **Performance Excellence**: Fast loading times, smooth interactions, and efficient data handling
* **Accessibility Compliance**: WCAG 2.1 AA compliance for inclusive user access
* **Scalable Architecture**: Component-based design supporting feature growth and team scaling

**Secondary Objectives**
* **Offline Capability**: Basic offline functionality for critical operations
* **Progressive Enhancement**: Graceful degradation for varying network conditions
* **Cross-Browser Compatibility**: Support for modern browsers with consistent experience
* **Mobile Responsiveness**: Optimized experience across desktop, tablet, and mobile devices

### 1.2 Non-Goals & Constraints

**Explicit Non-Goals**
* Native mobile applications (web-first approach with responsive design)
* Heavy rich-text collaboration features (basic commenting only)
* Real-time video/audio communication
* Complex document editing capabilities
* Offline-first architecture (online-first with offline fallbacks)

**Technical Constraints**
* Modern browser support only (ES2020+, no IE support)
* Single-page application architecture
* Web-based file handling (no native file system access)

## 2. Technology Stack & Architecture Decisions

### 2.1 Core Framework & Language

#### Next.js 14+ (App Router)
* **Rationale**: Server-side rendering, automatic code splitting, built-in optimization, excellent developer experience
* **App Router**: Modern routing with layouts, loading states, and error boundaries
* **Server Components**: Improved performance with server-side rendering where appropriate
* **Image Optimization**: Built-in image optimization for performance
* **Bundle Analysis**: Built-in bundle analyzer for performance monitoring

#### TypeScript 5.0+
* **Strict Mode**: Full type safety with strict TypeScript configuration
* **Type-First Development**: Comprehensive type definitions for all data structures
* **Interface Segregation**: Modular type definitions aligned with domain boundaries
* **Generic Programming**: Reusable type-safe components and utilities

### 2.2 UI Framework & Design System

#### Tailwind CSS + shadcn/ui
* **Utility-First CSS**: Rapid development with consistent design tokens
* **Component Library**: shadcn/ui for accessible, customizable components
* **Design Tokens**: Centralized color, spacing, typography, and animation systems
* **Dark Mode Support**: Built-in dark mode with user preference persistence
* **Responsive Design**: Mobile-first responsive design patterns

#### Icon System
* **Lucide React**: Consistent, lightweight icon library
* **Custom Icons**: SVG-based custom icons for brand-specific elements
* **Icon Optimization**: Tree-shaking and optimization for bundle size

### 2.3 State Management Architecture

#### Server State Management (TanStack Query)
* **Intelligent Caching**: Automatic background refetching and cache invalidation
* **Optimistic Updates**: Immediate UI updates with rollback on failure
* **Offline Support**: Query persistence and background sync
* **DevTools Integration**: Comprehensive debugging and monitoring tools

#### Client State Management (Zustand)
* **Minimal Boilerplate**: Simple, TypeScript-friendly state management
* **Modular Stores**: Domain-specific state stores for better organization
* **Persistence**: Local storage integration for user preferences
* **Middleware**: Logging, persistence, and devtools middleware

#### State Architecture Pattern
```typescript
// Server State (TanStack Query)
- API data caching
- Background synchronization
- Optimistic updates
- Error handling

// Client State (Zustand)
- UI state (modals, forms, navigation)
- User preferences
- Application settings
- Temporary data
```

### 2.4 Form Management & Validation

#### React Hook Form
* **Performance**: Minimal re-renders with uncontrolled components
* **Validation Integration**: Seamless integration with Zod schemas
* **Complex Forms**: Support for nested objects, arrays, and conditional fields
* **Accessibility**: Built-in accessibility features and error handling

#### Zod Validation
* **Type-Safe Validation**: Runtime validation with TypeScript inference
* **Schema Composition**: Reusable validation schemas
* **Error Messages**: Internationalized, user-friendly error messages
* **Backend Alignment**: Shared validation schemas between frontend and backend

### 2.5 Authentication & Security

#### JWT Token Management
* **Access Tokens**: Short-lived tokens stored in memory
* **Refresh Tokens**: HttpOnly cookies for secure token refresh
* **Automatic Refresh**: Transparent token refresh with request retry
* **Security Headers**: CSRF protection and security header implementation

#### Session Management
* **Persistent Sessions**: Remember me functionality with secure storage
* **Multi-Tab Sync**: Session state synchronization across browser tabs
* **Logout Handling**: Secure logout with token cleanup

### 2.6 Internationalization & Localization

#### Date/Time Handling (dayjs)
* **Timezone Support**: Organization-configurable timezone handling
* **Relative Time**: Human-readable relative time formatting
* **Calendar Integration**: Business day calculations and holiday support
* **Locale-Aware Formatting**: Localized date/time formatting

#### Future i18n Preparation
* **Message Extraction**: Prepared for message extraction and translation
* **Locale Detection**: Browser and user preference-based locale detection
* **RTL Support**: Right-to-left language support preparation

### 2.7 Environment Configuration

#### Environment Variables
```typescript
// Public Environment Variables
NEXT_PUBLIC_API_BASE_URL      // Backend API base URL
NEXT_PUBLIC_S3_BUCKET_URL     // Public S3 bucket URL for file access
NEXT_PUBLIC_BUILD_VERSION     // Application version for cache busting
NEXT_PUBLIC_ENVIRONMENT       // Environment identifier (dev/staging/prod)
NEXT_PUBLIC_SENTRY_DSN        // Error tracking configuration
NEXT_PUBLIC_ANALYTICS_ID      // Analytics tracking identifier

// Server-Side Environment Variables
DATABASE_URL                  // Database connection (if needed)
NEXTAUTH_SECRET              // Authentication secret
NEXTAUTH_URL                 // Authentication callback URL
```

### 2.8 Accessibility Standards

#### WCAG 2.1 AA Compliance
* **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
* **Screen Reader Support**: Proper ARIA labels and semantic HTML
* **Color Contrast**: Minimum 4.5:1 contrast ratio for normal text
* **Focus Management**: Visible focus indicators and logical tab order
* **Alternative Text**: Comprehensive alt text for images and icons

#### Accessibility Testing
* **Automated Testing**: Integration with axe-core for automated accessibility testing
* **Manual Testing**: Regular manual testing with screen readers
* **User Testing**: Accessibility user testing with disabled users

## 3. Information Architecture (Routes)

### 3.1 Application Structure Overview

The application follows a hierarchical information architecture designed for intuitive navigation and efficient task completion. The structure supports both role-based access control and contextual navigation patterns.

### 3.2 Route Structure (Next.js App Router)

```
/login
/forgot-password

/dashboard
  - summary cards (capacity conflicts, pending approvals, today’s workforce)

/employees
  /employees/[id]
    - Profile (image, designation, skills/additional skills/hobbies, previous projects timeline)
/employees/[id]/calendar
/employees/[id]/projects
/employees/[id]/messages  (1:1 DM thread)
/employees/new  (HR only)

/projects
  /projects/[id]
    - Overview (roster, capacities, red-halo indicators)
    - Documents (upload, preview; delete by Manager/Admin)
    - Comments (threaded or flat)
/projects/[id]/roster
/projects/[id]/documents
/projects/[id]/comments
/projects/new  (Manager/HR)

/attendance
  - “Today’s Workforce” (HR/Directors): present, leave type, WFH/WFO/Other
  - My day: start/end, break/back

/leave
  - Request leave; see balances (Casual/Sick/Annual/Other)
  - Approvals queue (HR/Manager/Director/Lead)

/work-location
  - Request WFH/WFO/Other; approvals queue

/time-change
  - Submit time change request; approvals queue (HR/Manager/Director)

/finance
  - Submit expense
  - Finance queue (Finance)
  - CEO approvals

/admin
  - Master lists: Projects, Skills, Additional Skills, Hobbies, Roles (catalogs)
  - Users (create/archive; password reset)
  - Settings (approval policy: simple/strict)
```

## 4. User Experience Design & Key Interactions

### 4.1 Core UX Principles

#### Design Philosophy
* **Progressive Disclosure**: Complex information revealed gradually based on user needs
* **Contextual Actions**: Actions available based on user role and current context
* **Immediate Feedback**: Real-time validation and status updates
* **Consistent Patterns**: Standardized interaction patterns across all modules
* **Error Prevention**: Proactive validation and clear guidance to prevent errors

#### Accessibility-First Design
* **Keyboard Navigation**: Full functionality accessible via keyboard
* **Screen Reader Support**: Comprehensive ARIA labels and semantic structure
* **High Contrast**: Support for high contrast mode and custom themes
* **Responsive Text**: Scalable text up to 200% without horizontal scrolling
* **Focus Management**: Clear focus indicators and logical tab order

### 4.2 Key Screen Behaviors & Interactions

#### Capacity Management Visualization
* **Capacity Ring**: Dynamic avatar component with outer ring indicator
  - Green: Under 80% capacity
  - Yellow: 80-100% capacity
  - Red: Over 100% capacity (animated pulse effect)
  - Tooltip: Detailed capacity breakdown on hover
* **Real-time Updates**: Capacity indicators update immediately on allocation changes
* **Conflict Resolution**: Visual guidance for resolving over-allocation conflicts

#### Project Roster Management
* **Inline Editing**: Click-to-edit capacity percentages with immediate validation
* **Drag-and-Drop**: Intuitive team member addition via drag-and-drop interface
* **Bulk Operations**: Multi-select for bulk capacity adjustments
* **Conflict Prevention**: Real-time validation preventing over-allocation
* **Visual Feedback**: Immediate visual feedback for all roster changes

#### Employee Timeline Visualization
* **Interactive Timeline**: Overlapping project bands with distinct color coding
* **Hover Details**: Rich tooltips showing role, skills used, and project details
* **Zoom Controls**: Timeline zoom for different time granularities
* **Conflict Highlighting**: Visual indicators for overlapping assignments
* **Export Functionality**: Timeline export for reporting and planning

#### Leave Request Workflow
* **Guided Wizard**: Step-by-step leave request process with validation
* **Balance Display**: Real-time leave balance updates during request creation
* **Calendar Integration**: Visual calendar picker with blackout dates
* **Policy Hints**: Contextual policy information and restrictions
* **Approval Tracking**: Real-time approval status with estimated completion times

#### Approval Management Interface
* **Unified Queue**: Centralized approval dashboard with filtering and sorting
* **Batch Operations**: Multi-select for bulk approval/rejection
* **Contextual Information**: Rich context for informed decision-making
* **Delegation Support**: Temporary approval delegation during absences
* **Audit Trail**: Complete approval history with reasoning and timestamps

#### Document Management System
* **Drag-and-Drop Upload**: Intuitive file upload with progress indicators
* **File Type Validation**: Real-time file type and size validation
* **Preview System**: In-browser preview for PDF, images, and Markdown
* **Version Control**: Document versioning with change tracking
* **Access Control**: Role-based document access with visual indicators

#### Messaging Interface
* **Real-time Communication**: Instant message delivery with typing indicators
* **Thread Management**: Organized conversation threads with search capability
* **File Sharing**: Integrated file sharing within conversations
* **Notification System**: Smart notifications with do-not-disturb options
* **Message Status**: Read receipts and delivery confirmations

## 5. Component Architecture & Design System

### 5.1 Component Hierarchy & Organization

#### Layout Components
```typescript
// Core Layout Structure
AppShell                    // Main application shell with navigation
├── TopNavigationBar       // Global navigation and user context
├── SidebarNavigation      // Module-based navigation with role filtering
├── BreadcrumbNavigation   // Hierarchical navigation context
├── MainContent            // Primary content area with routing
└── NotificationCenter     // Global notification system

// Layout Utilities
PageHeader                 // Standardized page headers with actions
PageFooter                 // Consistent page footers
LoadingBoundary           // Loading states and skeleton screens
ErrorBoundary             // Error handling and recovery
```

#### Authentication & Security Components
```typescript
// Access Control
RBACGuard                 // Role-based access control wrapper
PermissionGate            // Fine-grained permission checking
AuthenticationProvider    // Authentication context provider
SessionManager            // Session state management

// Security Features
CSRFProtection           // CSRF token management
SecureForm               // Security-enhanced form wrapper
AuditLogger              // Client-side audit logging
```

#### Common UI Components
```typescript
// Data Display
DataTable                // Advanced table with sorting, filtering, pagination
DataGrid                 // Grid layout for card-based data
Timeline                 // Interactive timeline visualization
Calendar                 // Calendar component with event support
Chart                    // Chart visualization components

// User Interface
AvatarWithCapacity       // User avatar with capacity indicator
Badge                    // Status and category badges
Tag                      // Removable tags for categorization
Tooltip                  // Rich tooltip with HTML content
Modal                    // Accessible modal dialogs
Drawer                   // Slide-out panels for detailed views

// Form Controls
FormField                // Standardized form field wrapper
InlineEditor             // Click-to-edit functionality
FileUploader             // Drag-and-drop file upload
DatePicker               // Date selection with business day support
MultiSelect              // Multi-selection with search
AutoComplete             // Type-ahead search component

// Feedback & Status
Toast                    // Non-intrusive notifications
ProgressBar              // Progress indication for long operations
StatusIndicator          // Real-time status display
EmptyState               // Empty state illustrations and actions
ConfirmDialog            // Confirmation dialogs with context
```

### 5.2 Domain-Specific Components

#### Employee Management
```typescript
// Profile Components
ProfileHeader            // Employee profile header with key information
ProfileImage             // Profile image with upload functionality
SkillsSelector           // Multi-select skills from catalog
HobbiesSelector          // Multi-select hobbies from catalog
ContactInformation       // Contact details management

// Timeline & History
ProjectTimeline          // Visual project assignment timeline
CapacityTimeline         // Capacity allocation over time
LeaveHistory             // Historical leave records
AttendanceHistory        // Attendance pattern visualization

// Status & Metrics
LeaveBalanceCard         // Current leave balances display
CapacityIndicator        // Real-time capacity status
AttendanceStatus         // Current attendance status
PerformanceMetrics       // Key performance indicators
```

#### Project Management
```typescript
// Project Overview
ProjectHeader            // Project summary and key metrics
ProjectStatus            // Current project status and health
MilestoneTracker         // Project milestone progress
ResourceAllocation       // Resource allocation visualization

// Team Management
RosterTable              // Team roster with capacity management
CapacityEditor           // Interactive capacity allocation
TeamMemberCard           // Individual team member information
RoleAssignment           // Project role management

// Collaboration
CommentsFeed             // Project discussion thread
DocumentRepository       // Project document management
DocumentUploader         // Multi-file upload with validation
DocumentPreview          // In-browser document preview
ActivityFeed             // Project activity timeline
```

#### Attendance & Time Management
```typescript
// Daily Operations
StartDayCard             // Work day initiation interface
BreakControls            // Break management controls
TimeTracker              // Real-time time tracking
WorkLocationSelector     // Work location selection

// Management Views
TodayWorkforceTable      // Current workforce status overview
AttendanceCalendar       // Calendar view of attendance patterns
TimeCorrection           // Time correction request interface
AttendanceReports        // Attendance analytics and reports

// Status Displays
WorkforceStatus          // Real-time workforce overview
LocationStatus           // Current work location status
TimeStatus               // Current time tracking status
```

#### Approval Workflows
```typescript
// Approval Management
ApprovalQueue            // Centralized approval dashboard
ApprovalCard             // Individual approval item
ApprovalDrawer           // Detailed approval interface
BulkApproval             // Multi-item approval interface

// Workflow Components
ApprovalTimeline         // Approval process visualization
EscalationIndicator      // Overdue approval indicators
DelegationManager        // Approval delegation interface
PolicyDisplay            // Approval policy information
```

#### Financial Management
```typescript
// Expense Management
ExpenseForm              // Expense submission form
ExpenseCard              // Expense summary display
ExpenseDetail            // Detailed expense view
AttachmentManager        // Receipt and document management

// Approval Process
FinanceApprovalQueue     // Finance team approval interface
CEOApprovalQueue         // Executive approval interface
ExpenseReports           // Financial reporting components
BudgetTracker            // Budget tracking and alerts
```

### 5.3 Design System Integration

#### Theme System
```typescript
// Theme Configuration
ThemeProvider            // Global theme context
ColorPalette             // Consistent color system
Typography               // Font and text styling
Spacing                  // Consistent spacing system
Breakpoints              // Responsive design breakpoints

// Component Variants
ButtonVariants           // Primary, secondary, danger, etc.
InputVariants            // Standard, error, success states
CardVariants             // Different card styles and elevations
```

#### Animation System
```typescript
// Transition Components
FadeTransition           // Smooth fade in/out
SlideTransition          // Slide animations
ScaleTransition          // Scale animations
PageTransition           // Page-to-page transitions

// Interactive Animations
HoverEffects             // Hover state animations
LoadingAnimations        // Loading state animations
SuccessAnimations        // Success feedback animations
ErrorAnimations          // Error state animations
```

## 6. Data Management & State Architecture

### 6.1 Server State Management (TanStack Query)

#### Query Organization & Cache Keys
```typescript
// Employee Data Queries
['employees']                           // Employee list
['employees', { filters }]              // Filtered employee list
['employee', id]                        // Individual employee profile
['employee', id, 'calendar']            // Employee calendar data
['employee', id, 'projects']            // Employee project history
['employee', id, 'capacity']            // Employee capacity analysis
['employee', id, 'attendance']          // Employee attendance records

// Project Data Queries
['projects']                            // Project list
['projects', { filters }]               // Filtered project list
['project', id]                         // Individual project details
['project', id, 'roster']               // Project team roster
['project', id, 'documents']            // Project documents
['project', id, 'comments']             // Project comments
['project', id, 'timeline']             // Project timeline

// Approval Workflow Queries
['approvals']                           // All approvals
['approvals', type]                     // Approvals by type (leave, expense, etc.)
['approvals', 'pending']                // Pending approvals
['approvals', 'history']                // Approval history
['approval', id]                        // Individual approval details

// Financial Data Queries
['expenses']                            // Expense list
['expenses', { status, userId }]        // Filtered expenses
['expense', id]                         // Individual expense details
['finance', 'queue']                    // Finance approval queue
['finance', 'reports']                  // Financial reports

// Administrative Queries
['catalogs', type]                      // Catalog items by type
['users']                               // User management
['audit-logs']                          // Audit trail
['system-settings']                     // System configuration
```

#### Cache Management Strategy
```typescript
// Cache Invalidation Patterns
const invalidateEmployeeData = (employeeId: string) => {
  queryClient.invalidateQueries(['employee', employeeId]);
  queryClient.invalidateQueries(['employees']);
  queryClient.invalidateQueries(['projects']); // May affect project rosters
};

const invalidateProjectData = (projectId: string) => {
  queryClient.invalidateQueries(['project', projectId]);
  queryClient.invalidateQueries(['projects']);
  queryClient.invalidateQueries(['employees']); // May affect employee capacity
};

// Optimistic Updates
const updateEmployeeCapacity = useMutation({
  mutationFn: updateCapacityAPI,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['employee', newData.employeeId, 'capacity']);

    // Snapshot previous value
    const previousData = queryClient.getQueryData(['employee', newData.employeeId, 'capacity']);

    // Optimistically update
    queryClient.setQueryData(['employee', newData.employeeId, 'capacity'], newData);

    return { previousData };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(
      ['employee', newData.employeeId, 'capacity'],
      context.previousData
    );
  },
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries(['employee']);
  },
});
```

#### Background Synchronization
```typescript
// Real-time Updates Configuration
const useRealtimeUpdates = () => {
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);

      switch (type) {
        case 'capacity_updated':
          queryClient.invalidateQueries(['employee', data.employeeId, 'capacity']);
          break;
        case 'approval_status_changed':
          queryClient.invalidateQueries(['approvals']);
          queryClient.invalidateQueries(['approval', data.approvalId]);
          break;
        case 'project_roster_updated':
          queryClient.invalidateQueries(['project', data.projectId, 'roster']);
          break;
      }
    };

    return () => eventSource.close();
  }, []);
};
```

### 6.2 Client State Management (Zustand)

#### State Store Organization
```typescript
// UI State Store
interface UIState {
  // Navigation
  sidebarCollapsed: boolean;
  currentModule: string;
  breadcrumbs: BreadcrumbItem[];

  // Modals and Overlays
  activeModal: string | null;
  drawerOpen: boolean;
  drawerContent: any;

  // Notifications
  notifications: Notification[];

  // Theme and Preferences
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
}

// Form State Store
interface FormState {
  // Active Forms
  activeForms: Record<string, any>;
  formErrors: Record<string, any>;
  formTouched: Record<string, boolean>;

  // Draft Data
  drafts: Record<string, any>;
  autoSaveEnabled: boolean;
}

// Filter and Search State
interface FilterState {
  // Global Search
  globalSearchQuery: string;
  globalSearchResults: any[];

  // Module-specific Filters
  employeeFilters: EmployeeFilters;
  projectFilters: ProjectFilters;
  approvalFilters: ApprovalFilters;

  // Sort and Pagination
  sortConfig: Record<string, SortConfig>;
  paginationConfig: Record<string, PaginationConfig>;
}
```

#### Persistent State Management
```typescript
// User Preferences Store with Persistence
const useUserPreferencesStore = create(
  persist(
    (set, get) => ({
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      sidebarCollapsed: false,
      notificationSettings: {
        email: true,
        push: true,
        inApp: true,
      },

      updatePreference: (key: string, value: any) =>
        set((state) => ({ ...state, [key]: value })),

      resetPreferences: () =>
        set({
          theme: 'system',
          language: 'en',
          timezone: 'UTC',
          sidebarCollapsed: false,
        }),
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### 6.3 Offline Support & Synchronization

#### Offline Data Strategy
```typescript
// Offline Query Configuration
const offlineQueries = [
  'employee-profile',
  'project-roster',
  'leave-balances',
  'attendance-today',
];

// Service Worker Integration
const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingMutations, setPendingMutations] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync pending mutations
      syncPendingMutations();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, pendingMutations };
};
```

## 7. Security & Access Control

### 7.1 Role-Based Access Control (RBAC)

#### Frontend Authorization Strategy
```typescript
// RBAC Guard Component
interface RBACGuardProps {
  roles?: string[];
  permissions?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const RBACGuard: React.FC<RBACGuardProps> = ({
  roles,
  permissions,
  fallback = null,
  children,
}) => {
  const { user } = useAuth();

  const hasRequiredRole = roles ?
    roles.some(role => user.roles.includes(role)) : true;

  const hasRequiredPermission = permissions ?
    permissions.some(permission => user.permissions.includes(permission)) : true;

  if (!hasRequiredRole || !hasRequiredPermission) {
    return fallback;
  }

  return <>{children}</>;
};

// Usage Examples
<RBACGuard roles={['hr', 'admin']}>
  <CreateEmployeeButton />
</RBACGuard>

<RBACGuard permissions={['project.roster.edit']}>
  <CapacityEditor />
</RBACGuard>
```

#### Permission-Based UI Rendering
```typescript
// Custom Hooks for Permission Checking
const usePermissions = () => {
  const { user } = useAuth();

  return {
    canEditEmployee: (employeeId: string) =>
      user.permissions.includes('employee.edit') || user.id === employeeId,
    canApproveLeave: () =>
      user.roles.some(role => ['hr', 'manager', 'director'].includes(role)),
    canDeleteDocument: () =>
      user.roles.some(role => ['admin', 'manager'].includes(role)),
    canViewFinanceQueue: () =>
      user.roles.includes('finance') || user.roles.includes('ceo'),
  };
};

// Conditional Rendering Based on Permissions
const ProjectActions = ({ project }) => {
  const permissions = usePermissions();

  return (
    <div className="flex gap-2">
      {permissions.canEditProject(project.id) && (
        <EditProjectButton project={project} />
      )}
      {permissions.canDeleteProject(project.id) && (
        <DeleteProjectButton project={project} />
      )}
    </div>
  );
};
```

#### Context-Aware Authorization
```typescript
// Project-specific permissions
const useProjectPermissions = (projectId: string) => {
  const { user } = useAuth();
  const { data: project } = useQuery(['project', projectId]);

  return {
    isProjectMember: project?.roster.some(member => member.userId === user.id),
    isProjectLead: project?.roster.find(member =>
      member.userId === user.id && member.role === 'lead'
    ),
    canManageRoster: user.roles.some(role => ['hr', 'manager'].includes(role)),
    canDeleteDocuments: user.roles.some(role => ['admin', 'manager'].includes(role)),
  };
};
```

### 7.2 Security Best Practices

#### Input Sanitization
```typescript
// XSS Prevention
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  });
};

// Safe HTML Rendering
const SafeHTML: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = useMemo(() => sanitizeInput(content), [content]);

  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  );
};
```

#### CSRF Protection
```typescript
// CSRF Token Management
const useCSRFToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get CSRF token from meta tag or API
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    setToken(metaToken);
  }, []);

  return token;
};

// Automatic CSRF Token Inclusion
axios.interceptors.request.use((config) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});
```

## 8. Form Management & Validation

### 8.1 Form Architecture

#### Comprehensive Form Validation
```typescript
// Zod Schema Examples
const createEmployeeSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email format')
    .refine(async (email) => {
      const exists = await checkEmailExists(email);
      return !exists;
    }, 'Email already exists'),
  designation: z.string()
    .min(1, 'Designation is required'),
  skills: z.array(z.string())
    .min(1, 'At least one skill is required'),
  startDate: z.date()
    .min(new Date(), 'Start date cannot be in the past'),
});

// Form Component with Validation
const CreateEmployeeForm = () => {
  const form = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      name: '',
      email: '',
      designation: '',
      skills: [],
      startDate: new Date(),
    },
  });

  const onSubmit = async (data: CreateEmployeeFormData) => {
    try {
      await createEmployee(data);
      toast.success('Employee created successfully');
      form.reset();
    } catch (error) {
      toast.error('Failed to create employee');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Additional form fields */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Create Employee'}
        </Button>
      </form>
    </Form>
  );
};
```

#### Advanced Form Features
```typescript
// Auto-save Functionality
const useAutoSave = (formData: any, saveFunction: (data: any) => Promise<void>) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData && Object.keys(formData).length > 0) {
        setIsSaving(true);
        try {
          await saveFunction(formData);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [formData, saveFunction]);

  return { lastSaved, isSaving };
};

// Multi-step Form Management
const useMultiStepForm = (steps: FormStep[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  return {
    currentStep,
    currentStepData: steps[currentStep],
    formData,
    nextStep,
    prevStep,
    updateFormData,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  };
};
```

### 8.2 Specialized Form Components

#### Date and Time Handling
```typescript
// Business Day Date Picker
const BusinessDatePicker = ({ value, onChange, excludeWeekends = true }) => {
  const { data: holidays } = useQuery(['holidays']);

  const isBusinessDay = (date: Date) => {
    if (excludeWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
      return false;
    }

    return !holidays?.some(holiday =>
      isSameDay(date, new Date(holiday.date))
    );
  };

  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      filterDate={isBusinessDay}
      highlightDates={holidays?.map(h => new Date(h.date))}
      placeholderText="Select business day"
    />
  );
};

// Time Zone Aware Date Display
const TimeZoneAwareDatePicker = ({ value, onChange, timezone }) => {
  const convertToTimezone = (date: Date) => {
    return zonedTimeToUtc(date, timezone);
  };

  const convertFromTimezone = (date: Date) => {
    return utcToZonedTime(date, timezone);
  };

  return (
    <DatePicker
      selected={value ? convertFromTimezone(value) : null}
      onChange={(date) => onChange(date ? convertToTimezone(date) : null)}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat="MMMM d, yyyy h:mm aa"
    />
  );
};
```

## 9. Error Handling & User Feedback

### 9.1 Error Boundary Implementation
```typescript
// Global Error Boundary
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Global error caught:', error, errorInfo);

    // Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback Component
const ErrorFallback: React.FC<{
  error: Error | null;
  resetError: () => void;
}> = ({ error, resetError }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
          <h1 className="text-xl font-semibold text-gray-900">
            Something went wrong
          </h1>
        </div>

        <p className="text-gray-600 mb-4">
          We're sorry, but something unexpected happened. Please try refreshing the page.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-gray-500">
              Error details (development only)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex space-x-3">
          <Button onClick={resetError} variant="outline">
            Try again
          </Button>
          <Button onClick={() => window.location.reload()}>
            Refresh page
          </Button>
        </div>
      </div>
    </div>
  );
};
```

### 9.2 Empty States & Loading States
```typescript
// Comprehensive Empty State Component
const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  illustration?: string;
}> = ({ icon, title, description, action, illustration }) => {
  return (
    <div className="text-center py-12">
      {illustration && (
        <img
          src={illustration}
          alt=""
          className="mx-auto h-32 w-32 mb-4 opacity-50"
        />
      )}

      {icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        {description}
      </p>

      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Loading Skeleton Components
const EmployeeCardSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const DataTableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <div
            key={j}
            className="h-4 bg-gray-300 rounded animate-pulse flex-1"
          ></div>
        ))}
      </div>
    ))}
  </div>
);
```

## 10. Performance Optimization & Monitoring

### 10.1 Performance Optimization Strategies
```typescript
// Code Splitting and Lazy Loading
const EmployeeManagement = lazy(() => import('./pages/EmployeeManagement'));
const ProjectManagement = lazy(() => import('./pages/ProjectManagement'));
const FinanceManagement = lazy(() => import('./pages/FinanceManagement'));

// Route-based Code Splitting
const AppRouter = () => (
  <Router>
    <Suspense fallback={<PageLoadingSkeleton />}>
      <Routes>
        <Route path="/employees/*" element={<EmployeeManagement />} />
        <Route path="/projects/*" element={<ProjectManagement />} />
        <Route path="/finance/*" element={<FinanceManagement />} />
      </Routes>
    </Suspense>
  </Router>
);

// Component Memoization
const EmployeeCard = memo(({ employee }: { employee: Employee }) => {
  return (
    <div className="employee-card">
      <AvatarWithCapacity user={employee} />
      <h3>{employee.name}</h3>
      <p>{employee.designation}</p>
    </div>
  );
});

// Virtual Scrolling for Large Lists
const VirtualizedEmployeeList = ({ employees }: { employees: Employee[] }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={employees.length}
      itemSize={80}
      itemData={employees}
    >
      {({ index, style, data }) => (
        <div style={style}>
          <EmployeeCard employee={data[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

### 10.2 Performance Monitoring
```typescript
// Web Vitals Monitoring
const useWebVitals = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }, []);
};

// Performance Tracking Hook
const usePerformanceTracking = () => {
  const trackPageLoad = (pageName: string) => {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    const metrics = {
      page: pageName,
      loadTime: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
      domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    };

    // Send metrics to analytics service
    console.log('Performance metrics:', metrics);
  };

  return { trackPageLoad };
};
```

---