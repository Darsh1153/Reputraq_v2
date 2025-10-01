'use client';

import React from 'react';

const featuresList = [
  {
    title: "Real-time Reputation Monitoring",
    description: "Track mentions across social media, news, and review platforms instantly.",
  },
  {
    title: "AI-Powered Sentiment Analysis",
    description: "Get intelligent insights into how your brand is perceived by customers.",
  },
  {
    title: "Comprehensive Analytics Dashboard",
    description: "Monitor trends, track competitors, and make data-driven decisions.",
  },
];

const Hero: React.FC = () => {
  return (
    <section className="overflow-hidden">
      <div className="px-8 pt-32 mx-auto md:px-12 lg:px-24 max-w-7xl relative">
        <div className="max-w-2xl text-center mx-auto lg:text-balance mb-10">
          <p className="text-sm leading-normal font-bold uppercase text-blue-600">
            Reputation Intelligence Platform
          </p>
          <h2 className="text-xl/snug leading-tight tracking-tight sm:text-2xl/snug md:text-3xl/snug capitalize lg:text-4xl/snug mt-4 font-medium text-gray-900">
            Monitor, Analyze, and Protect Your Brand Reputation
          </h2>
          <p className="text-base leading-normal mt-4 text-gray-600 font-medium">
            Stay ahead of reputation threats with AI-powered monitoring, sentiment analysis, 
            and comprehensive analytics across all digital channels.
          </p>
          <div className="flex flex-wrap items-center gap-2 justify-center mx-auto mt-12">
            <a
              href="/signup"
              className="flex items-center justify-center transition-all duration-200 focus:ring-2 focus:outline-none text-gray-500 bg-white hover:bg-blue-50 ring-1 ring-gray-200 focus:ring-blue-100 hover:text-blue-600 h-9 px-4 py-2 text-sm font-medium rounded-md"
            >
              Start Free Trial
            </a>
            <a
              href="#demo"
              className="flex items-center justify-center transition-all duration-200 focus:ring-2 focus:outline-none text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-700/50 h-9 px-4 py-2 text-sm font-medium rounded-md"
            >
              Watch Demo
            </a>
          </div>
        </div>
        <div className="lg:gap-x-8 lg:grid-cols-3 max-w-4xl mt-8 mx-auto sm:gap-x-6 sm:gap-y-12 sm:grid sm:grid-cols-2 sm:space-y-0 space-y-6 text-center text-sm items-start">
          {featuresList.map(({ title, description }, index) => (
            <div key={index} className="text-gray-600 lg:text-balance">
              <strong className="text-gray-800">{title}</strong> ━ {description}
            </div>
          ))}
        </div>
        <div className="relative w-full mx-auto max-w-7xl items-center py-12 pb-12">
          <div className="p-10 bg-blue-50 rounded-2xl">
            <div className="relative w-full ring-4 ring-gray-50 border border-gray-200 lg:rounded-2xl rounded overflow-hidden">
              <img
                src="/dashboard-preview.svg"
                alt="Reputraq Dashboard Preview"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
