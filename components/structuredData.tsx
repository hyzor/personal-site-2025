import { siteConfig } from "@/config/site";

export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: "Full-Stack Developer",
    description: siteConfig.description,
    url: siteConfig.url,
    image: `${siteConfig.url}/profile.webp`,
    email: siteConfig.links.email.replace(/^mailto:/, ""),
    sameAs: [siteConfig.links.github, siteConfig.links.linkedin],
    knowsAbout: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Java",
      "Kotlin",
      "AWS",
      "Terraform",
      "Full-Stack Development",
      "Software Engineering",
      "Web Development",
      "Cloud Computing",
    ],
    worksFor: {
      "@type": "Organization",
      name: "Kambi",
    },
    alumniOf: [
      {
        "@type": "EducationalOrganization",
        name: "Uppsala University",
      },
      {
        "@type": "EducationalOrganization",
        name: "Blekinge Institute of Technology",
      },
      {
        "@type": "EducationalOrganization",
        name: "Seoul National University",
      },
    ],
  };

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}
