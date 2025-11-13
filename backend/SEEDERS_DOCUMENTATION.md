# SALON Platform - Database Seeders Documentation

## Overview
This document describes the comprehensive database seeders created for the SALON platform. All seeders have been implemented with production-ready, realistic data.

## Seeders Created

### 1. UsersSeeder.php
**Location**: `/home/user/Salon/backend/database/seeders/UsersSeeder.php`

**Data Created**:
- 5 Super Admins (superadmin1-5@salon.com)
- 10 Branch Admins (admin1-10@salon.com)
- 30 Stylists (stylist1-30@salon.com)
- 60 Clients (client1-60@salon.com)
- **Total**: 105 users

**Features**:
- All passwords hashed as 'password'
- Email verified for all users
- Roles properly assigned via RBAC system
- Realistic Spanish names
- Active status enabled

---

### 2. StylistsSeeder.php
**Location**: `/home/user/Salon/backend/database/seeders/StylistsSeeder.php`

**Data Created**:
- 30 stylist profiles (one for each stylist user)

**Features**:
- Distributed evenly across 3 branches
- Realistic bios with years of experience (1-15 years)
- Specialties: Coloración, Corte, Tratamientos, Barbería, Manicura, Maquillaje, etc.
- Commission rates: 50-70%
- Average ratings: 4.0-5.0 stars
- 60% have certifications
- Active status with start dates

---

### 3. ClientsSeeder.php
**Location**: `/home/user/Salon/backend/database/seeders/ClientsSeeder.php`

**Data Created**:
- 60 client profiles (one for each client user)

**Features**:
- Geographic distribution across Costa Rica, Mexico, Colombia
- Realistic addresses with coordinates
- Preferences (services, styling, reminders, language)
- Birth dates (18-70 years old)
- Gender distribution
- Initial counters (will be updated by reservations/payments)

---

### 4. ServicesSeeder.php
**Location**: `/home/user/Salon/backend/database/seeders/ServicesSeeder.php`

**Data Created**:
- 50-60 services distributed across all branches
- Average: 15-20 services per branch

**Features**:
- Linked to service categories from ServiceCategoriesSeeder
- Realistic pricing: $15-$150
- Duration: 30-180 minutes
- Service types: Hair, Nails, Face, Barbería, Novias
- Detailed descriptions
- 95% active
- Image URLs from picsum.photos

---

### 5. ReservationsSeeder.php
**Location**: `/home/user/Salon/backend/database/seeders/ReservationsSeeder.php`

**Data Created**:
- 200 reservations/appointments

**Features**:
- Status distribution:
  - 50% completed (~100 reservations)
  - 30% confirmed (~60 reservations)
  - 15% pending (~30 reservations)
  - 5% cancelled (~10 reservations)
- Date distribution:
  - 50% in past 3 months (completed/cancelled)
  - 50% in next 2 months (confirmed/pending)
- Properly linked: clients, stylists, services, branches
- Realistic appointment times (9am-6pm, 15-minute intervals)
- 30% have notes

---

### 6. PaymentsSeeder.php
**Location**: `/home/user/Salon/backend/database/seeders/PaymentsSeeder.php`

**Data Created**:
- Payments for all completed and confirmed reservations (~160 payments)

**Features**:
- Status: 'completed' for completed reservations, 'pending' for confirmed
- Payment methods: 60% credit card, 25% debit, 10% cash, 5% PayPal
- Stripe payment IDs: pi_test_xxxxx, ch_test_xxxxx
- PayPal order IDs for PayPal payments
- 30% of customers leave tips (10-20% of service price)
- Tax calculation based on country:
  - Costa Rica: 13% IVA
  - Mexico: 16% IVA
  - Colombia: 19% IVA
- Commission split: Platform (10%), Stylist (50-70%), Branch (remainder)
- Release date: 7 days after payment
- Client IP and browser info
- Metadata with reservation details

---

### 7. InvoicesSeeder.php
**Location**: `/home/user/Salon/backend/database/seeders/InvoicesSeeder.php`

**Data Created**:
- Invoices for all completed payments (~100 invoices)

**Features**:
- Invoice numbers: INV-2024-00001, INV-2024-00002, etc.
- 90% electronic, 10% manual
- Hacienda status distribution:
  - 80% accepted
  - 15% pending
  - 5% rejected
- Hacienda key (50 chars) and consecutive (20 digits)
- Simulated XML content (base64 encoded)
- PDF URLs
- Response codes and messages
- Send attempts tracked
- Proper timestamps

---

### 8. ReviewsSeeder.php
**Location**: `/home/user/Salon/backend/database/seeders/ReviewsSeeder.php`

**Data Created**:
- Reviews for 60% of completed reservations (~60 reviews)

**Features**:
- Rating distribution (weighted toward positive):
  - 50% = 5 stars
  - 30% = 4 stars
  - 15% = 3 stars
  - 4% = 2 stars
  - 1% = 1 star
- Realistic review comments in Spanish
- Different templates per rating level
- 70% have responses from stylists/admins
- Lower ratings more likely to get responses (90%)
- Created 1-7 days after appointment
- Verified status (from real reservations)
- Average rating: ~4.4 stars

---

### 9. PostsSeeder.php
**Location**: `/home/user/Salon/backend/database/seeders/PostsSeeder.php`

**Data Created**:
- 80 Instagram-style posts from stylists

**Features**:
- Distributed over past 6 months
- Captions with hashtags (#hair, #beauty, #salon, etc.)
- 1-3 images per post from picsum.photos
- Tags extracted from hashtags
- 90% are portfolio posts
- Random likes (5-200) and comments (0-50)
- Posted by random stylists
- Realistic beauty content captions

---

### 10. ConversationsSeeder.php
**Location**: `/home/user/Salon/backend/database/seeders/ConversationsSeeder.php`

**Data Created**:
- 40 conversations between clients and stylists
- 5-10 messages per conversation (~280 messages total)

**Features**:
- Realistic message content:
  - Booking inquiries
  - Service questions
  - Price information
  - Follow-ups
  - Confirmations
- Alternating between client and stylist
- Time gaps between messages (5 min to 2 hours)
- 80% of messages marked as read
- Last message tracking
- Distributed over past 3 months
- Sequential timestamps

---

### 11. PromotionsSeeder.php
**Location**: `/home/user/Salon/backend/database/seeders/PromotionsSeeder.php`

**Data Created**:
- 10 promotions

**Features**:
- Distribution:
  - Active promotions (currently valid)
  - Expired promotions (past)
  - Future promotions (upcoming)
- Discount types:
  - Percentage (15-50%)
  - Fixed amount ($15-$30)
- Examples:
  - First visit discount (20%)
  - Combo specials
  - Happy hours
  - Seasonal promotions
  - Black Friday
  - Special occasions
- Usage limits and tracking
- Applicable days (Monday happy hour, Tuesday specials)
- Minimum purchase requirements
- User usage limits
- Unique 8-character codes
- Branch-specific

---

## Running the Seeders

### Option 1: Run All Seeders
```bash
cd /home/user/Salon/backend
php artisan db:seed
```

### Option 2: Run Specific Seeder
```bash
php artisan db:seed --class=UsersSeeder
php artisan db:seed --class=StylistsSeeder
# etc...
```

### Option 3: Fresh Migration + Seed
```bash
php artisan migrate:fresh --seed
```

---

## Seeding Order (Automatic)

The seeders run in this order to maintain referential integrity:

1. **RolesAndPermissionsSeeder** (existing)
2. **PlansSeeder** (existing)
3. **ServiceCategoriesSeeder** (existing)
4. **BranchesSeeder** (existing)
5. **UsersSeeder** ⭐ NEW
6. **StylistsSeeder** ⭐ NEW
7. **ClientsSeeder** ⭐ NEW
8. **ServicesSeeder** ⭐ NEW
9. **ReservationsSeeder** ⭐ NEW
10. **PaymentsSeeder** ⭐ NEW
11. **InvoicesSeeder** ⭐ NEW
12. **ReviewsSeeder** ⭐ NEW
13. **PostsSeeder** ⭐ NEW
14. **ConversationsSeeder** ⭐ NEW
15. **PromotionsSeeder** ⭐ NEW

---

## Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 105 | 5 super_admins, 10 admins, 30 stylists, 60 clients |
| Stylists | 30 | Across 3 branches |
| Clients | 60 | Various locations |
| Services | 50-60 | ~15-20 per branch |
| Reservations | 200 | Various statuses and dates |
| Payments | ~160 | For completed/confirmed reservations |
| Invoices | ~100 | For completed payments |
| Reviews | ~60 | 60% of completed reservations |
| Posts | 80 | Instagram-style portfolio |
| Conversations | 40 | With 5-10 messages each |
| Messages | ~280 | Realistic client-stylist chats |
| Promotions | 10 | Active, expired, and future |

---

## Login Credentials

All users have the password: **password**

### Super Admins:
- superadmin1@salon.com
- superadmin2@salon.com
- ... up to superadmin5@salon.com

### Branch Admins:
- admin1@salon.com
- admin2@salon.com
- ... up to admin10@salon.com

### Stylists:
- stylist1@salon.com
- stylist2@salon.com
- ... up to stylist30@salon.com

### Clients:
- client1@salon.com
- client2@salon.com
- ... up to client60@salon.com

---

## Key Features

1. **Realistic Data**: All data uses realistic Spanish names, addresses, and content
2. **Referential Integrity**: Proper foreign key relationships maintained
3. **Proper Dates**: Uses Carbon for realistic date distribution
4. **Status Distribution**: Realistic distribution of statuses (completed, pending, etc.)
5. **Weighted Randomization**: Better ratings more common, realistic patterns
6. **Clear Data**: Existing data cleared before seeding
7. **Console Output**: Informative feedback during seeding
8. **Production Quality**: Ready for development, staging, or demo environments
9. **No Syntax Errors**: All seeders verified for syntax correctness

---

## Testing After Seeding

```bash
# Check user count
php artisan tinker
>>> \App\Models\User::count()
>>> \App\Models\Stylist::count()
>>> \App\Models\Client::count()
>>> \App\Models\Reservation::count()
>>> \App\Models\Payment::count()
>>> \App\Models\Review::count()

# Check average rating
>>> \App\Models\Review::avg('rating')

# Check payment total
>>> \App\Models\Payment::sum('amount_total')
```

---

## Notes

- All seeders use Faker for Spanish locale (`es_ES`)
- Images use picsum.photos with unique seeds
- Payment IDs use test prefixes (pi_test_, ch_test_)
- All data is suitable for development/demo purposes
- Data relationships are properly maintained
- Console output provides detailed statistics

---

## Support

For issues or questions about the seeders, check:
1. Laravel logs: `/home/user/Salon/backend/storage/logs/laravel.log`
2. Database structure: Ensure migrations have been run
3. Model relationships: Check that all models are properly defined

---

**Created**: November 13, 2025
**Status**: ✅ Complete and Ready to Use
**Quality**: Production-Ready
