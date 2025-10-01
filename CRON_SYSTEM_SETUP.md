# Cron Job & Historical Data System Setup Guide

## 🎯 Overview

This guide will help you set up the automated data collection system with historical data storage and a beautiful date range slider for filtering past data.

## 📋 Features Implemented

### ✅ **Automated Data Collection (Cron Jobs)**
- **24-hour automated data collection** (configurable: 6h, 12h, 24h, 48h)
- **Automatic scheduling** based on user preferences
- **Job status tracking** with detailed history
- **Error handling and retry logic**
- **Timezone support** for global users

### ✅ **Historical Data Storage**
- **30-day data retention** with automatic cleanup
- **Separate storage** for news and social data
- **Job-based data organization** for tracking
- **Sentiment analysis** and engagement metrics
- **Full data integrity** with foreign key relationships

### ✅ **Advanced Date Range Filtering**
- **Beautiful date range slider** with preset options
- **Custom date range selection**
- **Keyword-based filtering**
- **Data type filtering** (news, social, or all)
- **Real-time data updates**

### ✅ **User Interface Components**
- **Historical Data Display** with pagination
- **Cron Job Manager** for automation settings
- **Dashboard integration** with quick access links
- **Responsive design** for all devices

## 🚀 Installation Steps

### **Step 1: Install Dependencies**

```bash
npm install node-cron @types/node-cron
```

### **Step 2: Run Database Migration**

```bash
# Apply the new database schema
psql $DATABASE_URL -f drizzle/0002_add_historical_data_tables.sql
```

### **Step 3: Environment Variables**

Ensure your `.env.local` file has:

```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
NODE_ENV=production
```

### **Step 4: Start the Application**

```bash
npm run dev
```

## 📊 Database Schema

### **New Tables Created:**

1. **`data_collection_jobs`** - Tracks automated collection jobs
2. **`historical_news_data`** - Stores historical news articles
3. **`historical_social_data`** - Stores historical social posts
4. **`cron_job_settings`** - User-specific automation settings

### **Key Features:**
- **Automatic cleanup** of data older than 30 days
- **Indexed queries** for fast date-based filtering
- **Foreign key relationships** for data integrity
- **JSONB storage** for flexible metadata

## 🎛️ Usage Guide

### **Accessing Historical Data**

1. **Navigate to Dashboard** → Click "View Historical Data"
2. **Use Date Range Slider** → Select preset or custom range
3. **Filter by Keyword** → Choose specific keywords
4. **Filter by Data Type** → News, Social, or All

### **Managing Automation**

1. **Navigate to Dashboard** → Click "Manage Automation"
2. **Configure Settings:**
   - **Collection Interval**: 6h, 12h, 24h, 48h
   - **Timezone**: Choose your local timezone
   - **Enable/Disable**: Toggle automatic collection
3. **Monitor Jobs** → View recent collection history
4. **Run Now** → Trigger immediate data collection

### **API Endpoints**

#### **Cron Management**
```bash
# Get cron settings
GET /api/cron
Authorization: Bearer <token>

# Update cron settings
PUT /api/cron
{
  "isEnabled": true,
  "intervalHours": 24,
  "timezone": "UTC"
}

# Get job history
POST /api/cron
{
  "action": "getJobHistory"
}

# Run data collection now
POST /api/cron
{
  "action": "runNow"
}
```

#### **Historical Data**
```bash
# Get historical data with filters
GET /api/historical-data?startDate=2025-01-01&endDate=2025-01-30&keyword=example&type=news&limit=50&offset=0

# Get data summary
POST /api/historical-data
{
  "action": "getSummary",
  "startDate": "2025-01-01",
  "endDate": "2025-01-30",
  "keyword": "example"
}
```

## 🔧 Configuration Options

### **Cron Job Settings**

| Setting | Options | Default | Description |
|---------|---------|---------|-------------|
| `intervalHours` | 6, 12, 24, 48 | 24 | Collection frequency |
| `timezone` | UTC, EST, PST, etc. | UTC | User's timezone |
| `isEnabled` | true/false | true | Enable/disable automation |

### **Data Retention**

- **Historical Data**: 30 days (automatic cleanup)
- **Job Records**: 90 days (for audit trail)
- **Settings**: Permanent (until user changes)

## 🎨 UI Components

### **DateRangeSlider**
- **Preset buttons**: Last 7, 14, 30, 90 days
- **Custom date picker**: Start and end date selection
- **Keyword filtering**: Dropdown with user's keywords
- **Real-time updates**: Instant data refresh

### **HistoricalDataDisplay**
- **Data type tabs**: All, News, Social
- **Pagination**: 20 items per page
- **Sentiment indicators**: Color-coded sentiment scores
- **Engagement metrics**: Views, shares, comments
- **Source information**: Platform and publication details

### **CronJobManager**
- **Status indicators**: Enabled/Disabled with visual cues
- **Interval selection**: Quick preset buttons
- **Timezone picker**: Global timezone support
- **Job history**: Recent collection status
- **Manual triggers**: Run now button

## 🚨 Troubleshooting

### **Common Issues**

1. **Cron Jobs Not Running**
   - Check if `NODE_ENV=production`
   - Verify database connection
   - Check user's cron settings

2. **Historical Data Not Loading**
   - Ensure database migration completed
   - Check API endpoint responses
   - Verify user authentication

3. **Date Filter Not Working**
   - Check date format (YYYY-MM-DD)
   - Verify date range is valid
   - Check browser console for errors

### **Debug Commands**

```bash
# Check cron job status
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/cron

# Test historical data API
curl -H "Authorization: Bearer <token>" "http://localhost:3000/api/historical-data?startDate=2025-01-01&endDate=2025-01-30"

# Check database tables
psql $DATABASE_URL -c "SELECT COUNT(*) FROM historical_news_data;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM data_collection_jobs;"
```

## 📈 Performance Considerations

### **Database Optimization**
- **Indexes**: Created on frequently queried columns
- **Cleanup**: Automatic removal of old data
- **Pagination**: Limits data transfer size
- **Connection pooling**: Efficient database connections

### **Frontend Optimization**
- **Lazy loading**: Components load on demand
- **Caching**: API responses cached appropriately
- **Debouncing**: Search inputs debounced
- **Responsive design**: Optimized for all devices

## 🔒 Security Features

- **Authentication**: Bearer token validation
- **User isolation**: Data scoped to user ID
- **SQL injection protection**: Parameterized queries
- **Input validation**: All inputs sanitized
- **Rate limiting**: API endpoints protected

## 🎯 Next Steps

1. **Test the system** with sample data
2. **Configure automation** for your keywords
3. **Explore historical data** with different filters
4. **Monitor job status** and performance
5. **Customize settings** based on your needs

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the browser console for errors
3. Check the server logs for API errors
4. Verify database connectivity and permissions

---

**🎉 Congratulations!** You now have a fully automated data collection system with beautiful historical data visualization and filtering capabilities!
