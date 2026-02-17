interface Employer {
  name: string;
}

interface WorkplaceAddress {
  municipality?: string;
}

interface JobAd {
  id: string;
  headline: string;
  publication_date: string;
  employer: Employer;
  workplace_address: WorkplaceAddress;
}

interface JobSearchResponse {
  hits: JobAd[];
}

function parseSearchQuery(input: string): { profession: string; city: string } {
  const parts = input.split(" in ");
  return {
    profession: parts[0]?.trim() || "",
    city: parts[1]?.trim() || ""
  };
}

class Job {
  constructor(public title: string, public company: string, public city: string) {}

  toString(): string {
    return `${this.title} at ${this.company} in ${this.city}`;
  }
}

const searchJobs = async (input: string): Promise<void> => {
  try {
    const { profession, city } = parseSearchQuery(input);

    const url = `https://jobsearch.api.jobtechdev.se/search?q=${encodeURIComponent(profession)}&offset=0&limit=10&municipality=${encodeURIComponent(city)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = (await response.json()) as JobSearchResponse;

    if (data.hits.length === 0) {
      console.log("No jobs found.");
      return;
    }

    console.log(`\nFound ${data.hits.length} jobs`);
    console.log("-".repeat(50));

    console.dir(data.hits[0], { depth: 2 });

    data.hits.forEach((job, index) => {
      const pubDate = new Date(job.publication_date);
      const jobObject = new Job(
        job.headline,
        job.employer?.name || "Unknown company",
        job.workplace_address?.municipality || "Unknown location"
      );

      console.log(`${index + 1}. ${jobObject.toString()}`);
      console.log(`Publication: ${pubDate.toISOString().split("T")[0]}`);
      console.log("-".repeat(50));
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error while fetching jobs:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
};

const runApp = (): void => {
  try {
    const input = process.argv[2] || "Software Developer in Helsingborg";
    console.log("Welcome to the Job Search App!");
    console.log(`Searching for jobs: '${input}'`);

    searchJobs(input);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("App error:", error.message);
    } else {
      console.error("Unexpected app error:", error);
    }
  }
};

runApp();
