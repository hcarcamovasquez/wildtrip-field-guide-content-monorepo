# WildTrip Guía de Campo - Test Cases

## 1. Public Pages Test Suite

### 1.1 Homepage Tests
- **Test Case ID**: TC-HOME-001
- **Description**: Verify homepage loads with all sections
- **Preconditions**: Application running on localhost:4321
- **Steps**:
  1. Navigate to http://localhost:4321
  2. Verify page title is "Inicio - WildTrip Guia de Campo"
  3. Check hero section displays with title and description
  4. Verify navigation menu contains: Especies, Áreas Protegidas, Noticias
  5. Check all feature cards are displayed
  6. Verify footer links are present
- **Expected Result**: All elements load correctly with proper Spanish localization

### 1.2 Dark Mode Toggle
- **Test Case ID**: TC-HOME-002
- **Description**: Verify dark mode functionality
- **Steps**:
  1. Click dark mode toggle button
  2. Verify UI switches to dark theme
  3. Refresh page and verify dark mode persists
- **Expected Result**: Dark mode toggles correctly and persists

## 2. Species Module Tests

### 2.1 Species List Page
- **Test Case ID**: TC-SPECIES-001
- **Description**: Verify species list displays correctly
- **Steps**:
  1. Navigate to /content/species
  2. Verify page displays species cards (5 species found)
  3. Check each card shows: image, name, scientific name, conservation status, group
- **Expected Result**: All species display with complete information

### 2.2 Species Search and Filters
- **Test Case ID**: TC-SPECIES-002
- **Description**: Test species search and filtering
- **Steps**:
  1. Enter "puma" in search field
  2. Select "En peligro" from conservation status filter
  3. Select "Mamífero" from group filter
  4. Click search button
- **Expected Result**: Results filtered according to criteria

### 2.3 Species Detail Page
- **Test Case ID**: TC-SPECIES-003
- **Description**: Verify species detail page
- **Steps**:
  1. Click on "Puma 1" species card
  2. Verify URL changes to /content/species/puma-1
  3. Check all sections display: main image, taxonomic info, description, gallery
- **Expected Result**: Complete species information displayed

## 3. Protected Areas Tests

### 3.1 Protected Areas List
- **Test Case ID**: TC-AREAS-001
- **Description**: Verify protected areas list
- **Steps**:
  1. Navigate to /content/protected-areas
  2. Verify 3 protected areas display
  3. Check cards show: image, name, region, type
- **Expected Result**: All areas display with correct information

### 3.2 Protected Areas Filters
- **Test Case ID**: TC-AREAS-002
- **Description**: Test area filtering by type and region
- **Steps**:
  1. Select "Parque Nacional" from type filter
  2. Select "Magallanes y de la Antártica Chilena" from region filter
  3. Click search
- **Expected Result**: Only matching areas displayed

## 4. News Module Tests

### 4.1 News List Page
- **Test Case ID**: TC-NEWS-001
- **Description**: Verify news articles display
- **Steps**:
  1. Navigate to /content/news
  2. Verify 2 news articles display
  3. Check each article shows: image, title, date, author, category
- **Expected Result**: Articles display with complete metadata

### 4.2 News Category Filter
- **Test Case ID**: TC-NEWS-002
- **Description**: Test news filtering by category
- **Steps**:
  1. Select "Conservación" from category dropdown
  2. Click search
- **Expected Result**: Only conservation articles displayed

## 5. Authentication Tests

### 5.1 Sign-In Page
- **Test Case ID**: TC-AUTH-001
- **Description**: Verify sign-in page loads
- **Steps**:
  1. Click "Iniciar sesión" link
  2. Verify redirect to /sign-in
  3. Check Clerk authentication form displays
  4. Verify Spanish localization
- **Expected Result**: Clerk sign-in page loads with Spanish UI

### 5.2 Protected Route Access
- **Test Case ID**: TC-AUTH-002
- **Description**: Verify protected routes require authentication
- **Steps**:
  1. Navigate directly to /manage
  2. Verify redirect to /sign-in
- **Expected Result**: Unauthenticated users redirected to sign-in

### 5.3 Authentication Flow
- **Test Case ID**: TC-AUTH-003
- **Description**: Test complete authentication flow
- **Steps**:
  1. Navigate to sign-in page
  2. Enter email: hcarcamovasquez+clerk_test@example.com
  3. Click Continue
  4. Enter password: Random12345A
  5. Click Continue
  6. Verify redirect to homepage with "Gestionar" link visible
- **Expected Result**: Successful authentication and access to management areas

## 6. Management Pages Tests (Requires Authentication)

### 6.1 Management Dashboard
- **Test Case ID**: TC-MANAGE-001
- **Description**: Verify management dashboard
- **Preconditions**: Authenticated user
- **Steps**:
  1. Navigate to /manage
  2. Verify dashboard displays with statistics
  3. Check Species count (5)
  4. Check Protected Areas count (3)
  5. Check News count (2)
  6. Verify navigation links to each section
- **Expected Result**: Dashboard displays accurate content counts

### 6.2 Species Management
- **Test Case ID**: TC-MANAGE-002
- **Description**: Test species management interface
- **Steps**:
  1. Navigate to /manage/species
  2. Verify table displays 5 species
  3. Check each species shows: image, scientific name, group, category, status, conservation
  4. Test search functionality
  5. Test filters by group and conservation status
  6. Verify "Nueva Especie" button present
- **Expected Result**: Complete species management interface

### 6.3 News Management
- **Test Case ID**: TC-MANAGE-003
- **Description**: Test news management interface
- **Steps**:
  1. Navigate to /manage/news
  2. Verify table displays 2 articles
  3. Check each article shows: title, category, status, author, date
  4. Test search functionality
  5. Test category filter
  6. Verify "Nueva Noticia" button present
- **Expected Result**: Complete news management interface

### 6.4 Protected Areas Management
- **Test Case ID**: TC-MANAGE-004
- **Description**: Test protected areas management
- **Steps**:
  1. Navigate to /manage/protected-areas
  2. Verify table displays 3 areas
  3. Check draft indicator on Torres del Paine
  4. Verify type and region display correctly
  5. Test search and filters
  6. Verify "Nueva Área Protegida" button
- **Expected Result**: Complete areas management with draft status

### 6.5 Content Draft/Publish Workflow
- **Test Case ID**: TC-MANAGE-005
- **Description**: Test draft/publish system
- **Steps**:
  1. Edit an existing content item
  2. Verify draft indicator appears
  3. Test save draft functionality
  4. Test publish draft button
  5. Verify lock system prevents concurrent editing
- **Expected Result**: Draft system works with proper indicators

## 7. Performance Tests

### 7.1 Page Load Times
- **Test Case ID**: TC-PERF-001
- **Description**: Measure page load performance
- **Steps**:
  1. Measure homepage load time
  2. Measure species list load time
  3. Measure image-heavy pages
- **Expected Result**: Pages load within acceptable thresholds

### 7.2 Search Performance
- **Test Case ID**: TC-PERF-002
- **Description**: Test search response times
- **Steps**:
  1. Test species search with various queries
  2. Test with filters applied
- **Expected Result**: Search results return quickly

## 8. Responsive Design Tests

### 8.1 Mobile Viewport
- **Test Case ID**: TC-RESP-001
- **Description**: Test mobile responsiveness
- **Steps**:
  1. Resize browser to mobile dimensions
  2. Verify navigation menu collapses
  3. Check cards stack vertically
  4. Test touch interactions
- **Expected Result**: Full functionality on mobile devices

### 8.2 Tablet Viewport
- **Test Case ID**: TC-RESP-002
- **Description**: Test tablet responsiveness
- **Steps**:
  1. Resize to tablet dimensions
  2. Verify grid layouts adjust
  3. Test navigation and interactions
- **Expected Result**: Optimized layout for tablets

## 9. SEO and Metadata Tests

### 9.1 Meta Tags
- **Test Case ID**: TC-SEO-001
- **Description**: Verify SEO metadata
- **Steps**:
  1. Check page titles are descriptive
  2. Verify meta descriptions present
  3. Check Open Graph tags
- **Expected Result**: Proper SEO optimization

## 10. Error Handling Tests

### 10.1 404 Pages
- **Test Case ID**: TC-ERROR-001
- **Description**: Test 404 error handling
- **Steps**:
  1. Navigate to non-existent route
  2. Verify 404 page displays
  3. Check navigation options provided
- **Expected Result**: User-friendly error page

### 10.2 API Error Handling
- **Test Case ID**: TC-ERROR-002
- **Description**: Test API error responses
- **Steps**:
  1. Simulate network failure
  2. Test with invalid data
  3. Verify error messages display
- **Expected Result**: Graceful error handling

## Test Environment Setup

```bash
# Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis instance
- Environment variables configured

# Run tests
pnpm install
pnpm run dev
# Execute test cases manually or with automation framework
```

## Notes

- All text should display in Spanish
- Images should use WebP format
- Dark mode preference should persist
- Authentication uses Clerk with Spanish localization
- Management pages accessible to authenticated users
- Draft/publish workflow visible (Torres del Paine shows draft indicator)
- Lock system prevents concurrent editing conflicts
- Test credentials: hcarcamovasquez+clerk_test@example.com / Random12345A
- Navigation shows "Gestionar" link when authenticated
- Management sections: Dashboard, Species, Protected Areas, News