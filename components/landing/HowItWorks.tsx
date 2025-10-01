'use client';

import React from 'react';

const steps = [
  {
    number: 1,
    title: "Connect Your Channels",
    description: "Set up monitoring for your social media accounts, review platforms, news sources, and other digital channels in minutes."
  },
  {
    number: 2,
    title: "Configure Monitoring Rules",
    description: "Define keywords, competitors, and sentiment thresholds. Set up custom alerts and notification preferences."
  },
  {
    number: 3,
    title: "Monitor & Respond",
    description: "Track mentions in real-time, analyze sentiment trends, and respond to reputation threats with our integrated tools."
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="bg-white pt-20 text-gray-900">
      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-24">
        <div className="text-center mb-16">
          <p className="text-sm leading-normal font-bold uppercase text-blue-600">
            Simple Setup
          </p>
          <h2 className="text-xl leading-tight tracking-tight sm:text-2xl md:text-3xl capitalize lg:text-4xl mt-4 font-medium text-gray-900 lg:text-balance">
            How It Works
          </h2>
          <p className="text-base leading-normal mt-4 text-gray-600 font-medium">
            Get started with reputation monitoring in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative gap-5 lg:gap-10 max-lg:divide-y lg:divide-x divide-blue-400 divide-dashed">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative z-10 bg-white text-center md:text-left pt-6 md:pe-10 lg:py-0 pb-10 last:pb-0 last:pe-0"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center mx-auto md:mx-0 mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-base text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
