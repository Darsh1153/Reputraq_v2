'use client';

import React from 'react';

const features = [
  {
    icon: (
      <svg
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        className="text-blue-600"
      >
        <path
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 001-1v-4a1 1 0 00-1-1h-2a1 1 0 00-1 1v4a1 1 0 001 1z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Real-time Monitoring",
    description: "Track mentions across social media, news, and review platforms with instant alerts and notifications."
  },
  {
    icon: (
      <svg
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        className="text-blue-600"
      >
        <path
          d="M11 17a4 4 0 100-8 4 4 0 000 8zm0-10V4m0 14v-3m7-7h-3m3 0h3m-14 0H4m3 0H4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "AI Sentiment Analysis",
    description: "Get intelligent insights into customer sentiment and brand perception with advanced AI algorithms."
  },
  {
    icon: (
      <svg
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        className="text-blue-600"
      >
        <path
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Advanced Analytics",
    description: "Comprehensive reporting and analytics to track trends, measure impact, and make data-driven decisions."
  },
  {
    icon: (
      <svg
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        className="text-blue-600"
      >
        <path
          d="M12 4v1m0 14v1m8-9h-1M5 12H4m15.36 6.36l-.707-.707M6.343 6.343l-.707-.707M18.364 6.343l-.707.707M6.343 17.657l-.707.707"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Competitor Tracking",
    description: "Monitor competitor mentions and benchmark your reputation against industry leaders."
  },
  {
    icon: (
      <svg
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        className="text-blue-600"
      >
        <path
          d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 7h5l-5-5v5z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Crisis Management",
    description: "Rapid response tools and automated alerts to manage reputation crises before they escalate."
  },
  {
    icon: (
      <svg
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        className="text-blue-600"
      >
        <path
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Enterprise Security",
    description: "Bank-level security with SOC 2 compliance, data encryption, and role-based access controls."
  }
];

const Features: React.FC = () => {
  return (
    <section className="bg-blue-600 py-20 text-white">
      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-24">
        <div className="text-center mb-14">
          <p className="text-sm leading-normal font-bold uppercase text-white">
            Why Choose Reputraq
          </p>
          <h2 className="text-xl leading-tight tracking-tight sm:text-2xl md:text-3xl capitalize lg:text-4xl mt-4 font-medium text-white">
            Features Built for Reputation Excellence
          </h2>
          <p className="mt-4 text-lg text-white max-w-xl mx-auto">
            Everything you need to monitor, analyze, and protect your brand reputation.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/90 text-gray-800 p-8 rounded-2xl hover:scale-[1.025] transition ease-linear"
            >
              <div className="mb-4 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-base font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
