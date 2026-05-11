# FinTrace Role-Based Access Control

## Three Roles Defined

### 1. **Admin** 👑
- **Access**: Full system control
- **Alert Permissions**: 
  - ✅ View all alerts
  - ✅ Review alerts (mark as investigating)
  - ✅ Dismiss alerts (mark as false positive)
  - ✅ Resolve alerts (mark as resolved)
  - ✅ Assign investigations to investigators
- **Other Permissions**:
  - ✅ Flag transactions
  - ✅ View all user activity
  - ✅ System configuration
- **Typical Use**: System administrators, fraud managers

### 2. **Investigator** 🔍
- **Access**: Fraud detection and investigation
- **Alert Permissions**:
  - ✅ View all alerts
  - ✅ Review alerts (mark as investigating)
  - ✅ Dismiss alerts (mark as false positive)
  - ✅ Resolve alerts (mark as resolved)
  - ❌ Cannot modify user accounts or settings
- **Other Permissions**:
  - ✅ Flag transactions
  - ✅ Add notes to alerts
  - ✅ Analyze transaction patterns
- **Typical Use**: Fraud investigators, analysts

### 3. **Auditor** 📊
- **Access**: Read-only monitoring and compliance
- **Alert Permissions**:
  - ✅ View all alerts
  - ❌ Review alerts (view-only)
  - ❌ Dismiss alerts
  - ❌ Resolve alerts
- **Other Permissions**:
  - ❌ Flag transactions
  - ❌ Modify any data
  - ✅ Generate audit reports
- **Typical Use**: Compliance officers, auditors

## Implementation

### Route Protection
```typescript
// Only admin and investigator can modify alerts
router.patch('/:id/review', authorize('admin', 'investigator'), ...);
router.patch('/:id/dismiss', authorize('admin', 'investigator'), ...);
router.patch('/:id/resolve', authorize('admin', 'investigator'), ...);

// All authenticated users can view
router.get('/', authenticateToken, ...);
```

### Frontend UI Control
```typescript
const canModifyAlerts = user?.role === 'admin' || user?.role === 'investigator';

{canModifyAlerts && (
  <div>
    <Button onClick={() => handleReview(alertId)}>Review</Button>
    <Button onClick={() => handleDismiss(alertId)}>Dismiss</Button>
  </div>
)}
```

### Audit Trail
When an action is taken, these fields are populated:
- `investigatorId` - User who took action
- `reviewedAt` - When review action occurred
- `dismissedBy` - User who dismissed (different from investigatorId for clarity)
- `resolvedAt` - When resolved
- `notes` - Comments about the action

## Testing the Roles

### As Admin (admin@fintrace.io / AdminPass123!)
1. Login → Alerts page
2. Should see "Review" and "Dismiss" buttons
3. Can click buttons → alerts update

### As Investigator (investigator@fintrace.io / InvestigatorPass123!)
1. Login → Alerts page
2. Should see "Review" and "Dismiss" buttons
3. Can perform same actions as Admin (for alerts)

### As Auditor (auditor@fintrace.io / AuditorPass123!)
1. Login → Alerts page
2. Should see message: "📋 Auditor mode: Read-only access..."
3. NO Review/Dismiss buttons visible
4. Can view alerts but cannot modify

## Why the Same UI?
Before these fixes, the frontend showed identical UI for all roles but the backend had no endpoints to actually handle the actions. Now:
- Backend enforces role checks (407 Forbidden for auditors attempting modifications)
- Frontend prevents auditors from seeing action buttons (better UX)
- API endpoints are role-protected (defense in depth)
