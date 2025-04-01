"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  CalendarIcon,
  FileDownIcon,
  ExternalLink,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import ChatButton from "@/components/ChatButton";

export default function Home() {
  return (
    <>
      <Header />

      <main className="main-content">
        {/* About Section */}
        <section className="section">
          <h1>Spruce Emmanuel</h1>
          <p className="text-xl mb-6">
            Technical Documentation Specialist & Technical Writer
          </p>

          <div className="planted">
            <CalendarIcon size={16} className="planted-icon" />
            <span>Updated April 1st, 2025 • Portfolio Version 1.2</span>
          </div>

          <p>
            My journey into the world of programming began somewhat by accident
            in 2016. Since then, I've been captivated by building web
            applications – it felt like the best thing in the world then, and it
            still does. This passion sparked a desire to share the experience
            with others through writing, a path I initially started pursuing
            using just my phone.
          </p>

          <p>
            Since those early days, I've gained significant experience, holding
            titles such as "Technical Writer," "Documentation Writer," and
            "Content Writer." Through these roles, one constant emerged: I am
            fundamentally a writer.
          </p>

          <p>
            Working with leading developer content agencies has given me the
            privilege of having my work featured on prominent developer blogs,
            including those at Meta (Facebook), CrowdStrike, HubSpot,
            Salesforce, Kinsta, and others.
          </p>
          <p>
            Tech has been a transformative force in my life ever since I
            started, influencing everything from my education to my personal
            interests and hobbies.
          </p>

          <div className="mt-8 mb-8">
            <a
              href="/resume.pdf"
              target="_blank"
              className="resume-button"
              rel="noreferrer"
            >
              <FileDownIcon size={20} className="icon" /> Download My Resume
            </a>
          </div>
        </section>

        {/* Education Section */}
        <section className="section">
          <h2 className="flex gap-4 items-center">
            <GraduationCap size={24} className=" text-pink-9" />
            Education
          </h2>

          <div className="experience-item">
            <div className="experience-header">
              <div>
                <div className="experience-title">
                  National Innovation Diploma, Computer Software Engineering
                </div>
                <div className="experience-company">
                  Complete Computer's Technology Institute
                </div>
              </div>
              <div className="experience-date">Graduated: 2023</div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="section">
          <h2 className="flex gap-4 items-center">
            <Briefcase size={24} className="text-pink-9" />
            Experience
          </h2>

          <div className="experience-item">
            <div className="experience-header">
              <div>
                <div className="experience-title">
                  Technical Writer & Documentation Expert
                </div>
                <div className="experience-company">
                  Professional Data Skills
                </div>
              </div>
              <div className="experience-date">Oct 2024 – Present</div>
            </div>
            <div className="experience-description">
              <ul>
                <li>
                  Produced technical materials and instructional guides on
                  emerging technologies, incorporating detailed diagrams and
                  flowcharts to simplify complex information.
                </li>
                <li>
                  Executed keyword research and competitive analysis to optimize
                  documentation for readability and accessibility.
                </li>
                <li>
                  Collaborated with cross-functional teams to translate complex
                  technical data into clear, actionable documentation.
                </li>
              </ul>
            </div>
          </div>

          <div className="experience-item">
            <div className="experience-header">
              <div>
                <div className="experience-title">
                  Technical Writer & Content Strategist
                </div>
                <div className="experience-company">ContentLab</div>
              </div>
              <div className="experience-date">Apr 2022 – Present</div>
            </div>
            <div className="experience-description">
              <ul>
                <li>
                  Developed over 50 technical articles and internal training
                  materials that enhanced organizational knowledge and
                  streamlined project workflows.
                </li>
                <li>
                  Worked closely with international teams to tailor
                  documentation for various audiences, ensuring clarity and
                  consistency.
                </li>
                <li>
                  Managed content in knowledge bases, recommending improvements
                  to repository structures and access for up-to-date
                  documentation.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="section">
          <h2 className="flex gap-4 items-center">
            <FileDownIcon size={24} className="text-pink-9" />
            Projects
          </h2>
          <p>
            My projects are a bit diverse, you can either find me building or
            most of the times just writing
          </p>

          <ol className="numbered-list">
            <li>
              <div className="project-title">
                Rocket.Chat Livechat Node.js SDK
              </div>
              <div className="project-description">
                Talking with your site visitors is now easier than ever with
                Rocket.chat livechat feature. This is a Node.js SDK that allows
                you to integrate Rocket.Chat livechat into your applications. It
                provides a simple and easy-to-use interface for sending and
                receiving messages, managing users, and handling events.
              </div>
              <a
                href="https://www.npmjs.com/package/rocketchat-livechat-sdk"
                className="flex gap-2"
              >
                <span>View on npm</span>{" "}
                <ExternalLink size={14} className="inline ml-1" />
              </a>
            </li>

            <li>
              <div className="project-title">
                useSearch - A React hook for searching{" "}
              </div>
              <div className="project-description">
                A React hook that provides a simple and efficient way to
                implement search functionality in your applications. It allows
                you to filter and sort data based on user input, making it easy
                to create dynamic and interactive search experiences.
              </div>
              <a
                href="https://www.npmjs.com/package/use-search-react"
                className="flex gap-2"
              >
                View on npm <ExternalLink size={14} className="inline ml-1" />
              </a>
            </li>

            <li>
              <div className="project-title">
                Whatsnews - A news aggregator for WhatsApp
              </div>
              <div className="project-description">
                Whatsnews is a news aggregator that allows you to get the latest
                news from your favorite sources directly in your WhatsApp chat.
                It provides a simple and easy-to-use interface for subscribing
                to news feeds and receiving updates in real-time.
              </div>
              <div className="flex gap-4 space-x-4 mt-2">
                <a href="https://whatsnews.vercel.app" className="flex gap-2">
                  GitHub <ExternalLink size={14} className="inline ml-1" />
                </a>
                <a
                  href="https://www.npmjs.com/package/use-search-react"
                  className="flex gap-2"
                >
                  npm <ExternalLink size={14} className="inline ml-1" />
                </a>
              </div>
            </li>
          </ol>
        </section>

        {/* Contact Section */}
        <section className="section">
          <h2 className="flex gap-4 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-pink-9"
            >
              <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
              <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
            </svg>
            Get in Touch
          </h2>

          <p>
            For collaborations or inquiries, please reach out via email at{" "}
            <a href="mailto:Rspruceemmanuel@gmail.com">
              spruceemmanuel@gmail.com
            </a>{" "}
            or connect with me on{" "}
            <a
              href="https://linkedin.com/in/spruceemma"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            .
          </p>

          <p>
            Always open to chats and coffee about technical writing. Say hello!
          </p>
        </section>
      </main>
      <ChatButton />
      <Footer />
    </>
  );
}
