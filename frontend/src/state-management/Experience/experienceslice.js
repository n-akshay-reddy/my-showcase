import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: "idle", // "idle" | "loading" | "loaded" | "error"
    companies: [
        {
            "id": "bigworks",
            "company": "BigWorks",
            "mono": "BW",
            "role": "Software Development Engineer | AgentExchange Product Developer",
            "start": "2025-07-01",
            "end": null,
            "summary": "Building and enhancing Salesforce AppExchange products, including DocuMake, Contacto, and DocuVault, with a focus on full-stack development, document processing engines, large-scale Excel pipelines, and AI-powered features.",
            "tags": [
                "Salesforce",
                "Apex",
                "Lightning Web Components (LWC)",
                "Java",
                "JavaScript",
                "React",
                "Node.js",
                "AWS",
                "AI Agents",
                "RAG",
                "Applied AI"
            ],
            "highlights": [
                {
                    "id": "rag-pipeline-on-aws",
                    "type": "feature",
                    "area": "DocuVault",
                    "title": "Multi-Cloud RAG Pipelines and Document Intelligence",
                    "note": "Three RAG implementations with asynchronous indexing and reliable document-grounded Q&A.",
                    "challenge": "Enable context-aware question answering over user documents across cloud environments while ensuring only successfully indexed files are available for retrieval.",
                    "approach": "Implemented three RAG pipelines: a custom RAG solution, an Amazon Bedrock-based pipeline, and an Azure-based implementation. Integrated document submission, asynchronous indexing, event-driven notifications, and indexing-status synchronization with Salesforce to ensure Q&A requests use only successfully indexed documents.",
                    "outcome": "Enabled document-grounded AI question answering across three RAG implementations, with coordinated indexing workflows and Salesforce integration.",
                    "tech": [
                        "Retrieval-Augmented Generation (RAG)",
                        "AWS",
                        "Amazon Bedrock",
                        "Microsoft Azure",
                        "Event-Driven Architecture",
                        "Salesforce",
                        "Asynchronous Processing"
                    ],
                    "rank": 1,
                    "engineeringNotes": "PROBLEM: DocuVault needed AI-powered question answering over users' documents. I worked on three RAG implementations: a custom RAG pipeline, an Amazon Bedrock-based implementation, and an Azure-based implementation. The document workflow also needed to ensure that only indexed files were eligible for Q&A.\n\nWHY IT WAS DIFFICULT: Document submission and indexing were not instantaneous. The application needed to coordinate processing across cloud services, receive notifications when processing progressed or completed, and synchronize the indexing status back into Salesforce. Without that coordination, the Q&A workflow could attempt to use files that were not yet indexed.\n\nMY APPROACH: I implemented the three RAG approaches and integrated document submission, indexing workflows, event-driven notifications, and Salesforce status synchronization. The indexing status was used to determine which documents could be sent into the Q&A workflow.\n\nRESULT: Enabled document-grounded question answering through custom, AWS Bedrock, and Azure RAG implementations, with indexing-aware eligibility for Q&A.\n\nKEY LEARNING: An end-to-end RAG system requires more than an LLM and a retrieval step. Document ingestion, indexing completion, processing notifications, state synchronization, and retrieval eligibility must be coordinated. The specific retrieval, embedding, and vector-storage implementation differs by pipeline and should be documented separately where applicable."

                },            
                {
                    "id": "200-000-records-in-one-excel-file",
                    "type": "feature",
                    "area": "Excel Engine",
                    "title": "Large-Scale Excel Generation for 200K+ Records",
                    "note": "Scalable Excel exports beyond platform execution limits.",
                    "challenge": "Generating Excel files containing 200,000+ records exceeded platform query, memory, and execution constraints, making large exports difficult to process reliably.",
                    "approach": "Designed a distributed export pipeline combining Batch Apex for chunked data retrieval, AWS for off-platform processing, and a Java-based microservice to efficiently assemble and generate large Excel files outside the platform's resource constraints.",
                    "outcome": "Enabled reliable generation of Excel files containing 200,000+ records by distributing data retrieval, processing, and file generation across specialized components.",
                    "tech": [
                        "Batch Processing",
                        "Java",
                        "AWS",
                        "Microservices",
                        "Distributed Processing"
                    ],
                    "rank": 2,
                    "engineeringNotes": "PROBLEM: The product needed to generate one Excel file containing approximately 200,000 records. Retrieving the complete dataset and generating the workbook within Salesforce exceeded the platform's query, memory, and execution constraints.\n\nWHY IT WAS DIFFICULT: The process involved retrieving large amounts of data, producing intermediate XML files, transferring the data for further processing, and assembling everything into one Excel file. Performing the entire workflow within the original execution environment was not practical.\n\nMY APPROACH: I used Batch Apex to retrieve and process records in manageable chunks, producing approximately 800 XML files. I offloaded the processing to AWS and implemented a Java-based microservice to generate the final Excel file outside Salesforce's execution constraints.\n\nRESULT: Enabled generation of a single Excel file containing approximately 200,000 records through a distributed processing workflow.\n\nKEY LEARNING: When a workload exceeds the practical limits of one execution environment, separate data retrieval, intermediate processing, and final file generation so that each stage can operate within suitable resource constraints."

                }, 
                {
                    "id": "summaries-q-a-and-ocr",
                    "type": "feature",
                    "area": "DocuVault",
                    "title": "Multi-Region AI Document Processing Pipeline",
                    "note": "Asynchronous AI processing across AWS regions with model-aware document handling.",
                    "challenge": "Generating summaries for user-selected AI models involved documents stored across multiple AWS regions, regional data-transfer constraints, model compatibility requirements, and processing times exceeding the platform's synchronous callout limits.",
                    "approach": "Designed an event-driven, asynchronous processing pipeline using AWS Lambda to process documents within their respective regions using compatible, region-specific models. Implemented model selection, document compatibility checks, default-region model mapping, and reliable result handling to persist generated summaries back into the application.",
                    "outcome": "Enabled scalable, multi-region AI document summarization beyond synchronous execution limits, with model-aware processing and reliable end-to-end result handling.",
                    "tech": [
                        "AWS Lambda",
                        "Event-Driven Architecture",
                        "Multi-Region Processing",
                        "AI/LLM Integration",
                        "Apex",
                        "Asynchronous Workflows"
                    ],
                    "rank": 3,
                    "engineeringNotes": "PROBLEM: DocuVault supported multiple AI models in different AWS regions. Users could store files in different regions and select which model to use for summary generation. The workflow had to respect regional data-transfer constraints, model compatibility, and the platform's synchronous callout timeout when processing took more than 120 seconds.\n\nWHY IT WAS DIFFICULT: A model available in one region could not necessarily process a file stored in another region directly. The application also needed to determine whether the selected model supported the document type, map models to their appropriate default regions, and handle long-running processing without waiting for the entire operation synchronously.\n\nMY APPROACH: I designed an asynchronous, event-driven workflow using AWS Lambda to process documents in their respective regions with compatible models. I handled model selection, document compatibility checks, and default-region model mapping. The processing result was returned through the event workflow and stored back in Salesforce when available.\n\nRESULT: Enabled asynchronous AI summarization for user-selected models across multiple AWS regions while respecting regional constraints and avoiding dependence on a single long-running synchronous callout.\n\nKEY LEARNING: Long-running cloud operations should be designed around asynchronous processing and explicit completion handling. Regional availability and model compatibility must be considered before submitting a document for processing."

                },           
                {
                    "id": "beating-the-5-mb-heap-limit",
                    "type": "fix",
                    "area": "DocuMake",
                    "title": "Large File Processing Beyond Platform Limits",
                    "note": "Enabled 20 MB+ document processing despite strict platform memory constraints.",
                    "challenge": "Processing large DOCX files required Base64 decoding and XML transformation, but platform-imposed memory limits and the additional memory overhead of encoded data restricted file processing to approximately 5 MB.",
                    "approach": "Implemented chunk-based Base64 storage across multiple records and optimized data reconstruction using String.join to reduce intermediate memory allocations. Eliminated unnecessary file-data retrieval and optimized the processing workflow to minimize memory consumption.",
                    "outcome": "Enabled reliable processing of 20 MB+ documents by overcoming platform memory constraints through chunking and memory-efficient data reconstruction.",
                    "tech": [
                        "Apex",
                        "Memory Optimization",
                        "Base64 Encoding",
                        "Chunked Data Processing",
                        "XML Transformation"
                    ],
                    "rank": 4,
                    "engineeringNotes": "PROBLEM: The application needed to process DOCX files larger than approximately 5 MB. The workflow involved Base64-encoded file data, decoding it into a Blob, and performing further document processing and XML transformations. The platform's execution-memory constraints made this difficult because the encoded data and intermediate representations consumed additional memory.\n\nWHY IT WAS DIFFICULT: Initially, splitting the Base64 data into chunks and storing those chunks across multiple records addressed the storage side of the problem. However, reconstructing the chunks using repeated string concatenation still caused memory-limit errors.\n\nMY APPROACH: I changed the reconstruction strategy to use String.join instead of repeatedly concatenating strings. I also avoided unnecessary retrieval of large file-data fields and optimized how the chunks were stored and reconstructed.\n\nRESULT: Enabled processing of 20 MB+ documents despite the platform's memory constraints.\n\nKEY LEARNING: Chunking the input alone is not enough if reconstruction creates excessive intermediate allocations. The entire data lifecycle, from encoding and storage to reconstruction and decoding, must be considered."

                },            
                {
                    "id": "conditional-rendering-for-word-templates",
                    "type": "feature",
                    "area": "DocuMake",
                    "title": "XML-Based Conditional Rendering Engine",
                    "note": "Dynamic content rendering across complex Word document structures.",
                    "challenge": "Conditional rendering in DOCX templates was complicated by fragmented XML tags, deeply nested document elements, and content distributed across paragraphs and tables, where naive text replacement could corrupt document structure and formatting.",
                    "approach": "Engineered a custom conditional-rendering engine in Apex to parse fragmented Word XML, identify and evaluate conditional tags across complex document hierarchies, and dynamically render or remove content while preserving structural integrity, table layouts, and formatting.",
                    "outcome": "Enabled reliable, data-driven document generation across complex Word templates while maintaining document structure and formatting integrity.",
                    "tech": [
                        "Apex",
                        "Word XML",
                        "XML Parsing",
                        "Document Generation",
                        "Conditional Rendering"
                    ],
                    "rank": 5,
                    "engineeringNotes": "PROBLEM: DocuMake needed to show or hide document content based on conditions. The requirement included multi-line sections and entire tables, which went beyond the conditional behavior available through the existing Word template functionality.\n\nWHY IT WAS DIFFICULT: Conditional tags could be split across multiple XML elements and appear both inside and outside tables. Identifying the correct opening and closing tags and processing the content between them was complicated because the logical content range did not necessarily correspond to one continuous XML element. Naive replacement could break the XML hierarchy, table structure, or document formatting.\n\nMY APPROACH: I designed a custom conditional syntax and built an Apex-based rendering mechanism that identified and evaluated the tags, then rendered or removed the corresponding content. The implementation handled fragmented tags and conditional content within regular document content and tables while preserving the surrounding structure.\n\nRESULT: Enabled dynamic conditional rendering of multi-line content and complete tables in Word templates without disrupting document structure and formatting.\n\nKEY LEARNING: A conditional-rendering engine must correctly identify the content boundaries as well as evaluate the condition. The XML transformation must respect the document's hierarchy rather than relying on plain text replacement."

                },            
                {
                    "id": "one-query-instead-of-many",
                    "type": "fix",
                    "area": "DocuMake",
                    "title": "Query Consolidation and Data Processing Optimization",
                    "note": "Eliminated redundant database queries and optimized memory usage.",
                    "challenge": "The same data was repeatedly fetched to populate dynamic fields across multiple locations in DOCX templates, with query logic duplicated across XML files. This increased database calls, memory consumption, and the risk of exceeding platform execution limits.",
                    "approach": "Consolidated duplicate queries to retrieve the required data together and implemented structured parsing to map and populate values across multiple template locations, avoiding redundant data retrieval and processing.",
                    "outcome": "Reduced redundant database queries, optimized memory usage, improved maintainability, and mitigated execution limit issues.",
                    "tech": [
                        "Apex",
                        "SOQL",
                        "XML Parsing",
                        "Data Processing Optimization"
                    ],
                    "rank": 6,
                    "engineeringNotes": "PROBLEM: During dynamic DOCX generation, the same data was needed at multiple locations in the document. The corresponding SOQL query logic was repeated across multiple lines and XML template locations, even when the underlying query was the same.\n\nWHY IT WAS DIFFICULT: Every document location needed its own values, but executing the same database query repeatedly was wasteful. The repeated queries consumed the transaction's limited query budget and contributed to query-limit errors.\n\nMY APPROACH: I identified the repeated queries, consolidated them to retrieve the required data together, and implemented parsing and data mapping so the retrieved values could be reused wherever they were needed in the document.\n\nRESULT: Reduced duplicate queries, improved maintainability, and mitigated query-limit issues during document generation.\n\nKEY LEARNING: Separate data retrieval from data placement. Multiple output locations do not necessarily require multiple database queries."

                },
                {
                    "id": "google-drive-style-folder-sharing",
                    "type": "feature",
                    "area": "DocuVault",
                    "title": "Hierarchical File Management and Sharing",
                    "note": "Google Drive-style folder organization and user-level file sharing.",
                    "challenge": "Users needed a structured way to organize documents stored in AWS S3 into nested folders and securely share files with other users, while ensuring each user could access only their own files and files explicitly shared with them.",
                    "approach": "Implemented a Google Drive-style folder management and sharing system using Apex and Lightning Web Components, enabling users to organize files into hierarchical folders, share files with specific users, and access documents shared with them.",
                    "outcome": "Enabled structured document organization and user-level file sharing, providing a centralized experience for managing personal and shared files within the application.",
                    "tech": [
                        "Apex",
                        "Lightning Web Components",
                        "AWS S3",
                        "Access Control",
                        "Hierarchical Data Modeling"
                    ],
                    "rank": 7,
                    "engineeringNotes": "PROBLEM: Users stored documents in AWS S3 but needed a Google Drive-like experience within the application. They wanted nested folders, the ability to share files with other users, and a separate view of files shared with them.\n\nWHY IT WAS DIFFICULT: Access depended on both sharing relationships and the folder hierarchy. The system had to distinguish a user's own files from files shared by other users, handle nested folders, and respect restrictions when parent folders were not shared. Shared resources also needed to be discoverable through a Shared With Me view, including the indirect-access scenarios supported by the sharing model.\n\nMY APPROACH: I implemented hierarchical folder management and sharing using Apex and Lightning Web Components. I handled folder relationships and sharing-based visibility so users could organize their files, share content with other users, and view the resources available to them.\n\nRESULT: Delivered structured file management with nested folders, user-level sharing, and a dedicated view for shared resources.\n\nKEY LEARNING: Folder navigation and access control are separate concerns that must work together. A user should see resources according to the sharing rules and hierarchy, not merely because a file exists in storage."

                },
                {
                    "id": "misaligned-tables-in-pdfs",
                    "type": "fix",
                    "area": "DocuMake",
                    "title": "Resolved Table Alignment Issues in PDF Conversion",
                    "note": "Identified a platform-specific conversion limitation and implemented a reliable workaround.",
                    "challenge": "Tables were misaligned in generated PDFs despite the source Word documents having the expected layout. Initial investigation focused on application logic, but the issue persisted due to an edge case in the platform's built-in Word-to-PDF conversion.",
                    "approach": "Investigated multiple potential causes and tested alternative table formatting strategies. Identified a limitation in the conversion engine's handling of table alignment and implemented a workaround using a compatible Word XML table property to preserve the intended layout.",
                    "outcome": "Resolved the table alignment issue in generated PDFs and improved document rendering consistency through a targeted workaround for a platform-level limitation.",
                    "tech": [
                        "Word XML",
                        "PDF Generation",
                        "Root Cause Analysis",
                        "Platform Workarounds"
                    ],
                    "rank": 8,
                    "engineeringNotes": "PROBLEM: Tables appeared misaligned in PDFs generated from Word documents, even though the source documents had the expected layout. We initially suspected a problem in our own document-generation logic.\n\nWHY IT WAS DIFFICULT: Salesforce's built-in Word-to-PDF conversion had an edge case in how it handled table alignment. Table-level alignment was not being applied to the inner cells as expected. The issue took approximately three days of investigation because the source document could appear correct while the generated PDF was not.\n\nMY APPROACH: I investigated different possible causes and experimented with alternative table-formatting approaches. I eventually identified the conversion behavior and applied alignment at the individual cell level. I also explicitly set the cell widths using the Word XML property w:tcW, based on the column definitions in w:tblGrid.\n\nRESULT: Corrected the table alignment in the generated PDF by making the cell-level alignment and widths explicit.\n\nKEY LEARNING: When a transformation produces incorrect output, do not assume the source logic is necessarily responsible. Investigate the conversion process itself and find a compatible representation or workaround when the underlying engine has limitations."

                }
            ]
        },
        {
            "id": "sample-company",
            "company": "Sample Company",
            "mono": "SC",
            "role": "Software Engineer",
            "start": "2023-06-01",
            "end": "2025-06-30",
            "summary": "DUMMY ENTRY: replace with one or two lines about my role and what the team built.",
            "tags": [
                "Java",
                "Spring",
                "SQL"
            ],
            "highlights": [
                {
                    "id": "sample-feature-one",
                    "type": "feature",
                    "area": "Product",
                    "title": "Sample feature one",
                    "note": "Short one-line note",
                    "challenge": "Describe the need here.",
                    "approach": "Describe how I built it here.",
                    "outcome": "Describe the outcome here.",
                    "tech": [
                        "Java",
                        "Spring"
                    ],
                    "rank": 1
                },
                {
                    "id": "sample-fix-one",
                    "type": "fix",
                    "area": "Reliability",
                    "title": "Sample fix one",
                    "note": "Short one-line note",
                    "challenge": "Describe what was broken here.",
                    "approach": "Describe how I fixed it here.",
                    "outcome": "Describe the result here.",
                    "tech": [
                        "Debugging",
                        "SQL"
                    ],
                    "rank": 2
                },
                {
                    "id": "sample-feature-two",
                    "type": "feature",
                    "area": "Product",
                    "title": "Sample feature two",
                    "note": "Short one-line note",
                    "challenge": "Describe the need here.",
                    "approach": "Describe how I built it here.",
                    "outcome": "Describe the outcome here.",
                    "tech": [
                        "SQL",
                        "API"
                    ],
                    "rank": 3
                },
                {
                    "id": "sample-fix-two",
                    "type": "fix",
                    "area": "Reliability",
                    "title": "Sample fix two",
                    "note": "Short one-line note",
                    "challenge": "Describe what was broken here.",
                    "approach": "Describe how I fixed it here.",
                    "outcome": "Describe the result here.",
                    "tech": [
                        "Java",
                        "Testing"
                    ],
                    "rank": 4
                },
                {
                    "id": "sample-feature-three",
                    "type": "feature",
                    "area": "Product",
                    "title": "Sample feature three",
                    "note": "Short one-line note",
                    "challenge": "Describe the need here.",
                    "approach": "Describe how I built it here.",
                    "outcome": "Describe the outcome here.",
                    "tech": [
                        "React",
                        "API"
                    ],
                    "rank": 5
                },
                {
                    "id": "sample-fix-three-rank-6-hidden-on-landin",
                    "type": "fix",
                    "area": "Reliability",
                    "title": "Sample fix three (rank 6, hidden on landing)",
                    "note": "Short one-line note",
                    "challenge": "Describe what was broken here.",
                    "approach": "Describe how I fixed it here.",
                    "outcome": "Describe the result here.",
                    "tech": [
                        "Testing"
                    ],
                    "rank": 6
                }
            ]
        }
    ],
    error: null,
    openCompanyId: null,
};

const experienceSlice = createSlice({
    name: "experience",
    initialState,

    reducers: {
        setExperienceStatus: (state, action) => {
            state.status = action.payload;
            state.error = null;
        },

        setExperienceData: (state, action) => {
            state.companies = action.payload;
            state.status = "loaded";
            state.error = null;
        },

        setExperienceError: (state, action) => {
            state.status = "error";
            state.error = action.payload;
        },

        openCompany: (state, action) => {
            state.openCompanyId = action.payload;
        },

        closeCompany: (state) => {
            state.openCompanyId = null;
        },
    },
});

export const { setExperienceStatus, setExperienceData, setExperienceError, openCompany, closeCompany } = experienceSlice.actions;

export default experienceSlice.reducer;