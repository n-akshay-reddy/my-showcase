import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import "./HomePage.css";

function HomePage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleClick() {
        try {
            setLoading(true);
            setMessage("");

            const response = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/ai`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Hello, AI! Can you change the theme?" })
            });

            if (!response.ok) throw new Error("Unable to connect to the AI assistant.");

            const data = await response.json();
            console.log("AI Response:", data);
            setMessage("Response received. Check the console for details.");
        } catch (error) {
            setMessage(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="home">
            <section className="home__hero">
                <div className="home__eyebrow"><span className="home__status-dot" /> DEVELOPER · CREATOR · PROBLEM SOLVER</div>
                <h1>Building things.<br />Solving problems.<br /><span>Always learning.</span></h1>
                <p className="home__description">Hey, I'm Akshay Reddy. I build software, explore new technologies, and turn ideas into working projects. This is where my journey comes together.</p>
                <div className="home__actions">
                    <a href="/showcase/projects" className="home__button home__button--primary">Explore my work <ArrowRight size={17} /></a>
                    <button type="button" className="home__button home__button--secondary" onClick={handleClick} disabled={loading}><Sparkles size={17} /> {loading ? "Connecting..." : "Ask my AI"} </button>
                </div>
                {message && <p className="home__message" role="status">{message}</p>}
            </section>
            <section className="home__more" id="home-more">
                <div className="home__more-card"><span>01 / BUILD</span><h2>Projects</h2><p>Things I've designed, developed, and brought to life.</p></div>
                <div className="home__more-card"><span>02 / LEARN</span><h2>Problem solving</h2><p>My journey with algorithms, data structures, and LeetCode.</p></div>
                <div className="home__more-card"><span>03 / GROW</span><h2>Experience</h2><p>The skills and experiences shaping the developer I am becoming.</p></div>
            </section>
        </main>
    );
}

export default HomePage;
