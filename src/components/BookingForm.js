"use client";

import Button from "@/components/Button";
import { createBooking } from "@/lib/bookings";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";

export default function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toast, setToast] = useState("");
  const [errors, setErrors] = useState({});
  const submitLock = useRef(false);

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

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (formData.phone.replace(/\D/g, "").length < 10) {
      nextErrors.phone = "Please enter a valid phone number.";
    }
    if (!formData.location.trim()) {
      nextErrors.location = "Please share the event location.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitLock.current || isSubmitting) return;
    if (!validateForm()) return;

    submitLock.current = true;
    setIsSubmitting(true);
    setToast("");

    try {
      await createBooking({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        eventType: "General Inquiry",
        eventDate: null,
        location: formData.location,
        package: "To be discussed",
        message: [
          formData.message,
          formData.whatsapp ? `WhatsApp: ${formData.whatsapp}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });

      setToast("Inquiry saved successfully.");
      setIsSuccess(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        location: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      setToast("We could not save your inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
      submitLock.current = false;
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
    <form onSubmit={handleSubmit} className="relative grid gap-6">
      {toast && (
        <div className="border border-[var(--accent-gold)]/30 bg-black/80 px-5 py-4 text-sm leading-6 text-white">
          {toast}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="field-surface w-full px-5 py-4"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-[var(--accent-gold)]">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="field-surface w-full px-5 py-4"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-[var(--accent-gold)]">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="field-surface w-full px-5 py-4"
          />
          {errors.phone && (
            <p className="mt-2 text-sm text-[var(--accent-gold)]">
              {errors.phone}
            </p>
          )}
        </div>

        <input
          type="text"
          name="whatsapp"
          placeholder="WhatsApp Number"
          value={formData.whatsapp}
          onChange={handleChange}
          className="field-surface w-full px-5 py-4"
        />
      </div>

      <div>
        <input
          type="text"
          name="location"
          placeholder="Event Location"
          value={formData.location}
          onChange={handleChange}
          className="field-surface w-full px-5 py-4"
        />
        {errors.location && (
          <p className="mt-2 text-sm text-[var(--accent-gold)]">
            {errors.location}
          </p>
        )}
      </div>

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
