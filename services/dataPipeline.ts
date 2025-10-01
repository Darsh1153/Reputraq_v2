import { backendUrl } from "@/config";
import axios from "axios";

const baseUrl = "https://api.staging.insightiq.ai/v1/work-platforms";

const headers = {
  Accept: "application/json",
  Authorization:
    "Basic NWU2ZDkwZjYtYmMxZS00OTc5LWJlYmEtY2YzOTA5ZjgxZGMxOjg1ZTZiY2UzLTA1MmMtNGJmYy1hNDJhLTY5NmFhM2ZhMjk0OQ==",
};

export const gleanData = async (keyword: string) => {
  try {
    console.log(`Starting data collection for keyword: ${keyword}`);

    // Step 1: Get news data from APITube
    console.log(`Making APITube request for keyword: ${keyword}`);
    const apitubeUrl = `https://api.apitube.io/v1/news/everything?per_page=10&sort.order=desc&title=${encodeURIComponent(keyword)}&api_key=api_live_OjeHlbtTqz6wIyLmJppEHQSbgj49er5AlFaNWdsNJbpT7Ub`;
    console.log(`APITube URL: ${apitubeUrl}`);
    
    const apitube_response = await axios.get(apitubeUrl, {
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });

    console.log(`News data for ${keyword}:`, apitube_response.data);

    // Step 2: Create social search
    console.log(`Creating social search for keyword: ${keyword}`);
    const create_social_response = await axios.post(
      "https://api.staging.insightiq.ai/v1/social/creators/contents/search",
      {
        work_platform_id: "de55aeec-0dc8-4119-bf90-16b3d1f0c987",
        keyword: keyword,
      },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:
            "Basic NWU2ZDkwZjYtYmMxZS00OTc5LWJlYmEtY2YzOTA5ZjgxZGMxOjg1ZTZiY2UzLTA1MmMtNGJmYy1hNDJhLTY5NmFhM2ZhMjk0OQ==",
        },
      },
    );
    console.log(
      `Social search created for ${keyword}:`,
      create_social_response.data,
    );

    const searchId = create_social_response.data.id;
    console.log(`Search ID for ${keyword}:`, searchId);

    // Step 3: Quick status check (only 3 attempts, 5 seconds each)
    let socialData = null;
    let attempts = 0;
    const maxAttempts = 3; // Only 15 seconds max

    while (attempts < maxAttempts) {
      try {
        const status_response = await axios.get(
          `https://api.staging.insightiq.ai/v1/social/creators/contents/search/${searchId}`,
          {
            timeout: 10000, // 10 second timeout
            headers: {
              Accept: "application/json",
              Authorization:
                "Basic NWU2ZDkwZjYtYmMxZS00OTc5LWJlYmEtY2YzOTA5ZjgxZGMxOjg1ZTZiY2UzLTA1MmMtNGJmYy1hNDJhLTY5NmFhM2ZhMjk0OQ==",
            },
          },
        );

        console.log(
          `Status check ${attempts + 1} for ${keyword}:`,
          status_response.data.status,
        );

        if (status_response.data.status === "SUCCESS") {
          // Step 4: Get social insights
          const getSocial_insight = await axios.get(
            `https://api.staging.insightiq.ai/v1/social/creators/contents/search/${searchId}/fetch`,
            {
              timeout: 10000, // 10 second timeout
              headers: {
                Accept: "application/json",
                Authorization:
                  "Basic NWU2ZDkwZjYtYmMxZS00OTc5LWJlYmEtY2YzOTA5ZjgxZGMxOjg1ZTZiY2UzLTA1MmMtNGJmYy1hNDJhLTY5NmFhM2ZhMjk0OQ==",
              },
            },
          );

          socialData = getSocial_insight.data;
          console.log(`Social data fetched for ${keyword}:`, socialData);
          break;
        } else if (
          status_response.data.status === "FAILED" ||
          status_response.data.error
        ) {
          console.error(
            `Social search failed for ${keyword}:`,
            status_response.data.error,
          );
          break;
        }
      } catch (statusError) {
        console.error(`Status check failed for ${keyword} (attempt ${attempts + 1}):`, statusError);
        // Continue to next attempt
      }

      // Wait 5 seconds before next check (reduced from 10)
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.warn(
        `Social data collection timed out for ${keyword} after ${maxAttempts} attempts. Will return news data only.`,
      );
    }

    return {
      keyword,
      newsData: apitube_response.data,
      socialData: socialData || {
        data: [],
        metadata: { message: "Social data collection failed or timed out" },
      },
      socialSearchId: searchId, // Store the search ID for later checking
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching data for keyword ${keyword}:`, error);
    console.error(`Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? (error as any).code : 'Unknown',
      cause: error instanceof Error && 'cause' in error ? (error as any).cause : 'Unknown'
    });
    
    // Return partial data even if social collection fails
    try {
      console.log(`Attempting fallback news data collection for ${keyword}`);
      const apitube_response = await axios.get(
        `https://api.apitube.io/v1/news/everything?per_page=10&sort.order=desc&title=${encodeURIComponent(keyword)}&api_key=api_live_OjeHlbtTqz6wIyLmJppEHQSbgj49er5AlFaNWdsNJbpT7Ub`,
        {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          }
        }
      );

      return {
        keyword,
        newsData: apitube_response.data,
        socialData: {
          data: [],
          metadata: { message: "Social data collection failed" },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (newsError) {
      console.error(`Failed to fetch news data for ${keyword}:`, newsError);
      // Return empty data structure instead of throwing
      return {
        keyword,
        newsData: { results: [], status: "error", message: "Failed to fetch news data" },
        socialData: { data: [], metadata: { message: "Failed to fetch social data" } },
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
};

export const collectAllData = async (keywords: string[]) => {
  const allData = [];

  console.log(
    `Starting data collection for ${keywords.length} keywords:`,
    keywords,
  );

  for (const keyword of keywords) {
    try {
      console.log(`Processing keyword: ${keyword}`);
      const data = await gleanData(keyword);
      allData.push(data);
      console.log(`Successfully processed keyword: ${keyword}`);
    } catch (error) {
      console.error(`Failed to fetch data for keyword: ${keyword}`, error);

      // Add a fallback entry with just the keyword and error info
      allData.push({
        keyword,
        newsData: {
          results: [],
          status: "error",
          message: "Failed to fetch news data",
        },
        socialData: {
          data: [],
          metadata: { message: "Failed to fetch social data" },
        },
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  console.log(
    `Data collection completed. Processed ${allData.length} keywords out of ${keywords.length}`,
  );
  return allData;
};
