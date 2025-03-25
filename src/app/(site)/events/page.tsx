"use client";

import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../../../firebase/firebaseConfig"; // Ensure you're importing the correct Firebase config
import EventBanner from "@/components/eventData/eventBanner";
import Event from "@/components/eventData/eventCard";
import "@/components/eventData/eventStyles.css";
import { useRouter } from "next/navigation";
import PreLoader from "../../../components/Common/PreLoader"; // Import your PreLoader component
import { useUser } from "@auth0/nextjs-auth0/client";
// Define the EventData interface with all fields required (no optional fields)
interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  tracks: string;
  details: string;
  coverImage: string;
  tags: string[];
  duration: number; // Duration in hours
  eventStatus: "upcoming" | "ongoing" | "expired";
  daysLeft: number; // Number of days left for the event to happen
}

const ContactPage = () => {
  const [events, setEvents] = useState<EventData[]>([]); // Using EventData interface for type safety
  const [loading, setLoading] = useState<boolean>(true); // Tracks if loading is active
  const router = useRouter(); // Initialize router for navigation

  useEffect(() => {
    const eventsRef = ref(rtdb, "events");
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedEvents = Object.entries(data)
          .map(([id, value]) => {
            if (typeof value === "object" && value !== null) {
              const eventData = value as EventData;

              const eventDate = new Date(`${eventData.date}T${eventData.time}`);
              const currentDate = new Date();

              const timeDiff = eventDate.getTime() - currentDate.getTime();
              const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

              let eventStatus: string = "upcoming";
              const eventEndTime =
                eventDate.getTime() + eventData.duration * 60 * 60 * 1000;
                if (currentDate.getTime() < eventDate.getTime()) {
                  eventStatus = "upcoming";
                } 
                else if (currentDate.getTime() >= eventDate.getTime() && currentDate.getTime() < eventEndTime) {
                  eventStatus = "ongoing";
                } 
                else {
                  eventStatus = "expired";
                }

              return {
                ...eventData,
                id,
                eventStatus,
                daysLeft,
              };
            }
            return null;
          })
          .filter((event): event is EventData => event !== null);

        setEvents(parsedEvents);
      } else {
        setEvents([]);
      }

      // Add a 1-second delay after fetching completes
      setTimeout(() => setLoading(false), 1000);
    });

    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, []);

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`); // Navigate to the event detail page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <PreLoader /> {/* Use PreLoader for consistent loading UI */}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="gradientBorder">
        <EventBanner />
      </div>
      <div className="eventCards">
        <h2 className="pt-5 font-bold sm:text-xl">
          Explore Events
          <span className="font-normal pl-1 text-slate-500">
            ({events.length})
          </span>
        </h2>
        <div className="py-6 gridCards">
          {events.sort((a,b) => b.daysLeft - a.daysLeft).map((event) => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event.id)}
              className="cursor-pointer"
            >
              <Event
                id={event.id}
                imageUrl={event.coverImage || "/images/event/event1.jpeg"}
                title={event.title}
                date={event.date}
                location={event.location}
                tags={event.tags || []}
                eventStatus={event.eventStatus}
                daysLeft={event.daysLeft} 
                onEventClick={handleEventClick}             
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
