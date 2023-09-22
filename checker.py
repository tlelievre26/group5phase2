import subprocess as sp
import sys
import json
import os
import re
from helper import *


# This helper function will print the output of the subprocess
def print_output(output: str):
    print(f"{RED}Command Output:{RESET}\n{output}\n{RED}End of Output{RESET}\n")


# This should test the command './run install'
# The command should install any required dependencies in user-land
# The command should exit 0 on success, and non-zero on failure
def run_install() -> int:
    install_rc: bool
    test_suite_rc: bool
    url_file_rc: bool

    install = CLI_CMD_WRAPPER("./run install")
    test_suite = CLI_CMD_WRAPPER("./run test")
    url_file = CLI_CMD_WRAPPER("./run one-url.txt")

    install_rc, output = install.run()
    test_suite_rc, output = test_suite.run()
    url_file_rc, output = url_file.run()
    total_correct = install_rc + test_suite_rc + url_file_rc

    if install_rc:
        print(f"{GREEN}> Install command exited successfully!{RESET}")
    else:
        print(f"{RED}> Install command failed to exit successfully!{RESET}")
    
    if test_suite_rc:
        print(f"{GREEN}> Subsequent test command exited successfully!{RESET}")
    else:
        print(f"{RED}> Subsequent test command failed to exit successfully!{RESET}")
    
    if url_file_rc:
        print(f"{GREEN}> Subsequent URL_FILE command exited successfully!{RESET}")
    else:
        print(f"{RED}> Subsequent URL_FILE command failed to exit successfully!{RESET}")

    return total_correct

# This should test the command './run URL_FILE' where URL_FILE is the absolute location of a file
# containing a list of an ASCII-encoded newline-delimited set of URLs
# These URLs may be in the npmjs.com domain or come directly from GitHub
# This invocation should produce NDJSON output to stdout of the format:
# {"URL":"https://github.com/nullivex/nodist", "NET_SCORE":0.9, "RAMP_UP_SCORE":0.12345, "CORRECTNESS_SCORE":0.123, "BUS_FACTOR_SCORE":0.00345, "RESPONSIVE_MAINTAINER_SCORE":0.1, "LICENSE_SCORE":1}
# Each score should be in the range [0,1] where 0 is the worst and 1 is the best
# The NET_SCORE is the weighted average of the other scores, and should be be in the range [0,1]
# Each score should have up to 5 decimal places of precision, with no trailing zeroes
# The command should exit 0 on success, and non-zero on failure
def run_urlfile() -> int:
    url_file = CLI_CMD_WRAPPER("./run one-url.txt")
    url_file_rc, output = url_file.run()
    is_valid_output: bool
    total_correct = 0

    if url_file_rc is True:
        total_correct += 1
        print(f"{GREEN}> URL_FILE command exited successfully.{RESET}")
    else:
        print(f"{RED}> URL_FILE command failed to exit successfully.{RESET}")
        return 0

    try:
        ndjson_obj = json.loads(output)
        if "URL" in ndjson_obj \
        and "NET_SCORE" in ndjson_obj \
        and "RAMP_UP_SCORE" in ndjson_obj \
        and "CORRECTNESS_SCORE" in ndjson_obj \
        and "BUS_FACTOR_SCORE" in ndjson_obj \
        and "RESPONSIVE_MAINTAINER_SCORE" in ndjson_obj \
        and "LICENSE_SCORE" in ndjson_obj:
            is_valid_output = True
        else:
            is_valid_output = False
    except Exception as e:
        is_valid_output = False

    if is_valid_output is True:
        total_correct += 1
        print(f"{GREEN}> URL_FILE output is valid NDJSON.{RESET}")
    else:
        print(f"{RED}> URL_FILE output is not valid NDJSON.{RESET}")
        return total_correct
    
    module_score = MODULE_SCORE(output)
    if module_score.is_valid():
        total_correct += 1
        print(f"{GREEN}> URL_FILE output is a valid module score.{RESET}")
    else:
        print(f"{RED}> URL_FILE output is not a valid module score.{RESET}")
    
    os.environ["LOG_FILE"] = ""
    url_file = CLI_CMD_WRAPPER("./run one-url.txt")
    url_file_rc, output = url_file.run()
    if url_file_rc is False:
        total_correct += 1
        print(f"{GREEN}> URL_FILE command failed to exit successfully when LOG_FILE is not set.{RESET}")
    else:
        print(f"{RED}> URL_FILE command exited successfully when LOG_FILE is not set.{RESET}")

    os.environ["LOG_FILE"] = "/tmp/log"
    os.environ["GITHUB_TOKEN"] = ""
    url_file = CLI_CMD_WRAPPER("./run one-url.txt")
    url_file_rc, output = url_file.run()
    if url_file_rc is False:
        total_correct += 1
        print(f"{GREEN}> URL_FILE command failed to exit successfully when GITHUB_TOKEN is not set.{RESET}")
    else:
        print(f"{RED}> URL_FILE command exited successfully when GITHUB_TOKEN is not set.{RESET}")
    
    return total_correct

def run_test_suite() -> int:
    test_suite = CLI_CMD_WRAPPER("./run test")
    test_suite_rc, output = test_suite.run()

    # Logging the command's output.
    print_output("Command Output:")
    print_output(output)

    # Logging the return code (Success or Failure).
    print(f"Command Return Code: {test_suite_rc}")

    if test_suite_rc is False:
        print(f"{RED}Test suite failed to run.{RESET}")
        return 0

    total_correct = 0
    test_suite_regex = re.compile(r"(\d+)\/(\d+) test cases passed. (\d+)% line coverage achieved.", flags=re.IGNORECASE)

    test_suite_match = test_suite_regex.match(output)
    if test_suite_match:
        total_correct += 1
        print(f"{GREEN}> Test suite output is in the correct format.{RESET}")
    else:
        print(f"{RED}> Test suite output is not in the correct format.{RESET}")
        return total_correct

    results = test_suite_regex.findall(output)
    print_output("Regex Matched Groups:")
    print_output(results)

    total_tests = int(results[0][1])
    line_coverage = int(results[0][2])
    print(f"Extracted Values - Total Tests: {total_tests}, Line Coverage: {line_coverage}%")

    if total_tests >= 20:
        total_correct += 1
        print(f"{GREEN}> Test suite contains 20 or more test cases.{RESET}")
    else:
        print(f"{RED}> Test suite contains less than 20 test cases.{RESET}")

    if line_coverage >= 80:
        total_correct += 2
        print(f"{GREEN}> Test suite achieved 80% or greater line coverage.{RESET}")
    elif line_coverage >= 60:
        print(f"{YELLOW}> Test suite achieved 60% or greater line coverage.{RESET}")
    else:
        print(f"{RED}> Test suite achieved less than 60% line coverage.{RESET}")

    return total_correct


# Suggestions:
# - The success of ./run install can really only be tested indirectly by running the other commands
# - Consider bundling a copy of the sample URL_FILE we provide in this repo, then either determing its
#   absolute path at runtime, or using a relative path to it
# - Note the difference between what is output to stdout and what is supposed to be returned from each command
def main():
    
    #Setup ENV for testing
    os.environ['GITHUB_TOKEN'] = "INSERT VALID TOKEN HERE"
    os.environ['LOG_LEVEL'] = "0"
    os.environ['LOG_FILE'] = "/tmp/log"
    
    # Run install test
    print(f"{BOLD}{BLUE}Testing './run install'...{RESET}")
    total_correct = run_install()
    print(f"{BOLD}{YELLOW if total_correct < 3 else GREEN} {total_correct} / 3 tests passed.{RESET}\n")

    # Run test_suite test
    print(f"{BOLD}{BLUE}Testing './run test'...{RESET}")
    total_correct = run_test_suite()
    print(f"{BOLD}{YELLOW if total_correct < 4 else GREEN} {total_correct} / 4 tests passed.{RESET}\n")

    # Run url_file test
    print(f"{BOLD}{BLUE}Testing './run URL_FILE'...{RESET}")
    total_correct = run_urlfile()
    print(f"{BOLD}{YELLOW if total_correct < 5 else GREEN} {total_correct} / 5 tests passed.{RESET}\n")

if __name__ == "__main__":
    main()

