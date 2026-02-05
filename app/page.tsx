import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { subtitle } from "@/components/primitives";
import { Section } from "@/components/section";
import { Publications } from "@/components/publications";
import { GithubIcon, LinkedInIcon, MailIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import aboutData from "@/data/about.json";
import ResumeViewer from "@/components/resumeViewer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Full-Stack Developer | Software Engineer",
  description:
    "Jesper Falkenby - Full-Stack Developer specializing in JavaScript, TypeScript, React, Node.js, Java, and cloud technologies. Explore my portfolio, publications, and professional experience.",
};

export default function Home() {
  return (
    <main>
      <Section
        className="-mt-16"
        headingLevel={1}
        id="home"
        title="Jesper Falkenby"
        showScrollIndicator
      >
        <div className={subtitle({ class: "mt-2" })}>Full-Stack Developer</div>
        <div className="mt-8 flex justify-center">
          <Avatar
            alt="Jesper Falkenby - Full-Stack Developer"
            className="w-64 h-64"
            src="/profile.webp"
          />
        </div>
      </Section>
      <Section headingLevel={2} id="resume" title="Résumé">
        <div className="mt-8 flex justify-center">
          <ResumeViewer />
        </div>
      </Section>
      <Section headingLevel={2} id="publications" title="Publications">
        <Publications />
      </Section>
      <Section headingLevel={2} id="about" title="About">
        <div className="mt-8 space-y-4">
          {aboutData.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Section>
      <Section headingLevel={2} id="contact" title="Contact">
        <div className="flex gap-4 mt-8">
          <Button
            as="a"
            href={siteConfig.links.github}
            rel="noopener noreferrer"
            size="lg"
            startContent={<GithubIcon size={24} />}
            target="_blank"
          >
            GitHub
          </Button>
          <Button
            as="a"
            href={siteConfig.links.linkedin}
            rel="noopener noreferrer"
            size="lg"
            startContent={<LinkedInIcon size={24} />}
            target="_blank"
          >
            LinkedIn
          </Button>
          <Button
            as="a"
            href={siteConfig.links.email}
            size="lg"
            startContent={<MailIcon size={24} />}
          >
            Email
          </Button>
        </div>
      </Section>
    </main>
  );
}
