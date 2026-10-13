
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight,BriefcaseBusiness, Download, Code2 } from "lucide-react";
import "./HomePage.css";

import SreeviShowcase from "../../components/home/SreeviShowcase/SreeviShowcase"

const DEVELOPER_ROLES = [
  "Software Engineer",
  "Full Stack Developer",
  "Applied AI Engineer",
  "Salesforce Developer",
  "AgentExchange Developer",
  "RAG Engineer",
];

const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
  "nakshayreddy@gmail.com"
)}&su=${encodeURIComponent(
  "Hiring Inquiry - Akshay Reddy"
)}&body=${encodeURIComponent(
  "Hi Akshay,\n\nI came across your portfolio and would like to discuss a potential opportunity with you.\n\nBest regards,"
)}`;

function HomePage() {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isRoleVisible, setIsRoleVisible] = useState(true);

  useEffect(() => {
    let transitionTimeout;
    const roleInterval = setInterval(() => {
      setIsRoleVisible(false);

      transitionTimeout = setTimeout(() => {
        setCurrentRoleIndex(
          (previousIndex) =>
            (previousIndex + 1) % DEVELOPER_ROLES.length
        );
        setIsRoleVisible(true);
      }, 350);
    }, 2600);

    return () => {
      clearInterval(roleInterval);
      clearTimeout(transitionTimeout);
    };
  }, []);

  return (
    <main className="homepage-container">
      <div className="homepage-content">

        <section className="homepage-left-panel">
          <p className="homepage-left-panel__introduction">
            Hi, I'm <span className="homepage-left-panel__name">N Akshay Kumar Reddy</span>
          </p>

          <h1 className="homepage-left-panel__headline">
            <span className="homepage-left-panel__headline-line">
              I turn complex ideas
            </span>
            <span className="homepage-left-panel__headline-line">
              into <span className="homepage-left-panel__gradient-text">intelligent</span>
            </span>
            <span className="homepage-left-panel__headline-line">
              solutions<span className="homepage-left-panel__period">.</span>
            </span>
          </h1>

          <div className="homepage-left-panel__role">
            <Code2 className="homepage-left-panel__role-icon" size={22} strokeWidth={2.2}/>
            <span className={`homepage-left-panel__role-text ${
                isRoleVisible ? "homepage-left-panel__role-text--visible" 
                : "homepage-left-panel__role-text--hidden"}`}>
              {DEVELOPER_ROLES[currentRoleIndex]}
              <span className="homepage-left-panel__cursor" />
            </span>
          </div>

          <p className="homepage-left-panel__description">
            I engineer intelligent software, develop AI-powered
            systems, and build reliable enterprise solutions that
            turn challenging ideas into meaningful real-world impact.
          </p>

          <div className="homepage-left-panel__actions">
             <Link to="/more/contact"
                className="homepage-left-panel__button homepage-left-panel__button--primary">
                <BriefcaseBusiness size={16} /> Hire Me
                <ArrowUpRight className="homepage-left-panel__button-arrow" size={17}/>
            </Link>

            <a className="homepage-left-panel__button homepage-left-panel__button--secondary"
              href="/resume.pdf" target="_blank" rel="noreferrer">
              Download resume <Download size={16} />
            </a>
          </div>
        </section>

        <section className="homepage-right-panel">
          <SreeviShowcase/>
        </section>

      </div>
    </main>
  );
}

export default HomePage;
