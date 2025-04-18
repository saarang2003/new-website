import About from "@/components/About";
import HomeBlogSection from "@/components/Blog/HomeBlogSection";
import CallToAction from "@/components/CallToAction";
import Clients from "@/components/Clients";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Faq from "@/components/Faq";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Team from "@/components/Team";
import Testimonials from "@/components/Testimonials";
import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";
import LinkedInPosts from "@/components/LinkdinPosts";
import LinkedIn from "next-auth/providers/linkedin";

export const metadata: Metadata = {
  title: "Home | DEVRhylme Foundation",
  description: "Welcome to DevRhylme Foundation, an innovative AI startup at the forefront of Generative AI, OpenCV, and Web 3.0 technologies. We are committed to fostering a thriving developer community and organizing impactful events for diverse clients. Our mission is to build cutting-edge solutions while empowering organizations globally through collaborative innovation and knowledge-sharing.",
};

export default function Home() {
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);

  return (
    <main>
      <ScrollUp />
      <Hero />
      <About />
      <Features />
      <CallToAction />
      <Testimonials />
      <Faq />
      <Team showAll={false} />
    {/*  <LinkedInPosts /> */}
    <Pricing />
      <Contact />
      <Clients />
    </main>
  );
}
