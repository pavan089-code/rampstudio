"use client";

import Button from "@/components/Button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    location: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    setIsSubmitting(false);

    if (response.ok) {
      setIsSuccess(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        location: "",
        message: "",
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl">
        <h3 className="font-serif text-4xl text-white">
          Inquiry Received
        </h3>

        <p className="mt-5 text-sm leading-7 text-muted sm:text-base">
          Thank you for reaching out to Ramp Studio.
          We’ll respond shortly with availability and next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          className="field-surface w-full px-5 py-4"
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          className="field-surface w-full px-5 py-4"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="field-surface w-full px-5 py-4"
        />

        <input
          type="text"
          name="whatsapp"
          placeholder="WhatsApp Number"
          value={formData.whatsapp}
          onChange={handleChange}
          className="field-surface w-full px-5 py-4"
        />
      </div>

      <input
        type="text"
        name="location"
        placeholder="Event Location"
        value={formData.location}
        onChange={handleChange}
        className="field-surface w-full px-5 py-4"
      />

      <textarea
        name="message"
        placeholder="Tell us about your celebration"
        rows={5}
        value={formData.message}
        onChange={handleChange}
        className="field-surface w-full resize-none px-5 py-4"
      />

      <Button
        type="submit"
        variant="outline"
        disabled={isSubmitting}
        className="w-full sm:w-fit"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending Inquiry
          </span>
        ) : (
          "Send Inquiry"
        )}
      </Button>
    </form>
  );
}