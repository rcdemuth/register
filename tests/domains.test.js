const t = require("ava");
const fs = require("fs-extra");
const path = require("path");

const domainsPath = path.resolve("domains");
const files = fs.readdirSync(domainsPath);

/**
 * Helper function to determine if a subdomain is a root domain.
 * A root domain is assumed to be exactly two parts (e.g., "is-cool.dev").
 */
function isRootDomain(domain) {
    return domain.split(".").length === 2;
}

t("Nested subdomains should not exist without a parent subdomain", (t) => {
    files.forEach((file) => {
        // Skip directories and process only .json files
        const filePath = path.join(domainsPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            return; // Skip directories
        }

        const subdomain = file.replace(/\.json$/, "");

        if (subdomain.split(".").length > 2) {
            // Get parent domain by removing the leftmost part
            const parentSubdomain = subdomain.split(".").slice(1).join(".");
            
            // Skip check if the parent subdomain is a root domain
            if (isRootDomain(parentSubdomain)) {
                return;
            }

            // Ensure the parent subdomain exists
            t.true(
                files.includes(`${parentSubdomain}.json`),
                `${file}: Parent subdomain ${parentSubdomain}.json does not exist`
            );
        }
    });

    t.pass();
});

t("Nested subdomains should not exist if the parent subdomain has NS records", (t) => {
    files.forEach((file) => {
        // Skip directories and process only .json files
        const filePath = path.join(domainsPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            return; // Skip directories
        }

        const subdomain = file.replace(/\.json$/, "");

        if (subdomain.split(".").length > 2) {
            // Get parent domain by removing the leftmost part
            const parentSubdomain = subdomain.split(".").slice(1).join(".");
            const parentFilePath = path.join(domainsPath, `${parentSubdomain}.json`);

            // Skip check if the parent subdomain is a root domain
            if (isRootDomain(parentSubdomain)) {
                return;
            }

            // Check if the parent file exists before attempting to read it
            if (fs.existsSync(parentFilePath)) {
                const parentDomain = fs.readJsonSync(parentFilePath);

                // Check if the parent has NS records
                t.is(
                    parentDomain.record.NS,
                    undefined,
                    `${file}: Parent subdomain ${parentSubdomain} has NS records`
                );
            } else {
                t.fail(`${parentSubdomain}.json file does not exist`);
            }
        }
    });

    t.pass();
});