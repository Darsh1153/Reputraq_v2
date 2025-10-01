'use client';

import React, { useState } from 'react';

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for small businesses and startups",
    monthlyPrice: 29,
    annualPrice: 19,
    features: [
      "Up to 5 monitored keywords",
      "Basic sentiment analysis",
      "Email alerts",
      "7-day data retention",
      "Standard support",
      "Social media monitoring"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Professional",
    description: "Ideal for growing companies",
    monthlyPrice: 79,
    annualPrice: 59,
    features: [
      "Up to 25 monitored keywords",
      "Advanced sentiment analysis",
      "Real-time alerts",
      "30-day data retention",
      "Priority support",
      "Competitor tracking",
      "Custom reports",
      "API access"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    monthlyPrice: 199,
    annualPrice: 149,
    features: [
      "Unlimited keywords",
      "AI-powered insights",
      "Custom alert rules",
      "Unlimited data retention",
      "Dedicated support",
      "Advanced analytics",
      "White-label options",
      "Custom integrations",
      "SLA guarantee"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

const Pricing: React.FC = () => {
  const [duration, setDuration] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section className="pt-20">
      <div className="mx-auto w-full lg:px-24 max-w-7xl md:px-12 items-center px-8">
        <div className="max-w-xl text-center mx-auto">
          <p className="text-sm leading-normal font-bold uppercase text-blue-600">
            Pricing
          </p>
          <h2 className="text-xl leading-tight tracking-tight sm:text-2xl md:text-3xl capitalize lg:text-4xl mt-4 font-medium text-gray-900 lg:text-balance">
            Choose Your Plan
          </h2>
          <p className="text-base leading-normal mt-4 text-gray-600 font-medium lg:text-balance">
            Select the perfect plan for your reputation monitoring needs.
          </p>
          <div className="w-full relative mt-8 ring-1 ring-gray-200 ring-offset-2 bg-white overflow-hidden justify-center gap-4 mx-auto lg:mx-0 inline-flex p-1 rounded-md max-w-52 shadow z-0">
            <div
              className={`absolute inset-0 bg-gray-50 rounded-md transition-transform duration-200 ease-in-out ${
                duration === 'monthly' ? 'w-1/2 translate-x-0' : 'w-1/2 translate-x-full'
              }`}
            />
            <button
              className={`relative flex items-center justify-center w-full px-2 h-6 text-xs font-medium focus:outline-none transition-colors duration-300 z-10 ${
                duration === 'monthly' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
              }`}
              onClick={() => setDuration('monthly')}
              type="button"
            >
              Monthly
            </button>
            <button
              className={`relative flex items-center justify-center w-full px-2 h-6 text-xs font-medium focus:outline-none transition-colors duration-300 z-10 ${
                duration === 'annual' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
              }`}
              onClick={() => setDuration('annual')}
              type="button"
            >
              Annual
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-12 mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`flex flex-col h-full p-1 lg:py-1 rounded-3xl ${
                plan.popular 
                  ? 'bg-blue-50 ring-4 ring-blue-200 border border-blue-300' 
                  : 'bg-gray-50 ring-4 ring-gray-50 border border-gray-200'
              }`}
            >
              <div>
                <div className="flex flex-col gap-4 p-8 bg-white rounded-[1.3rem] h-full">
                  <div className="flex items-start justify-between w-full">
                    <div>
                      <h3 className="text-lg leading-normal sm:text-xl md:text-2xl font-medium text-gray-900">
                        {plan.name}
                      </h3>
                      <p className="text-base leading-normal font-medium text-gray-500">
                        {plan.description}
                      </p>
                    </div>
                    {plan.popular && (
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-8">
                <p className="font-semibold flex lg:text-3xl items-baseline text-2xl tracking-tighter text-gray-900">
                  <span>
                    ${duration === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                  </span>
                  <span className="text-sm font-normal font-sans tracking-normal text-gray-500">
                    /{duration === 'monthly' ? 'month' : 'annually'}
                  </span>
                </p>
                <div className="w-full mt-4">
                  <a
                    href={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                    className={`flex items-center justify-center transition-all duration-200 focus:ring-2 focus:outline-none h-9 px-4 py-2 text-sm font-medium rounded-md w-full ${
                      plan.popular
                        ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                        : 'text-gray-500 bg-white hover:text-blue-500 ring-1 ring-gray-200 focus:ring-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
                <div className="mt-8">
                  <p className="text-sm leading-normal font-medium uppercase text-gray-500">
                    {plan.name} plan includes:
                  </p>
                  <ul className="flex flex-col mt-4 gap-y-3 text-gray-500" role="list">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 text-green-500"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                        <span className="text-base leading-normal">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
