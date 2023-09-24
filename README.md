# Module Metrics

> A CLI for trustworthy module re-use

<!-- toc -->
- [🎯 Purpose](#-purpose)
- [🛠 Setup Instructions](#-setup-instructions)
- [📖 Usage](#-usage)
- [🔍 Metric Calculation](#-metric-calculation)
<!-- tocstop -->

## 🎯 Purpose
The purpose of this CLI is to determine the quality of NPM packages by using publically available data from GitHub. These metrics include BusFactor, Correctness, Ramp Up Time, Responsiveness Maintainer, and License all scored from [0,1], which are used to calculate a normalized total NetScore from [0,1].

## 🛠 Setup Instructions
Follow the steps below to get the `./run <URL_FILE>` command to work:

1. **Clone the repository and navigate to the root directory**:
    ```bash
    git clone https://github.com/yasmiins/ece461-npm-module-metrics.git
    cd ece461-npm-module-metrics
    ```

2. **Verify prerequisites**:
    - Make sure you have `Node.js` and `npm` installed. This project requires **Node.js version 14 or greater**. Check with:
        ```bash
        node -v
        npm -v
        ```

3. **Environment variable setup**:
    - Obtain a [GitHub Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic).
    - Rename `.env-example` to `.env`.
    - Add your token to the end of `GITHUB_TOKEN=` in the `.env` file.

4. **Installation**:
    ```bash
    ./run install
    ```
## 🚀 Usage

**Command**:

```bash
./run <URL_FILE>
```

### 1. Specifying the URL File (`<URL_FILE>`)

- Your input should be a **plain text file** with each URL on a new line.
- The `<URL_FILE>` should point to the absolute location of this file.
> There is a sample file located in the root project directory: sample-url-file.txt. 
### 2. Supported URL Types

Your file can contain URLs from:

- **npmjs.com domain**. Example:
    ```
    https://www.npmjs.com/package/even
    ```
- **Directly from GitHub**. Example:
    ```plaintext
    https://github.com/jonschlinkert/even
    ```

    > **Note**: If using npmjs.com URLs, ensure the module is linked to a GitHub repository.

### 3. Output Format

- Upon execution, you'll receive an output in **NDJSON format**.
- Each output row will showcase the `URL` along with scores for the following metrics: `BusFactor`, `Correctness`, `RampUp`, `ResponsiveMaintainer`, `License`, and `NetScore`.


## 🔍 Metric Calculation

### 1. Bus Factor
The Bus Factor metric measures the risk associated with the number of contributors who are responsible for 50% of the code in a repository. If this number is 0, a score of 0 is assigned. Otherwise, the final score is calculated as the number of these contributors divided by the total number of contributors.

### 2. Correctness
The correctness score is calculated based on the number of opened, closed, and merged requests, as well as the number of opened and closed issues, and the total sums of requests and issues.

#### Issues (50% of Score)
- If there are no open or closed issues, a score of 0.5 is assigned.
- If this is not the case, a higher score is added as the ratio of closed to open issues increases, ranging from 0.38 to 0.5.
- If the ratio is less than 1, the percentage of open issues to total issues is checked and assigned a score from 0.1 to 0.25.

#### Pull Requests (50% of Score)
- If there are no open, merged, or closed requests, a score of 0.5 is assigned.
- If this is not the case, a higher score is added as the ratio of merged and closed requests to open requests increases, ranging from 0.38 to 0.5.
- If the ratio is less than 1, the percentage of open requests to total requests is checked and assigned a score from 0.1 to 0.25.

### 3 .Ramp Up Time
The Ramp Up Time metric consists of two components: the existence and length of the Readme and the length of time between the last Readme update and the last commit. These components are added for the final Ramp Up Time Score.

#### Readme Length (50% of Score)
- If there is no Readme, a final score of 0 is assigned.
- For Readmes longer than 0 and shorter than 1000 characters, a score of 0.25 is added.
- For Readmes longer than 1000 characters, a score of 0.5 is added to the final score.

#### Time Difference (50% of Score)
- The length of time is judged based on the difference between the last Readme update and the last commit, on a scale ranging from 0 to 1 year, corresponding to a score of 0 to 0.5 being added to the final score.

### 4. Responsiveness Maintainer
This metric uses the average time taken for issues to be solved and evaluates it using an exponential decay function with a decay rate of 30 days, which is then normalized to fall within the range [0, 1].

### 5. License
This metric is a score of either 0 or 1, depending on whether or not the GitHub repo provided has a license.

### 6. NetScore
The final NetScore is calculated using the following weights for the metrics added together, resulting in a score ranging from [0, 1]:
- Responsiveness Maintainer Score * 0.28
- Bus Factor * 0.28
- Ramp Up Time * 0.22
- Correctness * 0.22

This is multiplied by the License Score. If the license is not verified, the entire NetScore is 0. If it is verified, the NetScore is multiplied by 1.
