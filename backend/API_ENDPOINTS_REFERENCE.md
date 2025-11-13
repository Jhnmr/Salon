# SALON API - Quick Reference Guide

## Base URL
```
http://localhost:8000/api/v1
```

---

## Authentication Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/refresh` | Refresh JWT token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |

### Protected (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/logout` | Logout user |
| GET | `/auth/user` | Get current user |
| POST | `/auth/revoke-all` | Revoke all tokens |
| PUT | `/auth/update-profile` | Update profile |
| PUT | `/auth/change-password` | Change password |

---

## Posts (Social Portfolio)

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | List posts (filters: stylist_id, branch_id, tag, is_portfolio, search) |
| GET | `/posts/{id}` | Get specific post |

### Protected (JWT Required)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/posts/feed` | Get personalized feed | All users |
| POST | `/posts` | Create post | Stylists only |
| PUT | `/posts/{id}` | Update post | Owner/Admin |
| DELETE | `/posts/{id}` | Delete post | Owner/Admin |
| POST | `/posts/{id}/like` | Toggle like | All users |
| POST | `/posts/{id}/comment` | Add comment | All users |

---

## Conversations (Chat)

### All Protected (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | List user's conversations |
| GET | `/conversations/search` | Search conversations |
| GET | `/conversations/{id}` | Get conversation details |
| POST | `/conversations` | Start new conversation |
| DELETE | `/conversations/{id}` | Archive conversation |
| GET | `/conversations/{id}/messages` | Get messages (paginated) |
| PUT | `/conversations/{id}/read` | Mark all as read |

---

## Messages

### All Protected (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/messages` | Send message |
| PUT | `/messages/{id}` | Edit message (15min window) |
| DELETE | `/messages/{id}` | Delete message |
| PUT | `/messages/{id}/read` | Mark as read |
| GET | `/messages/unread-count` | Get unread count |
| GET | `/messages/search` | Search messages |

---

## Promotions

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/promotions` | List active promotions |
| GET | `/promotions/{id}` | Get promotion details |

### Protected (JWT Required)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/promotions/validate` | Validate promo code | All users |
| POST | `/promotions/apply` | Apply promotion | All users |
| POST | `/promotions` | Create promotion | Admin only |
| PUT | `/promotions/{id}` | Update promotion | Admin only |
| DELETE | `/promotions/{id}` | Delete promotion | Admin only |
| GET | `/promotions/{id}/statistics` | Get statistics | Admin only |

---

## Reservations

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reservations/available-slots` | Get available time slots |

### Protected (JWT Required)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/reservations` | List reservations | All users |
| GET | `/reservations/{id}` | Get reservation | All users |
| POST | `/reservations` | Create reservation | Clients/Admin |
| PUT | `/reservations/{id}` | Update reservation | Owner/Stylist/Admin |
| POST | `/reservations/check-availability` | Check availability | All users |
| POST | `/reservations/{id}/cancel` | Cancel (24h policy) | Client/Admin |
| POST | `/reservations/{id}/confirm` | Confirm reservation | Stylist/Admin |
| POST | `/reservations/{id}/complete` | Mark completed | Stylist/Admin |

---

## Services

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services` | List services |
| GET | `/services/{id}` | Get service |
| GET | `/services/category/{category}` | Get by category |

### Protected (JWT Required)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/services` | Create service | Admin only |
| PUT | `/services/{id}` | Update service | Admin only |
| DELETE | `/services/{id}` | Delete service | Admin only |

---

## Branches

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/branches` | List branches |
| GET | `/branches/{id}` | Get branch |

### Protected (JWT Required)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/branches` | Create branch | Admin only |
| PUT | `/branches/{id}` | Update branch | Admin only |
| DELETE | `/branches/{id}` | Delete branch | Admin only |

---

## Stylists

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stylists` | List stylists |
| GET | `/stylists/{id}` | Get stylist |
| GET | `/stylists/{id}/reviews` | Get reviews |

### Protected (JWT Required)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/stylists` | Create stylist | Admin only |
| PUT | `/stylists/{id}` | Update stylist | Admin only |
| DELETE | `/stylists/{id}` | Delete stylist | Admin only |
| GET | `/stylists/{id}/schedule` | Get schedule | All users |

---

## Users

### All Protected (JWT Required - Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List users |
| GET | `/users/role/{role}` | Get by role |
| GET | `/users/statistics` | Get statistics |
| GET | `/users/{id}` | Get user |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |
| POST | `/users/{id}/activate` | Activate user |
| POST | `/users/{id}/deactivate` | Deactivate user |

---

## Availability

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/availability/{stylistId}` | Get stylist availability |
| GET | `/availability/{stylistId}/{day}` | Get by day |

### Protected (JWT Required - Stylist Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/availability/mine` | Get my availability |
| POST | `/availability` | Create availability |
| PUT | `/availability/{id}` | Update availability |
| DELETE | `/availability/{id}` | Delete availability |
| POST | `/availability/bulk-set` | Bulk set availability |

---

## Notifications

### All Protected (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| GET | `/notifications/unread` | Get unread |
| GET | `/notifications/unread/count` | Get unread count |
| PUT | `/notifications/{id}/read` | Mark as read |
| POST | `/notifications/mark-all-read` | Mark all as read |
| DELETE | `/notifications/{id}` | Delete notification |

---

## Dashboards

### All Protected (JWT Required)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard` | Generic dashboard (auto-detects role) | All users |
| GET | `/dashboard/stats` | Quick stats | All users |
| GET | `/dashboard/client` | Client dashboard | Clients only |
| GET | `/dashboard/stylist` | Stylist dashboard | Stylists only |
| GET | `/dashboard/admin` | Admin dashboard | Admins only |
| GET | `/dashboard/super-admin` | Super admin dashboard | Super admin only |
| GET | `/dashboard/analytics` | Analytics data | Admin only |

---

## Invoices

### All Protected (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invoices` | List invoices |
| GET | `/invoices/{id}` | Get invoice |
| POST | `/invoices` | Create invoice |
| PUT | `/invoices/{id}` | Update invoice |
| GET | `/invoices/{id}/download` | Download invoice |

---

## Payments

### All Protected (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments` | List payments |
| GET | `/payments/{id}` | Get payment |
| POST | `/payments` | Create payment |
| POST | `/payments/process` | Process payment |
| POST | `/payments/{id}/refund` | Refund payment |
| GET | `/payments/methods` | Get payment methods |

---

## Audit Logs

### All Protected (JWT Required - Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit-logs` | List audit logs |
| GET | `/audit-logs/{id}` | Get audit log |

---

## Reviews

### All Protected (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reviews` | Create review |
| PUT | `/reviews/{id}` | Update review |
| DELETE | `/reviews/{id}` | Delete review |

---

## Favorites

### All Protected (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/favorites` | List favorites |
| POST | `/favorites` | Add favorite |
| DELETE | `/favorites/{id}` | Remove favorite |

---

## Common Query Parameters

### Pagination
- `per_page` - Items per page (default: 15)
- `page` - Page number (default: 1)

### Filtering
- `search` - Search term
- `filter[field]` - Filter by field
- `sort` - Sort field
- `order` - Sort order (asc/desc)

### Date Ranges
- `from` - Start date (YYYY-MM-DD)
- `to` - End date (YYYY-MM-DD)

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    ...
  },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "Error message"
}
```

### Validation Error Response
```json
{
  "success": false,
  "data": {
    "field1": ["Error message 1"],
    "field2": ["Error message 2"]
  },
  "message": "Validation failed"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Successful request |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |

---

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Get token from `/auth/login` or `/auth/register` endpoints.

---

## Rate Limiting

Consider implementing rate limiting for:
- Message sending: 30 messages/minute
- API requests: 60 requests/minute
- File uploads: 10 uploads/minute

---

## File Upload Limits

| Type | Max Size | Formats |
|------|----------|---------|
| Post Images | 5MB | jpeg, png, jpg, gif |
| Message Attachments | 10MB | All types |

---

## Business Rules

### Reservations
- Must be at least 1 hour in advance
- Business hours: 9 AM - 6 PM
- 24-hour cancellation policy (admins exempt)

### Messages
- 15-minute edit window
- Only sender can edit/delete

### Posts
- Stylists only can create
- Up to 5 images per post
- Owner or admin can update/delete

### Promotions
- Auto-generated codes if not provided
- Complex validation (dates, limits, services, days)
- Admin-only CRUD operations

---

**Last Updated:** November 13, 2025
**API Version:** v1
