"use client";

import React, { useState } from "react";
import { ref, push } from "firebase/database"; // Import Realtime Database functions
import { rtdb } from "../../../firebase/firebaseConfig"; // Import Realtime Database reference

interface EventData {
  title: string;
  date: string;
  time: string;
  location: string;
  tracks: string;
  details: string;
  coverImage: string;
  tags: string[];
  imageFile: File | null;
  eventDuration: string;
}

const CreateEventPage: React.FC = () => {
  const [eventData, setEventData] = useState<EventData>({
    title: "",
    date: "",
    time: "",
    location: "",
    tracks: "",
    details: "",
    coverImage: "",
    tags: [],
    imageFile: null,
    eventDuration: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleDuration = (e:any) => {
    const value = e.target.value;
    setEventData({ ...eventData, eventDuration: value });
    if (value.trim() === "") {
      e.target.setCustomValidity("Please enter the event duration");
      return;
    }
    if (!/^\d*\.?\d*$/.test(value)) {
      e.target.setCustomValidity("Only numbers and decimal points are allowed");
      return;
    }

    const duration = parseFloat(value);
    if (isNaN(duration) || duration <= 0) {
      e.target.setCustomValidity("Please enter a valid positive number");
    } else {
      const minutes = Math.round((duration % 1) * 100);
      if (minutes >= 60) {
        e.target.setCustomValidity("Minutes cannot exceed 59.");
      } else {
        e.target.setCustomValidity("");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEventData((prevData) => ({
      ...prevData,
      tags: value.split(",").map((tag) => tag.trim()),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Using optional chaining
    if (file) {
      setEventData((prevData) => ({
        ...prevData,
        imageFile: file, // Save the selected image file
      }));
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload image to ImgBB
      if (eventData.imageFile) {
        const formData = new FormData();
        formData.append("image", eventData.imageFile); // Append image file
        formData.append("key", "f43b433f78cbc31cb8db83f31f76ee8c"); // Your ImgBB API key

        const response = await fetch(
          "https://api.imgbb.com/1/upload", // ImgBB upload endpoint
          {
            method: "POST",
            body: formData, // Sending the form data with the image
          }
        );

        const data = await response.json();
        if (data.success) {
          const imageUrl = data.data.url; // Get the image URL from ImgBB response

          // Store event data in Firebase, including the ImgBB URL
          const eventDataWithImage = {
            ...eventData,
            coverImage: imageUrl, // Use the URL returned from ImgBB
          };

          const eventsRef = ref(rtdb, "events");
          await push(eventsRef, eventDataWithImage);
          alert("Event added successfully!");

          // Reset form
          setEventData({
            title: "",
            date: "",
            time: "",
            location: "",
            tracks: "",
            details: "",
            coverImage: "",
            tags: [],
            imageFile: null, // Reset image file
            eventDuration: "", // Reset event duration
          });
        } else {
          console.error("Image upload failed", data);
        }
      }
    } catch (error) {
      console.error("Error adding event: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg w-full max-w-lg p-6" style={{ margin: "120px 1rem 1rem 1rem" }}>
        <h2 className="text-2xl font-medium text-center mb-6 text-gray-900 dark:text-white">Create Event</h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col">
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={eventData.title}
            onChange={handleChange}
            required
            className="border mt-2 mb-2 border-gray-300 dark:border-gray-600 rounded-md p-2 w-full focus:outline-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <label className="pb-0 pt-2 p-2 text-gray-900 dark:text-white">Event Date</label>
          <input
            type="date"
            name="date"
            value={eventData.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split("T")[0]}
            placeholder="event date"
            className="border mt-0.5 mb-2 border-gray-300 dark:border-gray-600 rounded-md p-2 w-full focus:outline-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <label className="pb-0 pt-2 p-2 text-gray-900 dark:text-white">Event Schedule</label>
          <input
            type="time"
            name="time"
            value={eventData.time}
            onChange={handleChange}
            required
            className="border mt-1 mb-2 border-gray-300 dark:border-gray-600 rounded-md p-2 w-full focus:outline-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            name="eventDuration"
            value={eventData.eventDuration}
            onChange={handleDuration}
            required
            placeholder="Event Duration in hours"
            className="border mt-2 mb-2 border-gray-300 dark:border-gray-600 rounded-md p-2 w-full focus:outline-blue-500 dark:bg-gray-700 dark:text-white"
          />

          <input
            type="text"
            name="location"
            placeholder="Event Location"
            value={eventData.location}
            onChange={handleChange}
            required
            className="border mt-2 mb-2 border-gray-300 dark:border-gray-600 rounded-md p-2 w-full focus:outline-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <textarea
            name="details"
            placeholder="Event Details"
            value={eventData.details}
            onChange={handleChange}
            required
            className="border mt-2 mb-2 border-gray-300 dark:border-gray-600 rounded-md p-2 w-full focus:outline-blue-500 resize-none dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            name="tracks"
            placeholder="Event Tracks"
            value={eventData.tracks}
            onChange={handleChange}
            className="border mt-2 mb-2 border-gray-300 dark:border-gray-600 rounded-md p-2 w-full focus:outline-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="file"
            name="coverImage"
            onChange={handleImageChange}
            accept="image/*"
            required
            className="border mt-2 mb-2 border-gray-300 dark:border-gray-600 rounded-md p-2 w-full focus:outline-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            name="tags"
            placeholder="Event Tags (comma separated)"
            value={eventData.tags.join(", ")} // Join tags with comma for display
            onChange={handleTagsChange}
            className="border mt-2 mb-2 border-gray-300 dark:border-gray-600 rounded-md p-2 w-full focus:outline-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <div className="flex justify-between items-center mt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              className="border border-gray-300 dark:border-gray-600 py-2 px-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              onClick={() =>
                setEventData({
                  title: "",
                  date: "",
                  time: "",
                  location: "",
                  tracks: "",
                  details: "",
                  coverImage: "",
                  tags: [],
                  imageFile: null, // Reset image file
                  eventDuration: "", // Reset event duration
                })
              }
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
