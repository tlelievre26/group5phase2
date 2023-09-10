# Module Metrics

> A CLI for trustworthy module re-use

<!-- toc -->
- [🎯 Purpose](#-purpose)
- [🛠 Setup Instructions](#-setup-instructions)
- [📖 Usage](#-usage)
- [🔍 Metric Calculation](#-metric-calculation)
<!-- tocstop -->

## 🎯 Purpose
he purpose of this CLI is to determine the quality of NPM packages by using publically available data from GitHub. These metrics include BusFactor, Correctness, Ramp Up Time, Responsiveness Maintainer, and License all scored from [0,1], which are used to calculate a normalized total NetScore.

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
...


