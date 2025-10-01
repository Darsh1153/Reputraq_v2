# AI Chatbot Integration - Reputraq

## Overview

This document describes the AI chatbot integration using Google's Gemini 2.5 Flash API for the Reputraq reputation monitoring platform. The chatbot allows users to ask questions about their collected data and get intelligent insights.

## Features

### 🤖 AI-Powered Assistant
- **Gemini 2.5 Flash Integration**: Uses Google's latest AI model for natural language processing
- **Context-Aware Responses**: Analyzes user's collected data to provide relevant insights
- **Real-time Data Access**: Retrieves and analyzes news articles, social media posts, and monitoring data

### 💬 Interactive Chat Interface
- **Modern UI Design**: Sleek, gradient-based design with smooth animations
- **Responsive Layout**: Works on desktop and mobile devices
- **Side Panel Integration**: Toggle-able chatbot panel that doesn't interfere with main dashboard
- **Conversation History**: Maintains context across multiple messages

### 📊 Data Analysis Capabilities
- **Keyword Analysis**: Provides insights about monitored keywords
- **Sentiment Analysis**: Explains sentiment scores and trends
- **Source Analysis**: Identifies top sources and platforms
- **Trend Identification**: Highlights patterns and changes in data

## Technical Implementation

### API Endpoint
- **Route**: `/api/chatbot`
- **Method**: POST
- **Authentication**: Bearer token with user ID
- **Request Body**:
  ```json
  {
    "message": "What are the latest trends for my keywords?",
    "conversationHistory": []
  }
  ```

### Database Integration
The chatbot integrates with the existing database schema:
- **Users Table**: User authentication and monitoring data
- **News Articles Table**: Recent news articles with sentiment analysis
- **Social Posts Table**: Social media posts and engagement data
- **Keywords Table**: User's monitored keywords

### AI Context Building
The system builds comprehensive context for the AI by:
1. Retrieving user's monitored keywords
2. Fetching recent news articles (last 30 days)
3. Collecting social media posts
4. Including monitoring data summaries
5. Formatting data for optimal AI understanding

## File Structure

```
├── app/api/chatbot/
│   └── route.ts                 # API endpoint for chatbot
├── components/
│   ├── AIChatbot.tsx           # Main chatbot component
│   └── AIChatbot.module.scss   # Chatbot styles
├── app/dashboard/
│   └── page.tsx                # Dashboard with chatbot integration
└── components/
    └── SleekDashboard.tsx      # Dashboard with chatbot button
```

## Usage

### For Users
1. **Access**: Click the "AI Assistant" button in the dashboard header
2. **Ask Questions**: Type questions about your data in natural language
3. **Get Insights**: Receive AI-powered analysis of your reputation data
4. **Suggested Questions**: Use pre-built questions to get started quickly

### Example Questions
- "What are the latest trends for my keywords?"
- "Show me the most positive news articles"
- "What's the sentiment analysis for my brand?"
- "Which sources mention my keywords most?"
- "Are there any breaking news about my topics?"

### For Developers

#### Adding New Data Sources
To include additional data in the chatbot context:

1. Update the `getRelevantData` function in `/api/chatbot/route.ts`
2. Add new database queries for your data source
3. Format the data in the `formatDataForPrompt` function
4. Update the system prompt to include instructions for the new data

#### Customizing AI Responses
To modify how the AI responds:

1. Edit the `systemPrompt` in `/api/chatbot/route.ts`
2. Adjust the `generationConfig` parameters
3. Modify the conversation context handling

#### Styling Customization
The chatbot uses SCSS modules for styling:
- Main styles: `components/AIChatbot.module.scss`
- Dashboard integration: `components/SleekDashboard.module.scss`

## Configuration

### Environment Variables
The chatbot uses the following configuration:
- **Gemini API Key**: `AIzaSyCwrKeSW9CCbhodXfG6waFQXnScqDiZD4s`
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

### AI Parameters
- **Temperature**: 0.7 (balanced creativity and accuracy)
- **Top-K**: 40 (diverse token selection)
- **Top-P**: 0.95 (nucleus sampling)
- **Max Output Tokens**: 1024 (response length limit)

## Security Features

### Authentication
- User authentication required for all chatbot requests
- Bearer token validation with user ID extraction
- Database-level user data isolation

### Content Safety
- Google's built-in safety settings enabled
- Harmful content filtering at multiple levels
- Input validation and sanitization

### Data Privacy
- Only user's own data is included in context
- No cross-user data leakage
- Secure API key handling

## Performance Considerations

### Data Retrieval
- Limited to recent data (30 days) for performance
- Pagination for large datasets
- Efficient database queries with proper indexing

### AI Response Time
- Optimized prompt structure for faster responses
- Conversation history limited to last 10 messages
- Caching considerations for frequently asked questions

### UI Responsiveness
- Smooth animations and transitions
- Loading states and error handling
- Responsive design for all screen sizes

## Troubleshooting

### Common Issues

1. **"Authentication required" error**
   - Ensure user is logged in
   - Check if user ID is properly passed in authorization header

2. **"No response generated" error**
   - Check Gemini API key validity
   - Verify API endpoint is accessible
   - Review request format and parameters

3. **Empty or irrelevant responses**
   - Ensure user has collected data
   - Check if keywords are properly configured
   - Verify data context is being built correctly

### Debug Mode
Enable debug logging by adding console.log statements in:
- `/api/chatbot/route.ts` for API debugging
- `components/AIChatbot.tsx` for UI debugging

## Future Enhancements

### Planned Features
- **Voice Input**: Speech-to-text integration
- **Data Visualization**: AI-generated charts and graphs
- **Scheduled Reports**: Automated insights delivery
- **Multi-language Support**: International language support
- **Custom AI Models**: Fine-tuned models for specific industries

### Integration Opportunities
- **Slack/Teams Integration**: Chatbot in team communication tools
- **Email Reports**: AI-generated email summaries
- **Mobile App**: Native mobile chatbot experience
- **API Webhooks**: Real-time data updates to chatbot

## Support

For technical support or feature requests:
1. Check the troubleshooting section above
2. Review the API documentation
3. Test with the provided test script
4. Contact the development team

---

**Note**: This chatbot integration is designed to work seamlessly with the existing Reputraq platform while providing powerful AI-driven insights into reputation monitoring data.
