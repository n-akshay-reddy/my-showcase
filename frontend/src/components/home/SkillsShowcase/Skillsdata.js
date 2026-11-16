// Static skills data (swap for an API / CMS later — the component only needs this shape).
// { name, type, rank, usedIn[] }
export const SKILLS = [
  { name: "System Design", type: "Core CS", rank: 1, usedIn: ["Product engineering (Bigworks)", "AI/RAG workflows"] },
  { name: "Data Structures & Algorithms", type: "Core CS", rank: 2, usedIn: ["LeetCode problems", "Product engineering (Bigworks)"] },
  { name: "Object-Oriented Programming", type: "Core CS", rank: 3, usedIn: ["Java", "Apex"] },
  { name: "Microservices", type: "Core CS", rank: 4, usedIn: ["Bigworks products"] },

  { name: "JavaScript", type: "Programming Languages", rank: 5, usedIn: ["Across projects", "DocuMake, Contacto & DocuVault (Bigworks)", "Sreevi (portfolio)"] },
  { name: "TypeScript", type: "Programming Languages", rank: 6, usedIn: ["Personal projects"] },
  { name: "Python", type: "Programming Languages", rank: 7, usedIn: ["AI/RAG experiments", "Problem solving"] },
  { name: "Java", type: "Programming Languages", rank: 8, usedIn: ["LeetCode", "DSA practice"] },

  { name: "React.js", type: "Frontend", rank: 9, usedIn: ["Sreevi (portfolio)", "Personal projects"] },
  { name: "HTML", type: "Frontend", rank: 10, usedIn: ["Sreevi (portfolio)", "Web projects"] },
  { name: "CSS", type: "Frontend", rank: 11, usedIn: ["Sreevi (portfolio)", "Web projects"] },
  { name: "Redux Toolkit", type: "Frontend", rank: 12, usedIn: ["Sreevi (portfolio)"] },

  { name: "Node.js", type: "Backend & Databases", rank: 13, usedIn: ["Backend development (Bigworks)", "LeetCode Analytics API", "MERN projects"] },
  { name: "Express.js", type: "Backend & Databases", rank: 14, usedIn: ["LeetCode Analytics API", "MERN projects"] },
  { name: "REST APIs", type: "Backend & Databases", rank: 15, usedIn: ["Bigworks products", "LeetCode Analytics API", "Full-stack projects"] },
  { name: "MongoDB", type: "Backend & Databases", rank: 16, usedIn: ["SnapMap", "MERN projects"] },
  { name: "PostgreSQL", type: "Backend & Databases", rank: 17, usedIn: ["Personal projects"] },
  { name: "MySQL", type: "Backend & Databases", rank: 18, usedIn: ["Personal projects"] },

  { name: "Apex", type: "Salesforce", rank: 19, usedIn: ["DocuMake (Bigworks)", "Contacto (Bigworks)", "DocuVault (Bigworks)"] },
  { name: "Lightning Web Components (LWC)", type: "Salesforce", rank: 20, usedIn: ["DocuMake (Bigworks)", "Contacto (Bigworks)", "DocuVault (Bigworks)"] },
  { name: "SOQL", type: "Salesforce", rank: 21, usedIn: ["DocuMake (Bigworks)", "DocuVault (Bigworks)"] },
  { name: "Batch Apex", type: "Salesforce", rank: 22, usedIn: ["Salesforce product development (Bigworks)"] },
  { name: "Apex Triggers", type: "Salesforce", rank: 23, usedIn: ["Salesforce product development (Bigworks)"] },
  { name: "Visualforce", type: "Salesforce", rank: 24, usedIn: ["Salesforce product development (Bigworks)"] },
  { name: "Agentforce", type: "Salesforce", rank: 25, usedIn: ["DocuVault (Bigworks)"] },

  { name: "RAG", type: "AI, Cloud & DevOps", rank: 26, usedIn: ["DocuVault (Bigworks)"] },
  { name: "AWS", type: "AI, Cloud & DevOps", rank: 27, usedIn: ["DocuVault (Bigworks)"] },
  { name: "OCR", type: "AI, Cloud & DevOps", rank: 28, usedIn: ["Document processing workflows"] },
  { name: "Amazon Bedrock", type: "AI, Cloud & DevOps", rank: 29, usedIn: ["DocuVault (Bigworks)"] },
  { name: "Azure AI", type: "AI, Cloud & DevOps", rank: 30, usedIn: ["DocuVault (Bigworks)"] },
  { name: "Docling", type: "AI, Cloud & DevOps", rank: 31, usedIn: ["DocuVault (Bigworks)"] },
  { name: "HybridChunker", type: "AI, Cloud & DevOps", rank: 32, usedIn: ["RAG document-processing experiments"] },
  { name: "BGE-M3", type: "AI, Cloud & DevOps", rank: 33, usedIn: ["RAG experiments"] },
  { name: "Qdrant", type: "AI, Cloud & DevOps", rank: 34, usedIn: ["RAG architecture experiments"] },
  { name: "Cloud Integrations", type: "AI, Cloud & DevOps", rank: 35, usedIn: ["DocuVault (Bigworks)", "AI/RAG workflows"] },
  { name: "Cloudflare Workers", type: "AI, Cloud & DevOps", rank: 36, usedIn: ["Sreevi (portfolio)"] },
  { name: "Git", type: "AI, Cloud & DevOps", rank: 37, usedIn: ["Bigworks products", "Personal projects"] },
  { name: "GitHub", type: "AI, Cloud & DevOps", rank: 38, usedIn: ["Open-source contribution", "Bigworks products", "Personal projects"] },
];