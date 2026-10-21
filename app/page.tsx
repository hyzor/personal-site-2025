import { Button } from "@heroui/button";
import Image from "next/image";
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
    <>
      <Section
        className="-mt-14"
        headingLevel={1}
        id="home"
        showPanel={false}
        title="Jesper Falkenby"
        showScrollIndicator
      >
        <div className={subtitle({ class: "mt-2" })}>Full-Stack Developer</div>
        <div className="mt-8 flex justify-center">
          <Image
            alt="Jesper Falkenby - Full-Stack Developer"
            className="rounded-full w-64 h-64 object-cover"
            height={256}
            priority
            src="/profile.webp"
            width={256}
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
        <div className="mt-8 flex flex-wrap justify-center gap-4">
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
    </>
  );
}
