1. GET
   curl --request GET \
   --url https://api.staging.insightiq.ai/v1/work-platforms \
   --header 'Accept: application/json' \
   --header 'Authorization: Basic NWU2ZDkwZjYtYmMxZS00OTc5LWJlYmEtY2YzOTA5ZjgxZGMxOjg1ZTZiY2UzLTA1MmMtNGJmYy1hNDJhLTY5NmFhM2ZhMjk0OQ=='

this will return list of social media platforms

```json
{
  "data": [
    {
      "id": "de55aeec-0dc8-4119-bf90-16b3d1f0c987", # we need this id
      "name": "TikTok",
      "logo_url": "https://cdn.getphyllo.com/platforms_logo/logos/logo_tiktok.png",
      "created_at": "2021-10-30T11:31:57.886681",
      "updated_at": "2021-10-30T11:31:57.886681",
      "category": "SOCIAL",
      "status": "ACTIVE",
      "url": "https://www.tiktok.com",
    },
   {
      ...
   }
  ]
}
```

there will be list of items, each item is a social media platforms. get all the ids of those
platforms

2. POST
   curl --request POST \
    --url https://api.staging.insightiq.ai/v1/social/creators/contents/search \
    --header 'Accept: application/json' \
    --header 'Authorization: Basic NWU2ZDkwZjYtYmMxZS00OTc5LWJlYmEtY2YzOTA5ZjgxZGMxOjg1ZTZiY2UzLTA1MmMtNGJmYy1hNDJhLTY5NmFhM2ZhMjk0OQ==' \
    --header 'Content-Type: application/json' \
    --data '{
   "work_platform_id": "de55aeec-0dc8-4119-bf90-16b3d1f0c987",
   "keyword": "tesla"
   }'

```json
{
  "id": "d841ece5-134b-4d76-be3d-1c500d3a6c25",
  "keyword": "tesla",
  "hashtag": null,
  "mention": null,
  "from_date": null,
  "to_date": null,
  "items_limit": 10,
  "audio_track_info": null,
  "status": "IN_PROGRESS",
  "work_platform": {
    "id": "de55aeec-0dc8-4119-bf90-16b3d1f0c987",
    "name": "TikTok",
    "logo_url": "https://cdn.insightiq.ai/platforms_logo/logos/logo_tiktok.png"
  },
  "error": null
}
```

we need to pass those social media platforms ids. Pass those ids one by one in the body
"work_platform_id" for that keyword. you see from the result that "status" is "IN_PROGRESS", after hitting this api
we need to check the status of the request with the following api, we going to use the "id" (d841ece5-134b-4d76-be3d-1c500d3a6c25) - job id in the api url

3. GET
   curl --request GET \
    --url https://api.staging.insightiq.ai/v1/social/creators/contents/search/d841ece5-134b-4d76-be3d-1c500d3a6c25 \
    --header 'Accept: application/json' \
    --header 'Authorization: Basic NWU2ZDkwZjYtYmMxZS00OTc5LWJlYmEtY2YzOTA5ZjgxZGMxOjg1ZTZiY2UzLTA1MmMtNGJmYy1hNDJhLTY5NmFhM2ZhMjk0OQ=='

```json
{
  "id": "d841ece5-134b-4d76-be3d-1c500d3a6c25",
  "keyword": "tesla",
  "hashtag": null,
  "mention": null,
  "from_date": null,
  "to_date": null,
  "items_limit": 10,
  "audio_track_info": null,
  "status": "SUCCESS",
  "work_platform": {
    "id": "de55aeec-0dc8-4119-bf90-16b3d1f0c987",
    "name": "TikTok",
    "logo_url": "https://cdn.insightiq.ai/platforms_logo/logos/logo_tiktok.png"
  },
  "error": null
}
```

in the response we see "status" is "SUCCESS", now we can get the result with the following api

4. GET
   curl --request GET \
    --url https://api.staging.insightiq.ai/v1/social/creators/contents/search/d841ece5-134b-4d76-be3d-1c500d3a6c25/fetch \
    --header 'Accept: application/json' \
    --header 'Authorization: Basic NWU2ZDkwZjYtYmMxZS00OTc5LWJlYmEtY2YzOTA5ZjgxZGMxOjg1ZTZiY2UzLTA1MmMtNGJmYy1hNDJhLTY5NmFhM2ZhMjk0OQ=='

```json
{
  "data": [
    {
      "work_platform": {
        "id": "de55aeec-0dc8-4119-bf90-16b3d1f0c987",
        "name": "TikTok",
        "logo_url": "https://cdn.insightiq.ai/platforms_logo/logos/logo_tiktok.png"
      },
      "profile": {
        "platform_username": "voitures06",
        "url": "https://www.tiktok.com/@voitures06",
        "image_url": null
      },
      "title": "#tesla ",
      "description": "#tesla ",
      "format": "VIDEO",
      "type": "VIDEO",
      "url": "https://www.tiktok.com/@voitures06/video/7546706037718404359",
      "media_url": "https://v16-webapp-prime.tiktok.com/video/tos/alisg/tos-alisg-pve-0037c001/oQA1IiRZkLY9BSBAIVPa7BEQ50StK7acCEivU/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=1508&bt=754&cs=0&ds=6&ft=-Csk_mHjPD12N07T2h-Ux.4FpYKt3wv25bcAp&mime_type=video_mp4&qs=4&rc=ODc6NmY7ZDxoOTg7ZDRnZUBpM3Zwbm85cnVuNTMzODczNEAyMDJgYTA2NWMxYWEtMzEvYSNhNWMtMmRrZXFhLS1kMTFzcw%3D%3D&btag=e00088000&expire=1757278270&l=202509060450394BDA5F5F37CA9A3E8C4B&ply_type=2&policy=2&signature=c51317f2262e0ae0d89f6db09e74fbf1&tk=tt_chain_token",
      "thumbnail_url": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/o8CXENCoBgAIECRsAEYTfAeA7xGDuFyk0UdS3E~tplv-tiktokx-origin.image?dr=14575&x-expires=1757275200&x-signature=a20cSbPr6Ita9OxT52DHvGiv4Po%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=maliva",
      "published_at": "2025-09-05T20:33:58",
      "platform_content_id": "7546706037718404359",
      "duration": 31,
      "engagement": {
        "like_count": 49,
        "view_count": 809,
        "share_count": 0,
        "comment_count": 2
      },
      "audio_track_info": {
        "id": "7330304805191355168",
        "title": "الصوت الأصلي - آســـكــار 💎",
        "artist": "أحمد🇱🇾",
        "original": true
      },
      "mentions": null,
      "hashtags": ["tesla"],
      "media_urls": null
    },
    {
      "work_platform": {
        "id": "de55aeec-0dc8-4119-bf90-16b3d1f0c987",
        "name": "TikTok",
        "logo_url": "https://cdn.insightiq.ai/platforms_logo/logos/logo_tiktok.png"
      },
      "profile": {
        "platform_username": "tesloid2",
        "url": "https://www.tiktok.com/@tesloid2",
        "image_url": null
      },
      "title": "Настрой автоматическое торможение и рекуперацию в Tesla!!#tesla #automobile #рекомендации #modely ",
      "description": "Настрой автоматическое торможение и рекуперацию в Tesla!!#tesla #automobile #рекомендации #modely ",
      "format": "VIDEO",
      "type": "VIDEO",
      "url": "https://www.tiktok.com/@tesloid2/video/7546699494742592790",
      "media_url": "https://v16-webapp-prime.tiktok.com/video/tos/no1a/tos-no1a-ve-0068c001-no/oceQAIixGy0giAhe2c07tQnlIJFGRGLfQqfWCC/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=946&bt=473&cs=0&ds=6&ft=4fUEKMzD8Zmo0Y3-oI4jVsE_JpWrKsd.&mime_type=video_mp4&qs=0&rc=NDs6NTY1Ozg0OjQ2NTpoZ0BpajVuO3I5cmVuNTMzbzczNUBfNjYuMC4vNjAxYGIvYDJgYSNiLmVpMmRzM3FhLS1kMTFzcw%3D%3D&btag=e000b0000&expire=1757278247&l=202509060450334A5900227C8B203F82B1&ply_type=2&policy=2&signature=2bf4c460b4bc0b6962372388bc45f721&tk=tt_chain_token",
      "thumbnail_url": "https://p16-pu-sign-no.tiktokcdn-eu.com/tos-no1a-p-0037-no/owaDEFAFBI2xeRCgVdEuEMQ0K6QvDfiBkzwoE7~tplv-tiktokx-dmt-logom:tos-no1a-i-0068-no/oAEizAaDBm9AYFHhiLEAB7vLBA7ZiNBCQyptI.image?dr=14573&x-expires=1757275200&x-signature=DwXmpvegCHfO1pEY7H0gZ9BDJyo%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=maliva",
      "published_at": "2025-09-05T20:08:24",
      "platform_content_id": "7546699494742592790",
      "duration": 13,
      "engagement": {
        "like_count": 8,
        "view_count": 457,
        "share_count": 2,
        "comment_count": 1
      },
      "audio_track_info": {
        "id": "7546699514571344662",
        "title": "оригінальний звук",
        "artist": "Tesloid",
        "original": true
      },
      "mentions": null,
      "hashtags": ["automobile", "modely", "tesla", "рекомендации"],
      "media_urls": null
    }
  ]
}
```

now this will return data for that specific keyword
