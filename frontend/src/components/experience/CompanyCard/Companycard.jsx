import "./CompanyCard.css";

import { ArrowRight } from "lucide-react";
import { getPeriod, getTenure, getTopHighlights } from "../../../util/experienceutils";

export default function CompanyCard({ company, index, onOpen }) {
    const isCurrent = !company.end;

    return (
        <button
            type="button"
            className={`exp-company${isCurrent ? " is-current" : ""}`}
            style={{ animationDelay: `${index * 90}ms` }}
            onClick={() => onOpen(company.id)}
        >
            <div className="exp-company-left">
                <div className="exp-company-head">
                    <div className="exp-mono">{company.mono}</div>
                    <div className="exp-company-info">
                        <span className="exp-period">
                            {getPeriod(company)}<i>·</i>{getTenure(company)}
                        </span>
                        <h2>
                            {company.company}
                            {isCurrent && <span className="exp-live"><i />Current</span>}
                        </h2>
                        <p className="exp-role">{company.role}</p>
                    </div>
                </div>
                <p className="exp-summary">{company.summary}</p>
                <div className="exp-chips">
                    {company.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
            </div>

            <div className="exp-highlights">
                <span className="exp-highlights-title">Selected highlights</span>
                {getTopHighlights(company).map((highlight) => (
                    <div className="exp-highlight" key={highlight.id}>{highlight.title}</div>
                ))}
                <span className="exp-view">View my work <ArrowRight strokeWidth={2.4} aria-hidden="true" /></span>
            </div>
        </button>
    );
}