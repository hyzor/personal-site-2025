import publicationsData from "@/data/publications.json";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

export function Publications() {
  return (
    <div className="mt-8 space-y-8 text-left">
      {publicationsData.map((publication) => (
        <article
          key={publication.title}
          className="rounded-2xl border border-default-200/60 p-5 sm:p-6"
        >
          <h3 className="text-xl font-semibold">{publication.title}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {publication.institution} •{" "}
            <time dateTime={publication.date}>
              {dateFormatter.format(new Date(publication.date))}
            </time>{" "}
            • {publication.description}
          </p>
          <div className="mt-4 space-y-3">
            {publication.body.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-gray-700 dark:text-gray-300">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
