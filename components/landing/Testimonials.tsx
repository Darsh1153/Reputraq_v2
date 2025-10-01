'use client';

import React from 'react';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechCorp",
    content: "Reputraq has transformed how we monitor our brand reputation. The real-time alerts and sentiment analysis have helped us respond to issues before they escalate.",
    avatar: "SJ"
  },
  {
    name: "Michael Chen",
    role: "CEO",
    company: "StartupXYZ",
    content: "The competitor tracking feature is invaluable. We can now see exactly how we stack up against our competitors and adjust our strategy accordingly.",
    avatar: "MC"
  },
  {
    name: "Emily Rodriguez",
    role: "PR Manager",
    company: "GlobalBrand Inc",
    content: "The crisis management tools saved us during a major PR incident. We were able to track the conversation and respond appropriately in real-time.",
    avatar: "ER"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-24">
        <div className="text-center mb-16">
          <p className="text-sm leading-normal font-bold uppercase text-blue-600">
            Testimonials
          </p>
          <h2 className="text-xl leading-tight tracking-tight sm:text-2xl md:text-3xl capitalize lg:text-4xl mt-4 font-medium text-gray-900 lg:text-balance">
            What Our Customers Say
          </h2>
          <p className="text-base leading-normal mt-4 text-gray-600 font-medium">
            Join thousands of companies who trust Reputraq to protect their reputation.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
                  {testimonial.avatar}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
