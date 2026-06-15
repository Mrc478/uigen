'use client';

import { useState, useEffect } from 'react';

const testimonials = [
  {
    quote: "This completely transformed how our team ships product. What used to take weeks now takes days, and the quality is noticeably better.",
    author: "Sarah Chen",
    role: "VP Engineering at Linear",
    avatar: "https://i.pravatar.cc/300?img=5",
    companyLogo: "https://picsum.photos/seed/linear/64/64",
    rating: 5,
  },
  {
    quote: "The attention to detail in the developer experience is rare. Every edge case has been thought through. It's the first tool I've used that actually gets out of your way.",
    author: "Marcus Johnson",
    role: "Staff Engineer at Vercel",
    avatar: "https://i.pravatar.cc/300?img=12",
    companyLogo: "https://picsum.photos/seed/vercel/64/64",
    rating: 5,
  },
  {
    quote: "We migrated our entire design system in a single sprint. The component API is intuitive, the docs are actually helpful, and the bundle size impact is negligible.",
    author: "Priya Patel",
    role: "Design Systems Lead at Notion",
    avatar: "https://i.pravatar.cc/300?img=28",
    companyLogo: "https://picsum.photos/seed/notion/64/64",
    rating: 5,
  },
];

export default function TestimonialCard() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setTimeout(() => {
        setIndex((i) => (i + 1) % testimonials.length);
        setDirection(0);
      }, 200);
    }, 5750);
    return () => clearInterval(timer);
  }, []);

  const t = testimonials[index];

  return (
    <div className="relative w-full max-w-md">
      {/* Ambient glow */}
      <div
        className="absolute -inset-4 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 rounded-3xl blur-2xl opacity-0 transition-opacity duration-700"
        style={{ opacity: direction ? 0 : 1 }}
      />

      <div
        className="relative bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl transition-all duration-500 ease-out"
        style={{
          transform: direction === 1 ? 'translateX(-20px) scale(0.98)' : direction === -1 ? 'translateX(20px) scale(0.98)' : 'translateX(0)',
          opacity: direction ? 0 : 1,
        }}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />

        {/* Quote mark */}
        <svg
          className="absolute top-6 right-6 w-12 h-12 text-emerald-500/20"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M14.017 21v-7.391c0-5.952 4.5-8.646 4.5-10.609 0-2.757-2.243-5-5-5s-5 2.243-5 5c0 1.96.99 3.699 2.503 4.66v2.331h-2v7h12v-7h-2v-2.331c1.513-.961 2.503-2.7 2.503-4.66 0-2.757-2.243-5-5-5s-5 2.243-5 5c0 1.96.99 3.699 2.503 4.66v2.331h-2v7h12zm-14 0v-7.391c0-5.952 4.5-8.646 4.5-10.609 0-2.757-2.243-5-5-5s-5 2.243-5 5c0 1.96.99 3.699 2.503 4.66v2.331h-2v7h12v-7h-2v-2.331c1.513-.961 2.503-2.7 2.503-4.66 0-2.757-2.243-5-5-5s-5 2.243-5 5c0 1.96.99 3.699 2.503 4.66v2.331h-2v7h12z" />
        </svg>

        {/* Quote text */}
        <blockquote className="relative z-10 mb-8">
          <p className="text-neutral-100 text-lg leading-relaxed font-light tracking-wide">
            {t.quote}
          </p>
        </blockquote>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-6" aria-label={`${t.rating} out of 5 stars`}>
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 transition-colors ${
                i < t.rating ? 'text-amber-400' : 'text-neutral-700'
              }`}
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
        </div>

        {/* Author section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={t.avatar}
              alt=""
              className="w-12 h-12 rounded-full border-2 border-neutral-800 object-cover ring-2 ring-emerald-500/30"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-neutral-900" aria-hidden="true" />
          </div>
          <div>
            <p className="text-neutral-100 font-semibold text-sm tracking-tight">{t.author}</p>
            <p className="text-neutral-500 text-xs tracking-wide uppercase">{t.role}</p>
          </div>
        </div>

        {/* Company logo */}
        <div className="mt-6 pt-6 border-t border-neutral-800 flex items-center justify-between">
          <img
            src={t.companyLogo}
            alt=""
            className="w-10 h-10 rounded-lg opacity-60 hover:opacity-100 transition-opacity grayscale"
          />
          <div className="flex items-center gap-1.5 text-neutral-500 text-xs tracking-widest uppercase">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Verified
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setTimeout(() => {
                setIndex(i);
                setDirection(0);
              }, 200);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === index
                ? 'bg-emerald-500 w-6 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                : 'bg-neutral-700 hover:bg-neutral-600'
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
            aria-current={i === index ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  );
}
